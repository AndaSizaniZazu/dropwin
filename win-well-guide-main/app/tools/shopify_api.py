"""
Shopify API Tool for LangChain Agent
Interacts with Shopify stores via their API and GraphQL endpoints
"""

from typing import Optional, Dict, Any, List
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
import requests
import re
import logging
import json

logger = logging.getLogger(__name__)


class ShopifyAPIInput(BaseModel):
    """Input schema for Shopify API tool"""
    store_url: str = Field(description="The Shopify store URL (e.g., https://store.myshopify.com)")
    action: str = Field(
        description="Action to perform: 'get_products', 'get_store_info', 'get_product_details', 'search_products'"
    )
    product_handle: Optional[str] = Field(
        default=None,
        description="Product handle/slug for product-specific actions"
    )
    query: Optional[str] = Field(
        default=None,
        description="Search query for product search"
    )


class ShopifyAPITool(BaseTool):
    """Tool for interacting with Shopify stores via their public API"""
    
    name: str = "shopify_api"
    description: str = """
    Interacts with Shopify stores to get product information, store details, and search products.
    Use this tool to:
    - Get store information and metadata
    - Retrieve product listings
    - Get detailed product information
    - Search for specific products
    - Analyze product pricing and availability
    """
    args_schema: type[BaseModel] = ShopifyAPIInput
    
    def _extract_shop_domain(self, url: str) -> str:
        """Extract shop domain from URL"""
        # Remove protocol and path
        domain = re.sub(r'^https?://', '', url)
        domain = domain.split('/')[0]
        
        # Remove .myshopify.com if present, we'll add it back
        if domain.endswith('.myshopify.com'):
            return domain
        elif '.myshopify.com' not in domain:
            # If it's a custom domain, try to find the shop name
            # For now, return as-is
            return domain
        
        return domain
    
    def _get_shopify_api_url(self, store_url: str, endpoint: str) -> str:
        """Construct Shopify API URL"""
        domain = self._extract_shop_domain(store_url)
        
        if not domain.endswith('.myshopify.com'):
            # Try to access via custom domain - Shopify stores usually have API at /admin/api
            # But public API is at /products.json, /collections.json, etc.
            base_url = f"https://{domain}"
        else:
            base_url = f"https://{domain}"
        
        return f"{base_url}{endpoint}"
    
    def _run(
        self,
        store_url: str,
        action: str,
        product_handle: Optional[str] = None,
        query: Optional[str] = None
    ) -> str:
        """Execute the Shopify API call"""
        try:
            logger.info(f"Shopify API call: {action} for {store_url}")
            
            if action == "get_store_info":
                return self._get_store_info(store_url)
            elif action == "get_products":
                return self._get_products(store_url)
            elif action == "get_product_details" and product_handle:
                return self._get_product_details(store_url, product_handle)
            elif action == "search_products" and query:
                return self._search_products(store_url, query)
            else:
                return f"Invalid action: {action}. Available actions: get_store_info, get_products, get_product_details, search_products"
                
        except Exception as e:
            logger.error(f"Error in Shopify API tool: {str(e)}")
            return f"Error: {str(e)}"
    
    def _get_store_info(self, store_url: str) -> str:
        """Get basic store information"""
        try:
            # Try to access the store's JSON API
            api_url = self._get_shopify_api_url(store_url, "/products.json?limit=1")
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return f"""
Store is accessible via Shopify API.
Found products endpoint: Yes
Store appears to be a Shopify store.
"""
            else:
                # Try to get info from HTML
                html_response = requests.get(store_url, headers=headers, timeout=10)
                if html_response.status_code == 200:
                    return f"""
Store URL: {store_url}
Status: Accessible
Platform: Likely Shopify (checking HTML structure)
"""
                return f"Store returned status code: {response.status_code}"
                
        except Exception as e:
            return f"Error getting store info: {str(e)}"
    
    def _get_products(self, store_url: str, limit: int = 10) -> str:
        """Get list of products from store"""
        try:
            api_url = self._get_shopify_api_url(store_url, f"/products.json?limit={limit}")
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                products = data.get('products', [])
                
                if not products:
                    return "No products found in store."
                
                result = f"Found {len(products)} products:\n\n"
                for i, product in enumerate(products, 1):
                    result += f"{i}. {product.get('title', 'Unknown')}\n"
                    result += f"   Handle: {product.get('handle', 'N/A')}\n"
                    result += f"   ID: {product.get('id', 'N/A')}\n"
                    
                    variants = product.get('variants', [])
                    if variants:
                        price = variants[0].get('price', 'N/A')
                        result += f"   Price: ${price}\n"
                    
                    result += f"   URL: {store_url}/products/{product.get('handle', '')}\n\n"
                
                return result
            else:
                return f"Could not access products API. Status: {response.status_code}"
                
        except Exception as e:
            return f"Error getting products: {str(e)}"
    
    def _get_product_details(self, store_url: str, product_handle: str) -> str:
        """Get detailed information about a specific product"""
        try:
            api_url = self._get_shopify_api_url(store_url, f"/products/{product_handle}.json")
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                product = data.get('product', {})
                
                if not product:
                    return f"Product '{product_handle}' not found."
                
                result = f"""
Product: {product.get('title', 'Unknown')}
Description: {product.get('body_html', 'N/A')[:200]}...
Product Type: {product.get('product_type', 'N/A')}
Vendor: {product.get('vendor', 'N/A')}
Tags: {', '.join(product.get('tags', []))}

Variants:
"""
                for variant in product.get('variants', []):
                    result += f"  - {variant.get('title', 'Default')}: ${variant.get('price', '0')} "
                    result += f"(Available: {variant.get('available', False)})\n"
                
                return result
            else:
                return f"Could not access product. Status: {response.status_code}"
                
        except Exception as e:
            return f"Error getting product details: {str(e)}"
    
    def _search_products(self, store_url: str, query: str) -> str:
        """Search for products"""
        try:
            # Shopify doesn't have a direct search API endpoint, so we'll get products and filter
            api_url = self._get_shopify_api_url(store_url, "/products.json?limit=50")
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                products = data.get('products', [])
                
                # Filter products by query
                query_lower = query.lower()
                matching_products = [
                    p for p in products
                    if query_lower in p.get('title', '').lower() or
                       query_lower in p.get('product_type', '').lower() or
                       query_lower in ' '.join(p.get('tags', [])).lower()
                ]
                
                if not matching_products:
                    return f"No products found matching '{query}'"
                
                result = f"Found {len(matching_products)} products matching '{query}':\n\n"
                for i, product in enumerate(matching_products, 1):
                    result += f"{i}. {product.get('title', 'Unknown')}\n"
                    variants = product.get('variants', [])
                    if variants:
                        price = variants[0].get('price', 'N/A')
                        result += f"   Price: ${price}\n"
                    result += f"   URL: {store_url}/products/{product.get('handle', '')}\n\n"
                
                return result
            else:
                return f"Could not search products. Status: {response.status_code}"
                
        except Exception as e:
            return f"Error searching products: {str(e)}"
    
    async def _arun(
        self,
        store_url: str,
        action: str,
        product_handle: Optional[str] = None,
        query: Optional[str] = None
    ) -> str:
        """Async version of the tool"""
        return self._run(store_url, action, product_handle, query)


