"""
Multi-Platform Product Research Agent
Searches TikTok, AliExpress, Instagram, and Amazon for winning dropshipping products
"""

import os
from typing import Optional, Dict, Any, List
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

from app.tools.tiktok_search import TikTokSearchTool
from app.tools.aliexpress_search import AliExpressSearchTool
from app.tools.instagram_search import InstagramSearchTool
from app.tools.amazon_search import AmazonSearchTool
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class ProductResearchAgent:
    """LangChain agent for multi-platform product research using OpenAI or local Ollama LLM"""
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434", model: str = "phi3"):
        """
        Initialize the product research agent with OpenAI or local Ollama
        
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
                num_ctx=4096
            )
        
        # Initialize platform search tools
        self.tiktok_tool = TikTokSearchTool()
        self.aliexpress_tool = AliExpressSearchTool()
        self.instagram_tool = InstagramSearchTool()
        self.amazon_tool = AmazonSearchTool()
        
        # Create tool list
        self.tools = [
            self.tiktok_tool,
            self.aliexpress_tool,
            self.instagram_tool,
            self.amazon_tool
        ]
        
        # Create system prompt for product research
        self.system_prompt = """You are an expert dropshipping product researcher specializing in finding winning products across multiple platforms.

Your task is to research products across TikTok, AliExpress, Instagram, and Amazon to identify winning dropshipping opportunities.

Use the available tools to gather information:
- tiktok_search: Search TikTok for trending products, viral content, hashtags, and engagement. Use query parameter.
- aliexpress_search: Search AliExpress for supplier prices, order counts, ratings, and product data. Use query parameter, optionally sort_by ("orders", "price", "rating").
- instagram_search: Search Instagram for product hashtags, influencer posts, engagement metrics. Use query parameter, optionally search_type ("hashtag", "account", "post").
- amazon_search: Search Amazon for product prices, ratings, reviews, and market data. Use query parameter, optionally sort_by ("relevance", "price", "rating", "reviews").

When researching a product:
1. Search all platforms (TikTok, AliExpress, Instagram, Amazon)
2. Analyze trends, engagement, and demand signals
3. Compare prices across platforms
4. Identify market opportunities
5. Provide actionable insights

Format your response as Markdown with these sections:
- **Product Overview**
- **Platform Analysis** (TikTok, AliExpress, Instagram, Amazon)
- **Market Opportunity**
- **Pricing Analysis**
- **Demand Indicators**
- **Recommendations**

Be thorough, data-driven, and provide specific metrics when available."""
        
        # Create agent using the new API (returns a graph)
        self.agent_graph = create_agent(
            model=self.llm,
            tools=self.tools,
            system_prompt=self.system_prompt,
            debug=False
        )
    
    def research_product(
        self, 
        query: str,
        platforms: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Research a product across multiple platforms
        
        Args:
            query: Product name or search query
            platforms: Optional list of platforms to search (default: all)
            
        Returns:
            Dictionary with research results in Markdown format
        """
        try:
            logger.info(f"Starting multi-platform product research for: {query}")
            
            # Construct the research prompt
            research_prompt = f"""Research this product across multiple platforms: "{query}"

Please:
1. Search TikTok for trending content, viral videos, and engagement metrics
2. Search AliExpress for supplier prices, order counts, and product availability
3. Search Instagram for hashtags, influencer posts, and engagement
4. Search Amazon for market prices, ratings, reviews, and demand indicators
5. Analyze the data to identify if this is a winning dropshipping product
6. Provide comprehensive insights with specific metrics

Be thorough and search all platforms to get a complete picture."""
            
            if platforms:
                research_prompt += f"\n\nFocus on these platforms: {', '.join(platforms)}"
            
            # For phi3 and models that don't support tools, use direct tool calls
            # For models that support tools (llama3, mistral), use agent graph
            try:
                # Try agent graph first (for models that support tools)
                result = self.agent_graph.invoke({
                    "messages": [("human", research_prompt)]
                })
                
                # Extract and format the response
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
            except Exception as agent_error:
                # Fallback: If agent fails (e.g., model doesn't support tools), call tools directly
                error_str = str(agent_error)
                if "does not support tools" in error_str or "tool" in error_str.lower():
                    logger.info(f"Model doesn't support tools, using direct tool calls: {error_str[:100]}")
                    agent_output = self._research_with_direct_tools(query, platforms)
                else:
                    # Re-raise if it's a different error
                    raise
            
            return {
                "success": True,
                "query": query,
                "research": {
                    "markdown_report": agent_output,
                    "analyzed_at": self._get_timestamp()
                }
            }
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Error in product research: {str(e)}")
            logger.error(f"Traceback: {error_details}")
            error_msg = str(e) if str(e) else "Unknown error occurred during research"
            return {
                "success": False,
                "error": f"Product research failed: {error_msg}",
                "query": query
            }
    
    def _research_with_direct_tools(self, query: str, platforms: Optional[List[str]] = None) -> str:
        """Fallback method: Call tools directly and use LLM to synthesize results"""
        try:
            results = []
            
            # Determine which platforms to search
            search_platforms = platforms if platforms else ["tiktok", "aliexpress", "instagram", "amazon"]
            
            # Call tools directly
            if "tiktok" in search_platforms:
                tiktok_result = self.tiktok_tool._run(query, max_results=5)
                results.append(f"## TikTok Results\n{tiktok_result}\n")
            
            if "aliexpress" in search_platforms:
                aliexpress_result = self.aliexpress_tool._run(query, max_results=5)
                results.append(f"## AliExpress Results\n{aliexpress_result}\n")
            
            if "instagram" in search_platforms:
                instagram_result = self.instagram_tool._run(query, max_results=5)
                results.append(f"## Instagram Results\n{instagram_result}\n")
            
            if "amazon" in search_platforms:
                amazon_result = self.amazon_tool._run(query, max_results=5)
                results.append(f"## Amazon Results\n{amazon_result}\n")
            
            # Combine results
            combined_data = "\n".join(results)
            
            # Use LLM to synthesize the results into a report
            synthesis_prompt = f"""Based on the following product research data across multiple platforms, create a comprehensive analysis in Markdown format.

Product Query: "{query}"

Research Data:
{combined_data}

Please provide a comprehensive product research report in Markdown format with these sections:
1. **Product Overview**
2. **Platform Analysis** (TikTok, AliExpress, Instagram, Amazon)
3. **Market Opportunity**
4. **Pricing Analysis**
5. **Demand Indicators**
6. **Recommendations**

Be thorough, data-driven, and provide actionable insights."""
            
            # Call LLM directly for synthesis
            response = self.llm.invoke(synthesis_prompt)
            if hasattr(response, 'content'):
                return response.content
            elif isinstance(response, str):
                return response
            else:
                return str(response)
                
        except Exception as e:
            logger.error(f"Error in direct tool research: {str(e)}")
            return f"# Product Research Report\n\n## Query: {query}\n\nError occurred during research: {str(e)}\n\nPlease try again or check if Ollama is running."
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()

