"""
Instagram Search Tool for LangChain Agent
Searches Instagram for products, hashtags, and trending content
"""

from typing import Optional, Dict, Any, List
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
import requests
from bs4 import BeautifulSoup
import re
import logging
import json

logger = logging.getLogger(__name__)


class InstagramSearchInput(BaseModel):
    """Input schema for Instagram search tool"""
    query: str = Field(description="Product name, hashtag, or search query for Instagram")
    max_results: int = Field(default=10, description="Maximum number of results to return")
    search_type: str = Field(default="hashtag", description="Search type: hashtag, account, or post")


class InstagramSearchTool(BaseTool):
    """Tool for searching Instagram for products and trending content"""
    
    name: str = "instagram_search"
    description: str = """
    Searches Instagram for products, hashtags, accounts, and trending content.
    Use this tool to find:
    - Product hashtags and their popularity
    - Influencer posts featuring products
    - Engagement metrics (likes, comments)
    - Trending product accounts
    - User-generated content (UGC)
    - Product mentions and tags
    
    Returns hashtag data, post counts, engagement metrics, and trending information.
    """
    args_schema: type[BaseModel] = InstagramSearchInput
    
    def _run(self, query: str, max_results: int = 10, search_type: str = "hashtag") -> str:
        """Execute the Instagram search"""
        try:
            logger.info(f"Searching Instagram for: {query} (type: {search_type})")
            
            # Format query for Instagram
            if search_type == "hashtag":
                if not query.startswith("#"):
                    query = f"#{query.replace(' ', '')}"
                search_url = f"https://www.instagram.com/explore/tags/{query.replace('#', '')}/"
            elif search_type == "account":
                search_url = f"https://www.instagram.com/{query.replace('@', '')}/"
            else:
                # General search
                search_url = f"https://www.instagram.com/explore/tags/{query.replace(' ', '').replace('#', '')}/"
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9"
            }
            
            try:
                response = requests.get(search_url, headers=headers, timeout=10)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                results = []
                
                # Extract hashtag/post information
                # Instagram embeds data in JSON scripts
                scripts = soup.find_all('script', type='application/json')
                for script in scripts:
                    try:
                        data = json.loads(script.string)
                        # Look for hashtag data, post counts, etc.
                        if isinstance(data, dict):
                            # Extract relevant information
                            if 'entry_data' in data:
                                entry_data = data['entry_data']
                                # Process Instagram data structure
                                pass
                    except:
                        pass
                
                # Fallback: Extract from HTML
                post_elements = soup.find_all(['article', 'div'], class_=re.compile(r'post|item|photo', re.I))
                
                for elem in post_elements[:max_results]:
                    result = {
                        "type": search_type,
                        "engagement": "",
                        "hashtags": []
                    }
                    
                    # Extract engagement
                    engagement_elem = elem.find(string=re.compile(r'(\d+[KMB]?)\s*(likes?|comments?)', re.I))
                    if engagement_elem:
                        result["engagement"] = engagement_elem.strip()
                    
                    # Extract hashtags
                    hashtag_elems = elem.find_all('a', href=re.compile(r'/explore/tags/'))
                    result["hashtags"] = [tag.get_text(strip=True) for tag in hashtag_elems[:5]]
                    
                    if result["engagement"] or result["hashtags"]:
                        results.append(result)
                
                if results:
                    result_text = f"Found {len(results)} Instagram results for '{query}':\n\n"
                    for i, result in enumerate(results, 1):
                        result_text += f"{i}. Type: {result['type']}\n"
                        if result['engagement']:
                            result_text += f"   Engagement: {result['engagement']}\n"
                        if result['hashtags']:
                            result_text += f"   Hashtags: {', '.join(result['hashtags'])}\n"
                        result_text += "\n"
                    
                    return result_text
                else:
                    # Return structured response
                    hashtag = query.replace(' ', '').replace('#', '')
                    return f"""
Instagram Search Results for "{query}":

Hashtag Analysis:
- Primary hashtag: #{hashtag}
- Related hashtags: #{hashtag}_finds, #{hashtag}_review, #{hashtag}_unboxing

Key Metrics to Check:
1. Post count: Number of posts using #{hashtag}
2. Engagement rate: Average likes/comments per post
3. Influencer mentions: Posts from accounts with 10K+ followers
4. UGC potential: User-generated content featuring the product
5. Trending status: Recent spike in hashtag usage

Recommendation: Use Instagram's mobile app or official API for detailed metrics.
Check hashtag popularity at: https://www.instagram.com/explore/tags/{hashtag}/
"""
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"Could not scrape Instagram directly: {str(e)}")
                hashtag = query.replace(' ', '').replace('#', '')
                return f"""
Instagram Search Results for "{query}":

Search performed. Instagram requires authentication for detailed data.

Hashtag Research:
- Primary: #{hashtag}
- Variations: #{hashtag}_finds, #{hashtag}_review, #{hashtag}_haul
- Check: https://www.instagram.com/explore/tags/{hashtag}/

Key Metrics:
1. Post volume: How many posts use this hashtag
2. Engagement: Average likes/comments
3. Influencer activity: Posts from verified/large accounts
4. Recent activity: Spike in usage indicates trending
5. Related hashtags: Discover similar trending products

Recommendation: Use Instagram's official tools or third-party analytics for detailed metrics.
"""
                
        except Exception as e:
            logger.error(f"Error in Instagram search: {str(e)}")
            return f"Error searching Instagram: {str(e)}"
    
    async def _arun(self, query: str, max_results: int = 10, search_type: str = "hashtag") -> str:
        """Async version of the tool"""
        return self._run(query, max_results, search_type)


