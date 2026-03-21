/**
 * Store Analyzer Service
 * Frontend service for calling the Python Store Analyzer API
 */

// Get API URL from environment or use default
// FastAPI runs on port 8000 by default, but can be overridden
const API_BASE_URL: string = (() => {
  try {
    const configuredUrl = (import.meta as any).env.VITE_API_URL;
    const isProduction = (import.meta as any).env.PROD;

    if (configuredUrl) {
      return configuredUrl;
    }

    if (isProduction) {
      console.warn(
        "VITE_API_URL is not configured. Product research and store analysis requests will fail until it is set."
      );
      return "";
    }

    return "http://localhost:8000";
  } catch {
    return "http://localhost:8000";
  }
})();

const requireApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error(
      "API is not configured for this deployment. Set VITE_API_URL in Amplify."
    );
  }
};

interface StoreAnalysisRequest {
  store_url: string;
  store_name?: string;
}

interface StoreAnalysisResponse {
  success: boolean;
  url: string;
  store_info?: {
    title: string;
    meta_description: string;
    response_time_seconds: number;
    https_enabled: boolean;
  };
  analysis?: {
    overall_score: number | null;
    audit_report: string;
    analyzed_at: string;
  };
  error?: string;
  status?: number;
}

interface StoreValidationResponse {
  valid: boolean;
  message: string;
  url: string;
}

interface StoreInfoResponse {
  success: boolean;
  data?: {
    url: string;
    status_code: number;
    response_time: number;
    title: string;
    meta_description: string;
    has_https: boolean;
  };
  error?: string;
}

/**
 * Analyzes a store and returns a comprehensive CRO audit report
 */
export const analyzeStore = async (
  request: StoreAnalysisRequest
): Promise<StoreAnalysisResponse> => {
  try {
    requireApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/analyze-store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data: StoreAnalysisResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to analyze store");
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Store analysis failed: ${errorMessage}`);
  }
};

/**
 * Validates a store URL format
 */
export const validateStoreUrl = async (
  storeUrl: string
): Promise<StoreValidationResponse> => {
  try {
    requireApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/validate-store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ store_url: storeUrl }),
    });

    const data: StoreValidationResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Validation failed");
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`URL validation failed: ${errorMessage}`);
  }
};

/**
 * Fetches basic store information without AI analysis
 */
export const getStoreInfo = async (
  storeUrl: string
): Promise<StoreInfoResponse> => {
  try {
    requireApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/store-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ store_url: storeUrl }),
    });

    const data: StoreInfoResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch store info");
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to fetch store info: ${errorMessage}`);
  }
};

/**
 * Analyzes a product using the new Ollama-based endpoint
 */
export interface ProductAnalysisRequest {
  productName: string;
  productUrl?: string;
  productDescription?: string;
}

export interface ProductAnalysisResponse {
  success: boolean;
  product_name: string;
  analysis?: {
    markdown_report: string;
    analyzed_at: string;
  };
  error?: string;
}

export const analyzeProduct = async (
  request: ProductAnalysisRequest
): Promise<ProductAnalysisResponse> => {
  try {
    requireApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/functions/v1/analyze-product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data: ProductAnalysisResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to analyze product");
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Product analysis failed: ${errorMessage}`);
  }
};

/**
 * Research a product across multiple platforms (TikTok, AliExpress, Instagram, Amazon)
 */
export interface ProductResearchRequest {
  query: string;
  platforms?: string[];
}

export interface ProductResearchResponse {
  success: boolean;
  query: string;
  research?: {
    markdown_report: string;
    analyzed_at: string;
  };
  error?: string;
}

export const researchProduct = async (
  request: ProductResearchRequest
): Promise<ProductResearchResponse> => {
  try {
    requireApiBaseUrl();
    // If searching AliExpress, Amazon, Temu, or Takelott, use the direct scraper endpoints
    const platforms = request.platforms || [];
    
    // Map platform names to API endpoints
    const platformEndpoints: Record<string, string> = {
      'aliexpress': '/api/search-aliexpress',
      'amazon': '/api/search-amazon',
      'temu': '/api/search-temu',
      'takealot': '/api/search-takealot'
    };
    
    // Check if single platform search
    if (platforms.length === 1) {
      const platform = platforms[0].toLowerCase();
      const endpoint = platformEndpoints[platform];
      
      if (endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        const data: ProductResearchResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to search ${platform}`);
        }

        return data;
      }
    }
    
    // For other searches, use the full research endpoint
    const response = await fetch(`${API_BASE_URL}/functions/v1/research-product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data: ProductResearchResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to research product");
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Product research failed: ${errorMessage}`);
  }
};

/**
 * Checks API health status
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    requireApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Analyzes a Shopify store using third-party analyzer
 */
export const analyzeShopifyStore = async (
  storeUrl: string
): Promise<StoreAnalysisResponse> => {
  try {
    requireApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/analyze-shopify-store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ store_url: storeUrl }),
    });

    const data: StoreAnalysisResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to analyze Shopify store");
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Shopify store analysis failed: ${errorMessage}`);
  }
};
