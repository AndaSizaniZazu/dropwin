"""
LangChain Agent for Product Analysis
Uses local Ollama LLM to analyze products
"""

import os
from typing import Optional, Dict, Any
from langchain.agents import create_agent
try:
    from langchain_ollama import ChatOllama
except ImportError:
    from langchain_community.chat_models import ChatOllama

try:
    from langchain_openai import ChatOpenAI
except ImportError:
    ChatOpenAI = None

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv

from app.tools.web_scraper import WebScraperTool
from app.tools.shopify_api import ShopifyAPITool
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class ProductAnalyzerAgent:
    """LangChain agent for analyzing products using OpenAI or local Ollama LLM"""
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434", model: str = "phi3"):
        """
        Initialize the product analyzer agent with OpenAI or local Ollama
        
        Args:
            ollama_base_url: Base URL for Ollama API (default: http://localhost:11434)
            model: Ollama model name (default: phi3)
        """
        self.ollama_base_url = ollama_base_url
        self.model = model
        
        # Try OpenAI first (it's more reliable), then fall back to Ollama
        openai_api_key = os.getenv("OPENAI_API_KEY")
        use_openai = openai_api_key and ChatOpenAI is not None
        
        if use_openai:
            logger.info("Initializing with OpenAI API")
            self.llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.7,
                api_key=openai_api_key
            )
        else:
            logger.info(f"Initializing with Ollama ({model})")
            # Initialize LLM with local Ollama
            self.llm = ChatOllama(
                model=model,
                base_url=ollama_base_url,
                temperature=0.7,
                num_ctx=4096  # Context window size
            )
        
        # Initialize tools
        self.web_scraper = WebScraperTool()
        self.shopify_api = ShopifyAPITool()
        
        # Create tool list
        self.tools = [
            self.web_scraper,
            self.shopify_api
        ]
        
        # Create system prompt for product analysis
        self.system_prompt = """You are an expert e-commerce product analyst specializing in product research and analysis.

Your task is to analyze products and provide comprehensive insights in Markdown format with the following exact sections:

1. **Product Overview**
2. **Market Analysis**
3. **Competitive Analysis**
4. **Pricing Strategy**
5. **Target Audience**
6. **Marketing Opportunities**
7. **Recommendations**

Use the available tools to gather information:
- web_scraper: Scrape product pages and extract information. Call with url and extract_type ("all", "store_info", "products", "pricing")
- shopify_api: Get product data, store info, and search products. Call with store_url, action ("get_store_info", "get_products", "get_product_details", "search_products"), and optional product_handle or query

Always format your response as clean Markdown with proper headers and sections."""
        
        # Create agent using the new API (returns a graph)
        self.agent_graph = create_agent(
            model=self.llm,
            tools=self.tools,
            system_prompt=self.system_prompt,
            debug=False
        )
    
    def analyze_product(
        self, 
        product_name: str, 
        product_url: Optional[str] = None,
        product_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze a product using the LangChain agent with local Ollama
        
        Args:
            product_name: Name of the product to analyze
            product_url: Optional URL of the product page
            product_description: Optional description of the product
            
        Returns:
            Dictionary with analysis results in Markdown format
        """
        try:
            logger.info(f"Starting product analysis for: {product_name}")
            
            # Construct the analysis prompt
            analysis_prompt = f"""Analyze the following product:

**Product Name:** {product_name}
"""
            
            if product_description:
                analysis_prompt += f"**Product Description:** {product_description}\n"
            
            if product_url:
                analysis_prompt += f"**Product URL:** {product_url}\n"
                analysis_prompt += "\nPlease scrape the product URL to gather detailed information about the product, pricing, and store context.\n"
            
            analysis_prompt += """
Provide a comprehensive product analysis in Markdown format with these exact sections:

1. **Product Overview**
2. **Market Analysis**
3. **Competitive Analysis**
4. **Pricing Strategy**
5. **Target Audience**
6. **Marketing Opportunities**
7. **Recommendations**

Be thorough, data-driven, and provide actionable insights."""
            
            # Run the agent using the new graph API
            result = self.agent_graph.invoke({
                "messages": [("human", analysis_prompt)]
            })
            
            # Extract and format the response from the new API format
            messages = result.get("messages", [])
            agent_output = ""
            for msg in reversed(messages):
                if hasattr(msg, 'content'):
                    agent_output = msg.content
                    break
                elif isinstance(msg, dict) and 'content' in msg:
                    agent_output = msg['content']
                    break
            
            if not agent_output:
                agent_output = str(result)
            
            return {
                "success": True,
                "product_name": product_name,
                "analysis": {
                    "markdown_report": agent_output,
                    "analyzed_at": self._get_timestamp()
                }
            }
            
        except Exception as e:
            logger.error(f"Error in product analysis: {str(e)}")
            return {
                "success": False,
                "error": f"Product analysis failed: {str(e)}",
                "product_name": product_name
            }
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()

