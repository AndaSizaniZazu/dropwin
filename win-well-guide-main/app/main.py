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
            "research_product": "/functions/v1/research-product (POST)"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

