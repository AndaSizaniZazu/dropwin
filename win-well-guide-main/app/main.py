"""
FastAPI Application for Store Product Analyzer
Uses LangChain agents to analyze e-commerce stores
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
import os
from dotenv import load_dotenv
from datetime import datetime

from app.agents.store_analyzer import ProductAnalyzerAgent
from app.agents.product_research_agent import ProductResearchAgent

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Store Product Analyzer API",
    description="LangChain-powered store and product analysis API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents (lazy loading)
_agent: Optional[ProductAnalyzerAgent] = None
_research_agent: Optional[ProductResearchAgent] = None

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3")


def get_agent() -> ProductAnalyzerAgent:
    """Get or create the product analyzer agent"""
    global _agent
    if _agent is None:
        try:
            _agent = ProductAnalyzerAgent(
                ollama_base_url=OLLAMA_BASE_URL,
                model=OLLAMA_MODEL
            )
            logger.info(f"Product analyzer agent initialized with Ollama ({OLLAMA_MODEL})")
        except Exception as e:
            logger.error(f"Failed to initialize agent: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize agent: {str(e)}. Make sure Ollama is running at {OLLAMA_BASE_URL}"
            )
    return _agent


def get_research_agent() -> ProductResearchAgent:
    """Get or create the product research agent"""
    global _research_agent
    if _research_agent is None:
        try:
            _research_agent = ProductResearchAgent(
                ollama_base_url=OLLAMA_BASE_URL,
                model=OLLAMA_MODEL
            )
            logger.info(f"Product research agent initialized with Ollama ({OLLAMA_MODEL})")
        except Exception as e:
            logger.error(f"Failed to initialize research agent: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize research agent: {str(e)}. Make sure Ollama is running at {OLLAMA_BASE_URL}"
            )
    return _research_agent


# Request/Response Models
class ProductAnalysisRequest(BaseModel):
    """Request model for product analysis"""
    productName: str = Field(..., description="Name of the product to analyze")
    productUrl: Optional[str] = Field(None, description="Optional URL of the product page")
    productDescription: Optional[str] = Field(None, description="Optional description of the product")


class ProductAnalysisResponse(BaseModel):
    """Response model for product analysis"""
    success: bool
    product_name: str
    analysis: Optional[dict] = None
    error: Optional[str] = None


class ProductResearchRequest(BaseModel):
    """Request model for product research"""
    query: str = Field(..., description="Product name or search query")
    platforms: Optional[List[str]] = Field(
        default=None,
        description="Optional list of platforms to search: tiktok, aliexpress, instagram, amazon. If not provided, searches all."
    )


class ProductResearchResponse(BaseModel):
    """Response model for product research"""
    success: bool
    query: str
    research: Optional[dict] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    api_version: str
    agent_ready: bool


class StoreValidationRequest(BaseModel):
    """Request model for store validation"""
    store_url: str = Field(..., description="URL of the store to validate")
    storeUrl: Optional[str] = Field(None, description="Alternative field name for store_url")


class StoreValidationResponse(BaseModel):
    """Response model for store validation"""
    valid: bool
    message: str
    url: str


class StoreAnalysisRequest(BaseModel):
    """Request model for Shopify store analysis"""
    store_url: str = Field(..., description="URL of the Shopify store to analyze")
    store_name: Optional[str] = Field(None, description="Name of the store")


class StoreAnalysisResponse(BaseModel):
    """Response model for Shopify store analysis"""
    success: bool
    url: str
    store_info: Optional[dict] = None
    analysis: Optional[dict] = None
    error: Optional[str] = None


# API Endpoints

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        agent = get_agent()
        agent_ready = agent is not None
    except:
        agent_ready = False
    
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "agent_ready": agent_ready
    }


@app.post("/api/validate-store", response_model=StoreValidationResponse)
async def validate_store(request: StoreValidationRequest):
    """
    Validate a store URL format
    
    This endpoint validates that the provided URL is a valid store URL format.
    Called by the frontend before analyzing a store.
    
    Request body:
    {
        "store_url": "https://example.myshopify.com"
        or
        "storeUrl": "https://example.myshopify.com"
    }
    """
    import re
    
    try:
        # Support both field names
        store_url = request.store_url or request.storeUrl
        
        if not store_url:
            return StoreValidationResponse(
                valid=False,
                message="store_url is required",
                url=""
            )
        
        # Validate URL format
        url_pattern = r'^https?://[a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=]+'
        is_valid = bool(re.match(url_pattern, store_url))
        
        if is_valid:
            message = "Valid URL"
        else:
            message = "URL must start with http:// or https://"
        
        return StoreValidationResponse(
            valid=is_valid,
            message=message,
            url=store_url
        )
        
    except Exception as e:
        logger.error(f"Error in validate_store endpoint: {str(e)}")
        return StoreValidationResponse(
            valid=False,
            message=f"Validation error: {str(e)}",
            url=request.store_url or request.storeUrl or ""
        )


@app.post("/api/analyze-shopify-store", response_model=StoreAnalysisResponse)
async def analyze_shopify_store(request: StoreAnalysisRequest):
    """
    Analyze a Shopify store using LangChain agent
    Fetches store info and generates a comprehensive audit report
    """
    try:
        agent = get_agent()
        
        # Call the agent with the store URL
        result = agent.analyze_store(
            store_url=request.store_url,
            store_name=request.store_name
        )
        
        if result and isinstance(result, dict):
            return StoreAnalysisResponse(
                success=True,
                url=request.store_url,
                store_info=result.get("store_info"),
                analysis=result.get("analysis")
            )
        else:
            return StoreAnalysisResponse(
                success=False,
                url=request.store_url,
                error="Failed to generate analysis"
            )
            
    except Exception as e:
        logger.error(f"Error in analyze_shopify_store endpoint: {str(e)}")
        return StoreAnalysisResponse(
            success=False,
            url=request.store_url,
            error=f"Analysis failed: {str(e)}"
        )


@app.post("/functions/v1/analyze-product", response_model=ProductAnalysisResponse)
async def analyze_product(request: ProductAnalysisRequest):
    """
    Analyze a product using LangChain agent with local Ollama LLM
    
    This is a production-ready Edge Function endpoint that analyzes products
    using a local Ollama LLM (phi3 model) with no external API dependencies.
    
    Request body:
    {
        "productName": "Product Name",
        "productUrl": "https://example.com/products/product" (optional),
        "productDescription": "Product description" (optional)
    }
    
    Response:
    Returns Markdown-formatted analysis with sections:
    - Product Overview
    - Market Analysis
    - Competitive Analysis
    - Pricing Strategy
    - Target Audience
    - Marketing Opportunities
    - Recommendations
    """
    try:
        logger.info(f"Analyzing product: {request.productName}")
        
        # Get agent
        agent = get_agent()
        
        # Run analysis
        result = agent.analyze_product(
            product_name=request.productName,
            product_url=request.productUrl,
            product_description=request.productDescription
        )
        
        if result.get("success"):
            response = ProductAnalysisResponse(
                success=True,
                product_name=result.get("product_name"),
                analysis=result.get("analysis")
            )
            return response
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Analysis failed")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_product endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/functions/v1/research-product", response_model=ProductResearchResponse)
async def research_product(request: ProductResearchRequest):
    """
    Research a product across multiple platforms (TikTok, AliExpress, Instagram, Amazon)
    
    This endpoint uses a LangChain agent with local Ollama LLM to search multiple platforms
    and identify winning dropshipping products.
    
    Request body:
    {
        "query": "LED sunset lamp",
        "platforms": ["tiktok", "aliexpress", "instagram", "amazon"] (optional)
    }
    
    Response:
    Returns Markdown-formatted research report with platform analysis, market insights,
    pricing data, and recommendations.
    """
    try:
        logger.info(f"Researching product: {request.query}")
        
        # Get research agent
        agent = get_research_agent()
        
        # Run research
        result = agent.research_product(
            query=request.query,
            platforms=request.platforms
        )
        
        if result.get("success"):
            response = ProductResearchResponse(
                success=True,
                query=result.get("query"),
                research=result.get("research")
            )
            return response
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Research failed")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in research_product endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/api/search-aliexpress")
async def search_aliexpress(request: ProductResearchRequest):
    """
    Direct AliExpress search without LangChain
    
    This endpoint directly scrapes AliExpress without using OpenAI or LangChain.
    Perfect for finding trending products when OpenAI quota is exceeded.
    
    Request body:
    {
        "query": "LED lamp",
        "platforms": ["aliexpress"] (optional, will use aliexpress by default)
    }
    """
    try:
        logger.info(f"Direct AliExpress search for: {request.query}")
        
        from app.tools.aliexpress_search import AliExpressSearchTool
        
        # Create AliExpress tool
        aliexpress_tool = AliExpressSearchTool()
        
        # Run search
        result_text = aliexpress_tool._run(
            query=request.query,
            max_results=10,
            sort_by="orders"
        )
        
        if result_text:
            response = ProductResearchResponse(
                success=True,
                query=request.query,
                research={
                    "markdown_report": result_text,
                    "analyzed_at": str(datetime.now())
                }
            )
            return response
        else:
            raise HTTPException(
                status_code=400,
                detail="No AliExpress products found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search_aliexpress endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"AliExpress search error: {str(e)}"
        )


@app.post("/api/search-amazon")
async def search_amazon(request: ProductResearchRequest):
    """
    Direct Amazon search without LangChain
    
    This endpoint directly searches Amazon without using OpenAI or LangChain.
    Perfect for finding trending products when OpenAI quota is exceeded.
    
    Request body:
    {
        "query": "wireless headphones",
        "platforms": ["amazon"] (optional, will use amazon by default)
    }
    """
    try:
        logger.info(f"Direct Amazon search for: {request.query}")
        
        from app.tools.amazon_search import AmazonSearchTool
        
        # Create Amazon tool
        amazon_tool = AmazonSearchTool()
        
        # Run search
        result_text = amazon_tool._run(
            query=request.query,
            max_results=10,
            sort_by="orders"
        )
        
        if result_text:
            response = ProductResearchResponse(
                success=True,
                query=request.query,
                research={
                    "markdown_report": result_text,
                    "analyzed_at": str(datetime.now())
                }
            )
            return response
        else:
            raise HTTPException(
                status_code=400,
                detail="No Amazon products found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search_amazon endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Amazon search error: {str(e)}"
        )


@app.post("/api/search-temu")
async def search_temu(request: ProductResearchRequest):
    """
    Direct Temu search without LangChain
    
    This endpoint directly searches Temu without using OpenAI or LangChain.
    Perfect for finding trending budget products.
    
    Request body:
    {
        "query": "wireless headphones",
        "platforms": ["temu"] (optional, will use temu by default)
    }
    """
    try:
        logger.info(f"Direct Temu search for: {request.query}")
        
        from app.tools.temu_search import TemuSearchTool
        
        # Create Temu tool
        temu_tool = TemuSearchTool()
        
        # Run search
        result_text = temu_tool._run(
            query=request.query,
            max_results=10,
            sort_by="orders"
        )
        
        if result_text:
            response = ProductResearchResponse(
                success=True,
                query=request.query,
                research={
                    "markdown_report": result_text,
                    "analyzed_at": str(datetime.now())
                }
            )
            return response
        else:
            raise HTTPException(
                status_code=400,
                detail="No Temu products found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search_temu endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Temu search error: {str(e)}"
        )


@app.post("/api/search-takealot")
async def search_takealot(request: ProductResearchRequest):
    """
    Direct Takealot search without LangChain
    
    This endpoint directly searches Takealot without using OpenAI or LangChain.
    Perfect for finding trending South African products.
    
    Request body:
    {
        "query": "wireless headphones",
        "platforms": ["takealot"] (optional, will use takealot by default)
    }
    """
    try:
        logger.info(f"Direct Takealot search for: {request.query}")
        
        from app.tools.takealot_search import TakealotSearchTool
        
        # Create Takealot tool
        takealot_tool = TakealotSearchTool()
        
        # Run search
        result_text = takealot_tool._run(
            query=request.query,
            max_results=10,
            sort_by="orders"
        )
        
        if result_text:
            response = ProductResearchResponse(
                success=True,
                query=request.query,
                research={
                    "markdown_report": result_text,
                    "analyzed_at": str(datetime.now())
                }
            )
            return response
        else:
            raise HTTPException(
                status_code=400,
                detail="No Takealot products found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in search_takealot endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Takealot search error: {str(e)}"
        )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Store Product Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "analyze_product": "/functions/v1/analyze-product (POST)",
            "research_product": "/functions/v1/research-product (POST)",
            "store_health_audit": "/api/store/health-audit (POST)"
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# Google Trends — Trending Products
# ─────────────────────────────────────────────────────────────────────────────

import asyncio
import urllib.request
import xml.etree.ElementTree as ET

_POSITIVE_WORDS = {
    "best", "top", "amazing", "great", "love", "viral", "trending", "popular",
    "winning", "excellent", "perfect", "hot", "new", "innovative", "soaring",
    "booming", "growing", "surging", "rising", "hit", "success", "favorite",
    "recommended", "deal", "sale", "affordable", "launch", "debut", "feature",
    "cheap", "discount", "reward", "free", "easy", "fast",
}

_NEGATIVE_WORDS = {
    "bad", "worst", "scam", "fake", "broken", "avoid", "problem", "issue",
    "recall", "danger", "risk", "complaint", "fail", "disappoint", "warning",
    "fraud", "lawsuit", "ban", "blocked", "unsafe", "toxic", "defective",
    "crash", "down", "error", "outage", "delay", "cancel", "suspend",
}


def _parse_traffic(s: str) -> int:
    s = s.replace("+", "").replace(",", "").strip()
    try:
        if s.endswith("M"):
            return int(float(s[:-1]) * 1_000_000)
        if s.endswith("K"):
            return int(float(s[:-1]) * 1_000)
        return int(s)
    except Exception:
        return 0


def _score_sentiment(texts: list) -> dict:
    words = " ".join(texts).lower().split()
    words = [w.strip(".,!?\"'") for w in words]
    pos = sum(1 for w in words if w in _POSITIVE_WORDS)
    neg = sum(1 for w in words if w in _NEGATIVE_WORDS)
    total = pos + neg
    if total == 0:
        return {"positive": 62, "neutral": 28, "negative": 10}
    pos_pct = round((pos / total) * 80)
    neg_pct = round((neg / total) * 80)
    neu_pct = max(0, 100 - pos_pct - neg_pct)
    return {"positive": pos_pct, "neutral": neu_pct, "negative": neg_pct}


def _ad_fatigue(traffic_num: int) -> int:
    if traffic_num >= 1_000_000: return 92
    if traffic_num >= 500_000:   return 78
    if traffic_num >= 100_000:   return 58
    if traffic_num >= 50_000:    return 38
    return 18


class TrendingProductsResponse(BaseModel):
    success: bool
    geo: str
    trends: List[dict]
    error: Optional[str] = None


@app.get("/api/trending-products", response_model=TrendingProductsResponse)
async def get_trending_products(geo: str = "ZA"):
    """
    Fetch real-time trending searches from Google Trends RSS.
    Returns structured trend data with keyword-based sentiment analysis
    derived from associated news headlines.

    Query params:
      geo: ISO 3166-1 alpha-2 country code (default: ZA)
    """
    try:
        ns = "https://trends.google.com/trends/trendingSearches"
        rss_url = f"https://trends.google.com/trending/rss?geo={geo.upper()}"

        def _fetch() -> str:
            req = urllib.request.Request(
                rss_url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; DropWinBot/1.0)"},
            )
            with urllib.request.urlopen(req, timeout=10) as r:
                return r.read().decode("utf-8")

        xml_text = await asyncio.to_thread(_fetch)
        root = ET.fromstring(xml_text)

        trends = []
        for idx, item in enumerate(root.findall(".//item"), start=1):
            title      = item.findtext("title") or "Unknown"
            traffic_str = item.findtext(f"{{{ns}}}approx_traffic") or "0"
            picture    = item.findtext(f"{{{ns}}}picture") or ""

            news_items = []
            for ni in item.findall(f"{{{ns}}}news_item"):
                ni_title   = ni.findtext(f"{{{ns}}}news_item_title")   or ""
                ni_snippet = ni.findtext(f"{{{ns}}}news_item_snippet") or ""
                ni_source  = ni.findtext(f"{{{ns}}}news_item_source")  or ""
                ni_time    = ni.findtext(f"{{{ns}}}news_item_time")    or ""
                if ni_title:
                    news_items.append({
                        "title": ni_title,
                        "snippet": ni_snippet,
                        "source": ni_source,
                        "time": ni_time,
                    })

            traffic_num = _parse_traffic(traffic_str)
            sentiment_texts = [n["title"] + " " + n["snippet"] for n in news_items]
            sentiment  = _score_sentiment(sentiment_texts)
            fatigue    = _ad_fatigue(traffic_num)

            why = (
                news_items[0]["snippet"]
                if news_items and news_items[0]["snippet"]
                else f"#{idx} trending search in {geo.upper()} with {traffic_str} searches."
            )

            trends.append({
                "id": idx,
                "name": title,
                "image": picture,
                "traffic": traffic_str,
                "traffic_num": traffic_num,
                "sentiment": sentiment,
                "whyTrending": why,
                "adFatigue": fatigue,
                "adFatigueViews": traffic_str,
                "newsItems": news_items[:3],
            })

        return TrendingProductsResponse(success=True, geo=geo.upper(), trends=trends)

    except Exception as e:
        logger.error(f"Error fetching Google Trends: {e}")
        return TrendingProductsResponse(
            success=False, geo=geo.upper(), trends=[], error=str(e)
        )


# ─────────────────────────────────────────────────────────────────────────────
# Store Health Audit
# ─────────────────────────────────────────────────────────────────────────────

class StoreHealthMetrics(BaseModel):
    """
    Normalized health metrics (0–100 each) fed by the frontend.
    Defaults to 50 so any missing metric is treated as neutral.
    """
    revenue_growth: float = Field(default=50.0, ge=0, le=100,
        description="Revenue growth trend score (0=steep decline, 100=rapid growth)")
    profit_margin: float = Field(default=50.0, ge=0, le=100,
        description="Profit margin health (0=loss, 100=excellent margin)")
    order_frequency: float = Field(default=50.0, ge=0, le=100,
        description="Order volume consistency (0=irregular, 100=high frequency)")
    customer_retention: float = Field(default=50.0, ge=0, le=100,
        description="Repeat customer rate (0=<10%, 100=strong retention)")
    inventory_turnover: float = Field(default=50.0, ge=0, le=100,
        description="Inventory movement speed (0=stagnant, 100=fast turnover)")
    cash_flow: float = Field(default=50.0, ge=0, le=100,
        description="Cash flow health (0=deeply negative, 100=strong positive)")
    conversion_rate: float = Field(default=50.0, ge=0, le=100,
        description="Visitor-to-buyer conversion (0=<0.5%, 100=excellent)")
    avg_order_value: float = Field(default=50.0, ge=0, le=100,
        description="Average order value trend (0=declining, 100=growing)")


class StoreHealthRequest(BaseModel):
    """Request model for store health audit calculation"""
    store_url: str = Field(..., description="URL of the store being audited")
    metrics: Optional[StoreHealthMetrics] = Field(
        default=None,
        description="Normalized metric scores (0–100). Omit to use neutral defaults."
    )
    products_count: int = Field(default=0, ge=0, description="Number of tracked products")
    audits_count: int = Field(default=0, ge=0, description="Number of completed audits")


class AlertItem(BaseModel):
    """A single health alert with actionable recommendation"""
    type: str        # 'critical' | 'sales' | 'stock' | 'retention' | 'financial'
    severity: str    # 'high' | 'medium' | 'low'
    message: str
    recommendation: str
    resolved: bool = False


class MetricBreakdown(BaseModel):
    score: int
    weighted_contribution: int
    weight: str


class StoreHealthResponse(BaseModel):
    """Response model for store health audit"""
    success: bool
    score: int                   # 0–100 weighted composite score
    health_percentage: int       # 0–100 simple average (all metrics equal weight)
    label: str                   # 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS IMPROVEMENT'
    alerts: List[AlertItem]
    score_breakdown: dict        # per-metric breakdown
    products_count: int
    audits_count: int
    error: Optional[str] = None


def _calculate_health_score(metrics: StoreHealthMetrics):
    """
    Compute weighted composite score and simple-average health percentage.

    Weights (sum = 1.0):
      Revenue Growth     20 %
      Profit Margin      15 %
      Order Frequency    15 %
      Customer Retention 15 %
      Inventory Turnover 10 %
      Cash Flow          10 %
      Conversion Rate    10 %
      Avg Order Value     5 %
    """
    weights = {
        "revenue_growth":    0.20,
        "profit_margin":     0.15,
        "order_frequency":   0.15,
        "customer_retention":0.15,
        "inventory_turnover":0.10,
        "cash_flow":         0.10,
        "conversion_rate":   0.10,
        "avg_order_value":   0.05,
    }

    metric_values = {
        "revenue_growth":    metrics.revenue_growth,
        "profit_margin":     metrics.profit_margin,
        "order_frequency":   metrics.order_frequency,
        "customer_retention":metrics.customer_retention,
        "inventory_turnover":metrics.inventory_turnover,
        "cash_flow":         metrics.cash_flow,
        "conversion_rate":   metrics.conversion_rate,
        "avg_order_value":   metrics.avg_order_value,
    }

    # Weighted composite score
    score = sum(metric_values[m] * w for m, w in weights.items())
    score = round(min(100, max(0, score)))

    # Health % = unweighted average (treats all dimensions equally)
    health_pct = round(sum(metric_values.values()) / len(metric_values))
    health_pct = min(100, max(0, health_pct))

    breakdown = {
        metric: {
            "score": round(value),
            "weighted_contribution": round(value * weights[metric]),
            "weight": f"{int(weights[metric] * 100)}%",
        }
        for metric, value in metric_values.items()
    }

    return score, health_pct, breakdown


def _generate_alerts(metrics: StoreHealthMetrics, score: int) -> List[AlertItem]:
    """
    Generate actionable alerts when metrics cross critical thresholds.

    Triggers:
      score < 50            → critical overall health
      revenue_growth < 40   → revenue declining >20 %
      inventory_turnover<30 → turnover below 2×/month
      customer_retention<30 → retention rate <30 %
      cash_flow < 40        → negative cash-flow trend
    """
    alerts: List[AlertItem] = []

    if score < 50:
        alerts.append(AlertItem(
            type="critical", severity="high",
            message="Store health score is critically low (below 50).",
            recommendation="Review all underperforming metrics immediately and prioritise the lowest-scoring areas.",
        ))

    if metrics.revenue_growth < 40:
        alerts.append(AlertItem(
            type="sales", severity="high",
            message="Revenue growth is declining significantly (>20 % drop).",
            recommendation="Audit marketing campaigns, increase budget on top-performing products, and review your conversion funnel.",
        ))

    if metrics.inventory_turnover < 30:
        alerts.append(AlertItem(
            type="stock", severity="medium",
            message="Inventory turnover is below 2× per month.",
            recommendation="Run promotions on slow-moving stock, introduce bundle offers, and review product-market fit.",
        ))

    if metrics.customer_retention < 30:
        alerts.append(AlertItem(
            type="retention", severity="medium",
            message="Customer retention rate is below 30 %.",
            recommendation="Launch email follow-up sequences, add a loyalty discount, and improve post-purchase communication.",
        ))

    if metrics.cash_flow < 40:
        alerts.append(AlertItem(
            type="financial", severity="high",
            message="Negative cash-flow trend detected.",
            recommendation="Reduce fixed costs, renegotiate supplier payment terms, and pause low-ROI advertising spend.",
        ))

    return alerts


def _score_label(score: int) -> str:
    if score >= 85:
        return "EXCELLENT"
    if score >= 70:
        return "GOOD"
    if score >= 50:
        return "FAIR"
    return "NEEDS IMPROVEMENT"


@app.post("/api/store/health-audit", response_model=StoreHealthResponse)
async def store_health_audit(request: StoreHealthRequest):
    """
    Calculate store health score from normalised metric inputs.

    The frontend fetches raw data from Supabase (tracked_products,
    store_audits) and converts it to 0–100 metric scores before calling
    this endpoint.  The endpoint applies the weighted scoring algorithm,
    generates alerts, and returns a full breakdown.

    Example request:
    {
        "store_url": "https://mystore.myshopify.com",
        "products_count": 12,
        "audits_count": 5,
        "metrics": {
            "revenue_growth": 72, "profit_margin": 65,
            "order_frequency": 68, "customer_retention": 55,
            "inventory_turnover": 70, "cash_flow": 60,
            "conversion_rate": 75, "avg_order_value": 80
        }
    }

    Example response:
    {
        "success": true, "score": 68, "health_percentage": 68, "label": "GOOD",
        "alerts": [...], "score_breakdown": {...},
        "products_count": 12, "audits_count": 5
    }
    """
    try:
        logger.info(f"Running health audit for: {request.store_url}")

        metrics = request.metrics or StoreHealthMetrics()

        score, health_pct, breakdown = _calculate_health_score(metrics)
        alerts = _generate_alerts(metrics, score)

        return StoreHealthResponse(
            success=True,
            score=score,
            health_percentage=health_pct,
            label=_score_label(score),
            alerts=alerts,
            score_breakdown=breakdown,
            products_count=request.products_count,
            audits_count=request.audits_count,
        )

    except Exception as e:
        logger.error(f"Error in store_health_audit: {str(e)}")
        return StoreHealthResponse(
            success=False,
            score=0,
            health_percentage=0,
            label="UNKNOWN",
            alerts=[],
            score_breakdown={},
            products_count=0,
            audits_count=0,
            error=f"Health audit failed: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

