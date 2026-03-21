"""
Store Analyzer - Direct Python API for analyzing e-commerce stores
This module provides a simple function to analyze stores when called from the frontend
"""

import requests
import re
import logging
from typing import Dict, Optional, Tuple
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
LOVABLE_API_KEY = os.getenv("LOVABLE_API_KEY")
AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions"
AI_MODEL = "google/gemini-2.5-flash"


def validate_store_url(url: str) -> Tuple[bool, str]:
    """Validate that the provided URL is a valid store URL"""
    if not url or not isinstance(url, str):
        return False, "Invalid URL provided"

    # Check if it's a valid URL format
    url_pattern = r'^https?://[a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=]+'
    if not re.match(url_pattern, url):
        return False, "URL must start with http:// or https://"

    return True, "Valid URL"


def fetch_store_data(store_url: str) -> Dict:
    """Fetch and analyze store data from the provided URL"""
    logger.info(f"Fetching store data from: {store_url}")

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(store_url, headers=headers, timeout=10)
        response.raise_for_status()

        html_content = response.text

        # Extract basic store information
        store_data = {
            "url": store_url,
            "status_code": response.status_code,
            "response_time": response.elapsed.total_seconds(),
            "title": _extract_title(html_content),
            "meta_description": _extract_meta_description(html_content),
            "has_https": store_url.startswith("https"),
        }

        return store_data

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching store: {str(e)}")
        return {
            "error": f"Failed to fetch store: {str(e)}",
            "url": store_url,
        }


def _extract_title(html: str) -> str:
    """Extract page title from HTML"""
    match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
    return match.group(1) if match else "Unknown"


def _extract_meta_description(html: str) -> str:
    """Extract meta description from HTML"""
    match = re.search(
        r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']',
        html,
        re.IGNORECASE,
    )
    return match.group(1) if match else ""


def analyze_with_ai(store_url: str, store_data: Dict) -> Dict:
    """Use AI to analyze the store and provide detailed recommendations"""
    logger.info(f"Analyzing store with AI: {store_url}")

    if not LOVABLE_API_KEY:
        return {"error": "LOVABLE_API_KEY is not configured"}

    system_prompt = """You are an expert e-commerce store auditor specializing in Shopify and dropshipping stores.

Analyze stores for conversion rate optimization and provide actionable feedback.

For each audit, evaluate and score (1-100) these areas:
1. Homepage & First Impression
2. Product Pages
3. Trust Signals & Social Proof
4. Checkout Experience
5. Mobile Optimization
6. Site Speed Indicators
7. Navigation & UX
8. Branding & Design Consistency

Provide:
- Overall Score (1-100)
- Top 5 Critical Issues (ranked by impact)
- Top 5 Quick Wins (easy improvements)
- Detailed recommendations for each area
- Competitor comparison insights if relevant

Be specific with actionable advice."""

    user_prompt = f"""Audit this e-commerce store:

Store URL: {store_url}
Store Title: {store_data.get('title', 'Unknown')}
Meta Description: {store_data.get('meta_description', 'N/A')}
Response Time: {store_data.get('response_time', 'N/A')}s
HTTPS Enabled: {store_data.get('has_https', False)}

Provide a comprehensive CRO (Conversion Rate Optimization) audit with specific, actionable recommendations."""

    try:
        response = requests.post(
            AI_GATEWAY_URL,
            headers={
                "Authorization": f"Bearer {LOVABLE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": AI_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            },
            timeout=30,
        )

        if response.status_code == 429:
            return {"error": "Rate limit exceeded. Please try again later.", "status": 429}

        if response.status_code == 402:
            return {"error": "AI credits exhausted. Please add funds.", "status": 402}

        if not response.ok:
            error_text = response.text
            logger.error(f"AI gateway error: {response.status_code}, {error_text}")
            return {"error": f"Store audit failed: {response.status_code}", "status": response.status_code}

        data = response.json()
        audit_content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        # Extract overall score from AI response
        score_match = re.search(r'Overall Score[:\s]*(\d+)', audit_content, re.IGNORECASE)
        overall_score = int(score_match.group(1)) if score_match else None

        return {
            "audit": audit_content,
            "overall_score": overall_score,
            "timestamp": datetime.now().isoformat(),
        }

    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling AI gateway: {str(e)}")
        return {"error": f"AI analysis failed: {str(e)}"}


def analyze_store(store_url: str, store_name: Optional[str] = None) -> Dict:
    """
    Main function to analyze a store and return comprehensive results.
    
    This function connects to a store, fetches its data, and performs AI-powered analysis.
    Call this function when the analyze button is clicked.
    
    Args:
        store_url (str): The URL of the store to analyze (e.g., "https://example.myshopify.com")
        store_name (str, optional): Optional name for the store
        
    Returns:
        Dict: Analysis results with the following structure:
            {
                "success": bool,
                "url": str,
                "store_info": {
                    "title": str,
                    "meta_description": str,
                    "response_time_seconds": float,
                    "https_enabled": bool
                },
                "analysis": {
                    "overall_score": int (1-100),
                    "audit_report": str,
                    "analyzed_at": str (ISO timestamp)
                },
                "error": str (only present if success is False)
            }
    
    Example:
        >>> result = analyze_store("https://example.myshopify.com")
        >>> if result["success"]:
        ...     print(f"Score: {result['analysis']['overall_score']}")
        ...     print(result['analysis']['audit_report'])
    """
    logger.info(f"Starting store analysis for: {store_url}")
    
    # Validate URL
    is_valid, validation_msg = validate_store_url(store_url)
    if not is_valid:
        return {
            "success": False,
            "error": validation_msg,
            "url": store_url
        }

    # Fetch store data
    store_data = fetch_store_data(store_url)
    if "error" in store_data:
        return {
            "success": False,
            "error": store_data["error"],
            "url": store_url
        }

    # Analyze with AI
    ai_analysis = analyze_with_ai(store_url, store_data)
    if "error" in ai_analysis:
        return {
            "success": False,
            "error": ai_analysis.get("error"),
            "url": store_url,
            "status": ai_analysis.get("status"),
        }

    # Combine all data into final report
    report = {
        "success": True,
        "url": store_url,
        "store_info": {
            "title": store_data.get("title"),
            "meta_description": store_data.get("meta_description"),
            "response_time_seconds": store_data.get("response_time"),
            "https_enabled": store_data.get("has_https"),
        },
        "analysis": {
            "overall_score": ai_analysis.get("overall_score"),
            "audit_report": ai_analysis.get("audit"),
            "analyzed_at": ai_analysis.get("timestamp"),
        },
    }

    logger.info(f"Store analysis completed successfully for: {store_url}")
    return report


# Example usage when run directly
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python analyze_store.py <store_url>")
        print("Example: python analyze_store.py https://example.myshopify.com")
        sys.exit(1)
    
    store_url = sys.argv[1]
    print(f"\n🔬 Analyzing store: {store_url}")
    print("=" * 70)
    
    result = analyze_store(store_url)
    
    if result.get("success"):
        print("\n✅ Analysis Complete!")
        print(f"\n📊 Store: {result['store_info']['title']}")
        print(f"🎯 Overall Score: {result['analysis']['overall_score']}")
        print(f"\n📄 Audit Report:")
        print("-" * 70)
        print(result['analysis']['audit_report'])
    else:
        print(f"\n❌ Analysis Failed: {result.get('error')}")

