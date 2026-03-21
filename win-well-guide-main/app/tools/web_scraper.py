"""
Web Scraper Tool for LangChain Agent
Scrapes store pages and extracts product information
"""

from typing import Optional, Dict, Any
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
import requests
from bs4 import BeautifulSoup
import re
import logging

logger = logging.getLogger(__name__)


class WebScraperInput(BaseModel):
    """Input schema for web scraper tool"""
    url: str = Field(description="The URL of the webpage to scrape")
    extract_type: str = Field(
        default="all",
        description="Type of data to extract: 'all', 'products', 'store_info', 'pricing'"
    )


class WebScraperTool(BaseTool):
    """Tool for scraping web pages and extracting store/product information"""
    
    name: str = "web_scraper"
    description: str = """
    Scrapes web pages to extract store information, product details, pricing, and metadata.
    Use this tool to:
    - Extract store title, description, and metadata
    - Get product information from product pages
    - Extract pricing information
    - Get store structure and navigation
    """
    args_schema: type[BaseModel] = WebScraperInput
    
    def _run(self, url: str, extract_type: str = "all") -> str:
        """Execute the web scraping"""
        try:
            logger.info(f"Scraping URL: {url} (extract_type: {extract_type})")
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            if extract_type == "store_info":
                return self._extract_store_info(soup, url)
            elif extract_type == "products":
                return self._extract_products(soup, url)
            elif extract_type == "pricing":
                return self._extract_pricing(soup, url)
            else:
                # Extract all information
                store_info = self._extract_store_info(soup, url)
                products = self._extract_products(soup, url)
                pricing = self._extract_pricing(soup, url)
                
                return f"""
STORE INFORMATION:
{store_info}

PRODUCTS FOUND:
{products}

PRICING INFORMATION:
{pricing}
"""
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return f"Error scraping URL: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return f"Error: {str(e)}"
    
    def _extract_store_info(self, soup: BeautifulSoup, url: str) -> str:
        """Extract basic store information"""
        info = {
            "url": url,
            "title": soup.find('title').get_text(strip=True) if soup.find('title') else "Unknown",
            "meta_description": "",
            "has_https": url.startswith("https"),
            "response_time": "N/A"
        }
        
        # Extract meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            info["meta_description"] = meta_desc.get('content', '')
        
        # Try to find Shopify-specific information
        shopify_info = soup.find('script', type='application/json', id='shopify-features')
        if shopify_info:
            info["platform"] = "Shopify"
        
        return f"""
Title: {info['title']}
Description: {info['meta_description']}
HTTPS: {info['has_https']}
Platform: {info.get('platform', 'Unknown')}
"""
    
    def _extract_products(self, soup: BeautifulSoup, url: str) -> str:
        """Extract product information from the page"""
        products = []
        
        # Look for common product selectors (Shopify, WooCommerce, etc.)
        product_selectors = [
            {'class': 'product-item'},
            {'class': 'product-card'},
            {'class': 'product'},
            {'data-product-id': True},
        ]
        
        for selector in product_selectors:
            product_elements = soup.find_all('div', selector)
            if product_elements:
                for elem in product_elements[:10]:  # Limit to 10 products
                    product = {
                        "name": "",
                        "price": "",
                        "url": ""
                    }
                    
                    # Extract product name
                    name_elem = elem.find(['h2', 'h3', 'h4', 'a'], class_=re.compile(r'product.*title|product.*name', re.I))
                    if not name_elem:
                        name_elem = elem.find('a', href=re.compile(r'/products/'))
                    if name_elem:
                        product["name"] = name_elem.get_text(strip=True)
                        if name_elem.get('href'):
                            product["url"] = name_elem['href']
                    
                    # Extract price
                    price_elem = elem.find(['span', 'div'], class_=re.compile(r'price', re.I))
                    if price_elem:
                        product["price"] = price_elem.get_text(strip=True)
                    
                    if product["name"]:
                        products.append(product)
                break
        
        if not products:
            return "No products found on this page. This might be a homepage or category page."
        
        result = f"Found {len(products)} products:\n"
        for i, product in enumerate(products, 1):
            result += f"{i}. {product['name']} - {product['price']}\n"
            if product['url']:
                result += f"   URL: {product['url']}\n"
        
        return result
    
    def _extract_pricing(self, soup: BeautifulSoup, url: str) -> str:
        """Extract pricing information"""
        pricing_info = []
        
        # Look for price elements
        price_elements = soup.find_all(['span', 'div'], class_=re.compile(r'price', re.I))
        
        prices = []
        for elem in price_elements:
            price_text = elem.get_text(strip=True)
            # Extract numeric price
            price_match = re.search(r'[\$£€]?(\d+\.?\d*)', price_text)
            if price_match:
                prices.append(price_text)
        
        if prices:
            unique_prices = list(set(prices))[:5]  # Get unique prices, limit to 5
            return f"Found pricing information: {', '.join(unique_prices)}"
        
        return "No pricing information found on this page."
    
    async def _arun(self, url: str, extract_type: str = "all") -> str:
        """Async version of the tool"""
        return self._run(url, extract_type)


