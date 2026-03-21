import { useState } from "react";
import {
  ArrowLeft,
  Link as LinkIcon,
  Search,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  MapPin,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { analyzeStore, validateStoreUrl, analyzeProduct, analyzeShopifyStore, type ProductAnalysisResponse } from "@/services/storeAnalyzerService";

const brandingChecks = [
  { text: "Product fits your Home Decor aesthetic", passed: true },
  { text: "Price point matches store average", passed: true },
  { text: "Consider lifestyle photography", passed: false },
];

const saturationData = [
  { region: "US", count: 45 },
  { region: "UK", count: 23 },
  { region: "CA", count: 18 },
  { region: "AU", count: 15 },
  { region: "EU", count: 26 },
];

const profitBreakdown = [
  { label: "Selling Price", value: 39.99, type: "positive" },
  { label: "Supplier Cost", value: -8.50, type: "negative" },
  { label: "Shipping", value: -3.20, type: "negative" },
  { label: "Est. Ad Cost (CPM)", value: -12.00, type: "negative" },
  { label: "Shopify Fees", value: -1.20, type: "negative" },
  { label: "Transaction Fee", value: -1.16, type: "negative" },
];

interface AnalysisResult {
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
}

export default function StoreAudit() {
  const [storeUrl, setStoreUrl] = useState("https://mystore.myshopify.com");
  const [productUrl, setProductUrl] = useState("");
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [auditReport, setAuditReport] = useState("");
  const [storeTitle, setStoreTitle] = useState("");
  const { toast } = useToast();

  const netProfit = profitBreakdown.reduce((acc, item) => acc + item.value, 0);
  const profitMargin = ((netProfit / 39.99) * 100).toFixed(1);

  const handleAnalyze = async () => {
    if (!storeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a store URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      await validateStoreUrl(storeUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid URL";
      toast({
        title: "Invalid URL",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, try to analyze using the Shopify analyzer
      let result;
      try {
        result = await analyzeShopifyStore(storeUrl);
        
        if (result.success && result.analysis) {
          setAnalysisResult(result);
          setStoreTitle(result.store_info?.title || "Store Analysis");
          setOverallScore(result.analysis.overall_score || 0);
          setAuditReport(result.analysis.audit_report);
          setIsAnalyzed(true);

          toast({
            title: "Success",
            description: "Store analysis completed successfully",
          });
          return;
        }
      } catch (shopifyError) {
        // Fallback to product analyzer if Shopify analyzer fails
        console.log("Shopify analyzer failed, trying product analyzer...");
      }

      // Use the product analysis endpoint as fallback
      const productResult = await analyzeProduct({
        productName: storeUrl.split('/').pop() || "Store Analysis",
        productUrl: storeUrl,
        productDescription: `Analyzing store at ${storeUrl}`
      });

      if (productResult.success && productResult.analysis) {
        const convertedResult: AnalysisResult = {
          success: true,
          url: storeUrl,
          store_info: {
            title: productResult.product_name,
            meta_description: "",
            response_time_seconds: 0,
            https_enabled: storeUrl.startsWith("https")
          },
          analysis: {
            overall_score: null,
            audit_report: productResult.analysis.markdown_report,
            analyzed_at: productResult.analysis.analyzed_at
          }
        };
        
        setAnalysisResult(convertedResult);
        setStoreTitle(productResult.product_name);
        const scoreMatch = productResult.analysis.markdown_report.match(/[Ss]core[:\s]*(\d+)/);
        setOverallScore(scoreMatch ? parseInt(scoreMatch[1]) : 0);
        setAuditReport(productResult.analysis.markdown_report);
        setIsAnalyzed(true);

        toast({
          title: "Success",
          description: "Product analysis completed successfully",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: productResult.error || "Failed to analyze product",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to analyze product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreVariant = (score: number): "success" | "warning" | "critical" => {
    if (score >= 70) return "success";
    if (score >= 50) return "warning";
    return "critical";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return "EXCELLENT";
    if (score >= 70) return "GOOD";
    if (score >= 50) return "FAIR";
    return "NEEDS IMPROVEMENT";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Store Audit</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5 animate-fade-in">
        {/* Store URL Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Your Store
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://yourstore.myshopify.com"
                className="text-sm"
                disabled={isLoading}
              />
              <Button
                size="sm"
                className="px-4"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Store Info */}
        {isAnalyzed && analysisResult && analysisResult.success && (
          <>
            <Card className="bg-card/50">
              <CardContent className="pt-4">
                <div className="space-y-1">
                  <h3 className="font-semibold">{storeTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    URL: {storeUrl}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Response Time:{" "}
                    {analysisResult.store_info?.response_time_seconds.toFixed(2) || "N/A"}s |{" "}
                    HTTPS: {analysisResult.store_info?.https_enabled ? "✓" : "✗"}
                  </p>
                  {analysisResult.store_info?.meta_description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {analysisResult.store_info.meta_description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overall Score */}
            <Card
              className={`bg-gradient-to-br ${
                getScoreVariant(overallScore) === "success"
                  ? "from-green-500/5 to-green-500/10 border-green-500/20"
                  : getScoreVariant(overallScore) === "warning"
                    ? "from-yellow-500/5 to-yellow-500/10 border-yellow-500/20"
                    : "from-red-500/5 to-red-500/10 border-red-500/20"
              }`}
            >
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Overall Store Score
                  </p>
                  <ScoreGauge score={overallScore} size="md" />
                  <p
                    className={`text-sm font-semibold ${
                      getScoreVariant(overallScore) === "success"
                        ? "text-green-600 dark:text-green-400"
                        : getScoreVariant(overallScore) === "warning"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {getScoreLabel(overallScore)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Google Analytics Report Template */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  📊 Google Analytics Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Sessions</div>
                    <div className="text-xl font-bold text-primary">12,847</div>
                    <div className="text-xs text-success mt-1">+24.5%</div>
                  </div>
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Users</div>
                    <div className="text-xl font-bold text-primary">8,392</div>
                    <div className="text-xs text-success mt-1">+18.2%</div>
                  </div>
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Bounce Rate</div>
                    <div className="text-xl font-bold text-warning">42.3%</div>
                    <div className="text-xs text-critical mt-1">-5.2%</div>
                  </div>
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Avg Session</div>
                    <div className="text-xl font-bold text-primary">3m 24s</div>
                    <div className="text-xs text-success mt-1">+12s</div>
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Top Pages</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">/ (Home)</span>
                      <span className="font-medium">4,234 views</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">/products</span>
                      <span className="font-medium">3,847 views</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">/cart</span>
                      <span className="font-medium">2,156 views</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  💳 Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💳</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Stripe</div>
                    <div className="text-xs text-muted-foreground">Primary payment gateway</div>
                  </div>
                  <div className="text-xs font-medium text-success">✓ Active</div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🏦</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">PayPal</div>
                    <div className="text-xs text-muted-foreground">Backup payment option</div>
                  </div>
                  <div className="text-xs font-medium text-success">✓ Active</div>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Stripe Details</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Status</span>
                      <span className="font-medium text-success">Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction Volume</span>
                      <span className="font-medium">$47,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Fee</span>
                      <span className="font-medium">2.9% + $0.30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dispute Rate</span>
                      <span className="font-medium text-success">0.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Analyze Product
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="Enter product URL or name..."
                  className="text-sm"
                />
              </CardContent>
            </Card>

            {/* Audit Report */}
            {auditReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">CRO Audit Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto bg-muted/30 p-4 rounded-md">
                      {auditReport}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Branding Match */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    📊 Branding Match
                  </CardTitle>
                  <span className="text-lg font-bold text-success">85/100</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ProgressBar value={85} variant="success" size="md" />
                <div className="space-y-2">
                  {brandingChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {check.passed ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                      <span
                        className={
                          check.passed ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {check.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Saturation Heatmap */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Saturation Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-muted-foreground">
                    Medium Saturation (127 stores)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {saturationData.map((item) => (
                    <div
                      key={item.region}
                      className="bg-muted/50 px-3 py-2 rounded-lg text-center"
                    >
                      <div className="text-xs text-muted-foreground">{item.region}</div>
                      <div className="text-sm font-semibold">{item.count}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  +34 stores in last 24 hours
                </div>
              </CardContent>
            </Card>

            {/* Profit Calculator */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Real Net Profit Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profitBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span
                        className={
                          item.type === "positive"
                            ? "text-foreground font-medium"
                            : "text-critical"
                        }
                      >
                        {item.type === "positive" ? "" : ""}${Math.abs(item.value).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between">
                    <span className="font-semibold">TRUE NET PROFIT</span>
                    <span className="font-bold text-success">
                      ${netProfit.toFixed(2)} ({profitMargin}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
