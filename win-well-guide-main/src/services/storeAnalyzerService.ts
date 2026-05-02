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

// ─────────────────────────────────────────────────────────────────────────────
// Store Health Audit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalized metric scores (0–100) derived from Supabase data.
 * Each value represents how healthy that dimension is:
 *   0  = critically bad
 *   50 = neutral / unknown
 *   100 = excellent
 */
export interface StoreHealthMetrics {
  revenue_growth?: number;
  profit_margin?: number;
  order_frequency?: number;
  customer_retention?: number;
  inventory_turnover?: number;
  cash_flow?: number;
  conversion_rate?: number;
  avg_order_value?: number;
}

export interface StoreHealthRequest {
  store_url: string;
  metrics?: StoreHealthMetrics;
  products_count?: number;
  audits_count?: number;
}

export interface HealthAlertItem {
  type: string;         // 'critical' | 'sales' | 'stock' | 'retention' | 'financial'
  severity: string;     // 'high' | 'medium' | 'low'
  message: string;
  recommendation: string;
  resolved: boolean;
}

export interface StoreHealthResponse {
  success: boolean;
  score: number;
  health_percentage: number;
  label: string;        // 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS IMPROVEMENT'
  alerts: HealthAlertItem[];
  score_breakdown: Record<string, {
    score: number;
    weighted_contribution: number;
    weight: string;
  }>;
  products_count: number;
  audits_count: number;
  error?: string;
}

/**
 * Convert raw Supabase product + audit rows into normalized 0–100 metric scores.
 * Used by the StoreAudit page before calling calculateStoreHealth.
 */
export const buildMetricsFromSupabaseData = (
  products: Array<{ trend_score?: number | null; competition_level?: string | null }>,
  audits: Array<{ overall_score?: number | null }>
): StoreHealthMetrics => {
  const productsCount = products.length;
  const auditsCount = audits.length;

  // Average product trend score (already 0–100 in the DB)
  const avgTrend =
    productsCount > 0
      ? products.reduce((sum, p) => sum + (p.trend_score ?? 50), 0) / productsCount
      : 50;

  // Average recent audit score
  const recentAudits = audits.slice(0, 5);
  const avgAuditScore =
    recentAudits.length > 0
      ? recentAudits.reduce((sum, a) => sum + (a.overall_score ?? 50), 0) / recentAudits.length
      : 50;

  // Fraction of low-competition products (proxy for margin/retention)
  const lowCompFrac =
    productsCount > 0
      ? products.filter(p => p.competition_level === "low").length / productsCount
      : 0.5;

  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  return {
    // Revenue growth ~ product trend scores
    revenue_growth: clamp(avgTrend),
    // Profit margin ~ trend × 0.8 + baseline
    profit_margin: clamp(avgTrend * 0.8 + 10),
    // Order frequency ~ number of audits run (proxy for activity)
    order_frequency: clamp(Math.min(auditsCount * 15, 100)),
    // Customer retention ~ low-competition products (easier to retain)
    customer_retention: clamp(lowCompFrac * 70 + 30),
    // Inventory turnover ~ trend score (trending products move fast)
    inventory_turnover: clamp(avgTrend * 0.9),
    // Cash flow ~ avg audit score
    cash_flow: clamp(avgAuditScore * 0.9),
    // Conversion rate ~ trend × 0.7 + floor
    conversion_rate: clamp(avgTrend * 0.7 + 30),
    // Avg order value ~ trend × 0.75 + floor
    avg_order_value: clamp(avgTrend * 0.75 + 25),
  };
};

/**
 * POST /api/store/health-audit
 * Send normalized metrics to the Python backend for weighted scoring.
 */
export const calculateStoreHealth = async (
  request: StoreHealthRequest
): Promise<StoreHealthResponse> => {
  try {
    requireApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/store/health-audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const data: StoreHealthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Health audit failed");
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Store health audit failed: ${errorMessage}`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Google Trends — Trending Products (fetched directly in the browser)
// ─────────────────────────────────────────────────────────────────────────────

export interface TrendNewsItem {
  title: string;
  snippet: string;
  source: string;
  time: string;
}

export interface TrendingProduct {
  id: number;
  name: string;
  image: string;
  traffic: string;
  traffic_num: number;
  sentiment: { positive: number; neutral: number; negative: number };
  whyTrending: string;
  adFatigue: number;
  adFatigueViews: string;
  newsItems: TrendNewsItem[];
}

export interface TrendingProductsResponse {
  success: boolean;
  geo: string;
  trends: TrendingProduct[];
  error?: string;
}


const _adFatigue = (n: number) => {
  if (n >= 1_000_000) return 92;
  if (n >= 500_000)   return 78;
  if (n >= 100_000)   return 58;
  if (n >= 50_000)    return 38;
  return 18;
};

// Fetch hot posts from multiple dropshipping-relevant subreddits.
// Reddit blocks direct browser CORS, so we proxy through corsproxy.io with an allorigins fallback.
const _REDDIT_URL =
  "https://www.reddit.com/r/dropshipping+ecommerce+AliExpress/hot.json?limit=25&raw_json=1";

async function _fetchReddit(signal: AbortSignal): Promise<any> {
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(_REDDIT_URL)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(_REDDIT_URL)}`,
  ];
  let lastErr: unknown;
  for (const url of proxies) {
    try {
      const res = await fetch(url, { signal });
      if (res.ok) return res.json();
      lastErr = new Error(`HTTP ${res.status} from ${url}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("All proxies failed");
}

export const fetchTrendingProducts = async (_geo = "ZA"): Promise<TrendingProductsResponse> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);

  try {
    const json = await _fetchReddit(controller.signal);
    const posts: any[] = json?.data?.children ?? [];

    const trends: TrendingProduct[] = posts
      .filter((c: any) => !c.data.stickied && c.data.title)
      .slice(0, 15)
      .map((c: any, idx: number) => {
        const p        = c.data;
        const upvotes  = p.score as number;
        const ratio    = (p.upvote_ratio as number) ?? 0.75;
        const comments = p.num_comments as number;
        const selftext = (p.selftext as string) ?? "";

        const trafficStr =
          upvotes >= 1_000
            ? `${(upvotes / 1_000).toFixed(1)}K`
            : String(upvotes);

        // Sentiment derived from upvote ratio (0–1) — directly represents community approval
        const posPct = Math.round(ratio * 75);
        const negPct = Math.round((1 - ratio) * 45);
        const neuPct = Math.max(0, 100 - posPct - negPct);

        const snippet =
          selftext.length > 220 ? selftext.slice(0, 220).trimEnd() + "…" : selftext;

        const newsItems: TrendNewsItem[] = snippet
          ? [{
              title:   `Posted by u/${p.author}`,
              snippet,
              source:  `r/${p.subreddit}`,
              time:    new Date((p.created_utc as number) * 1000).toLocaleDateString(),
            }]
          : [];

        const thumbnail =
          p.thumbnail && (p.thumbnail as string).startsWith("http")
            ? (p.thumbnail as string)
            : "";

        return {
          id:             idx + 1,
          name:           p.title as string,
          image:          thumbnail,
          traffic:        `${trafficStr} upvotes`,
          traffic_num:    upvotes,
          sentiment:      { positive: posPct, neutral: neuPct, negative: negPct },
          whyTrending:
            snippet ||
            `Trending in r/${p.subreddit} — ${trafficStr} upvotes, ${comments} comments.`,
          adFatigue:      _adFatigue(upvotes * 15),
          adFatigueViews: `${comments} comments`,
          newsItems,
        };
      });

    return { success: true, geo: "REDDIT", trends };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Could not load trends: ${msg}`);
  } finally {
    clearTimeout(timer);
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
