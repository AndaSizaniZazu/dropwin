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
  Activity,
  Package,
  ClipboardList,
  Heart,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AlertCard } from "@/components/ui/alert-card";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  analyzeShopifyStore,
  calculateStoreHealth,
  buildMetricsFromSupabaseData,
  type StoreHealthResponse,
  type StoreHealthMetrics,
} from "@/services/storeAnalyzerService";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { STORE_URL_KEY } from "./Dashboard";

// ─── CRO analysis result type ─────────────────────────────────────────────────

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

// ─── Metric label map for the breakdown section ───────────────────────────────

const METRIC_LABELS: Record<string, string> = {
  revenue_growth:    "Revenue Growth",
  profit_margin:     "Profit Margin",
  order_frequency:   "Order Frequency",
  customer_retention:"Customer Retention",
  inventory_turnover:"Inventory Turnover",
  cash_flow:         "Cash Flow",
  conversion_rate:   "Conversion Rate",
  avg_order_value:   "Avg Order Value",
};

// ─── Helper: map alert type → AlertCard variant ───────────────────────────────

const alertVariant = (severity: string): "critical" | "warning" | "success" => {
  if (severity === "high") return "critical";
  if (severity === "medium") return "warning";
  return "success";
};

// ─── Helper: score → colour variant for ProgressBar ──────────────────────────

const progressVariant = (score: number): "success" | "warning" | "critical" => {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "critical";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StoreAudit() {
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Health audit state ────────────────────────────────────────────────────
  const [healthData, setHealthData] = useState<StoreHealthResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ── CRO analysis state ────────────────────────────────────────────────────
  const [storeUrl, setStoreUrl] = useState(() => localStorage.getItem(STORE_URL_KEY) || "https://mystore.myshopify.com");
  const [targetCountry, setTargetCountry] = useState("US");
  const [productUrl, setProductUrl] = useState("");
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [auditReport, setAuditReport] = useState("");
  const [storeTitle, setStoreTitle] = useState("");

  // ── Profit Calculator state ───────────────────────────────────────────────
  const [sellPrice, setSellPrice] = useState("39.99");
  const [suppCost, setSuppCost] = useState("8.50");
  const [shippingCost, setShippingCost] = useState("3.20");
  const [adCostVal, setAdCostVal] = useState("12.00");

  const sp = parseFloat(sellPrice) || 0;
  const sc = parseFloat(suppCost) || 0;
  const sh = parseFloat(shippingCost) || 0;
  const ac = parseFloat(adCostVal) || 0;
  const platformFee = parseFloat((sp * 0.03).toFixed(2));
  const netProfit = parseFloat((sp - sc - sh - ac - platformFee).toFixed(2));
  const profitMargin = sp > 0 ? ((netProfit / sp) * 100).toFixed(1) : "0.0";

  // ── Run Health Audit ──────────────────────────────────────────────────────
  const runHealthAudit = async () => {
    setIsLoadingHealth(true);
    let productsCount = 0;
    let auditsCount = 0;
    let metrics: StoreHealthMetrics = {};
    try {

      if (isSupabaseConfigured && user) {
        // Fetch live data from Supabase
        const [{ data: products }, { data: audits }] = await Promise.all([
          supabase
            .from("tracked_products")
            .select("trend_score, competition_level")
            .eq("user_id", user.id),
          supabase
            .from("store_audits")
            .select("overall_score, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        productsCount = products?.length ?? 0;
        auditsCount = (audits?.length ?? 0) + 1;
        metrics = buildMetricsFromSupabaseData(products ?? [], audits ?? []);
      } else {
        // No real store data yet — use neutral 50s so the score honestly
        // reflects "no data", not a fake healthy store
        metrics = {
          revenue_growth: 50, profit_margin: 50, order_frequency: 50,
          customer_retention: 50, inventory_turnover: 50, cash_flow: 50,
          conversion_rate: 50, avg_order_value: 50,
        };
      }

      // Call the Python scoring endpoint
      const result = await calculateStoreHealth({
        store_url: storeUrl,
        metrics,
        products_count: productsCount,
        audits_count: auditsCount,
      });

      if (!result.success) {
        throw new Error(result.error || "Health audit returned an error");
      }

      setHealthData(result);

      // Persist the audit record (only when authenticated)
      if (isSupabaseConfigured && user) {
        await supabase.from("store_audits").insert({
          user_id: user.id,
          store_url: storeUrl,
          overall_score: result.score,
          audit_data: {
            health_percentage: result.health_percentage,
            score_breakdown: result.score_breakdown,
            metrics,
          },
          recommendations: result.alerts.map((a) => a.recommendation),
        });
      }

      toast({ title: "Health Audit Complete", description: `Store Success Score: ${result.score}/100` });
    } catch {
      // Backend unavailable — compute score locally using the same weighted
      // algorithm as the Python backend, from whatever real metrics we have
      const m = metrics as Record<string, number>;
      const w: Record<string, number> = {
        revenue_growth: 0.20, profit_margin: 0.15, order_frequency: 0.15,
        customer_retention: 0.15, inventory_turnover: 0.10, cash_flow: 0.10,
        conversion_rate: 0.10, avg_order_value: 0.05,
      };
      const localScore = Math.round(
        Object.entries(w).reduce((s, [k, wt]) => s + (m[k] ?? 50) * wt, 0)
      );
      const localHealth = Math.round(
        Object.values(m).reduce((a, b) => a + b, 0) / Object.keys(m).length
      );
      const localLabel =
        localScore >= 85 ? "EXCELLENT" :
        localScore >= 70 ? "GOOD" :
        localScore >= 50 ? "FAIR" : "NEEDS IMPROVEMENT";

      setHealthData({
        success: true,
        score: localScore,
        health_percentage: localHealth,
        label: localLabel,
        products_count: productsCount,
        audits_count: auditsCount,
        alerts: [],
        score_breakdown: Object.fromEntries(
          Object.entries(w).map(([k, wt]) => [k, {
            score: Math.round(m[k] ?? 50),
            weighted_contribution: Math.round((m[k] ?? 50) * wt),
            weight: `${Math.round(wt * 100)}%`,
          }])
        ),
      });
      toast({
        title: "Audit complete",
        description: productsCount === 0
          ? "No products tracked yet — add products to get a meaningful score."
          : "Python API unavailable — score calculated from your store data.",
      });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  // ── CRO analysis ──────────────────────────────────────────────────────────
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

  // In-browser CRO audit — parses real store HTML, scores 16 checks, generates report.
  // No backend or AI API needed.
  const runBrowserAudit = (html: string, url: string, responseTime: number) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = html.toLowerCase();

    const title    = doc.querySelector("title")?.textContent?.trim() || "";
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() || "";

    const checks: { label: string; passed: boolean; tip: string }[] = [
      { label: "HTTPS / SSL",             passed: url.startsWith("https://"),                                             tip: "Migrate to HTTPS — browsers flag HTTP stores as 'Not Secure'." },
      { label: "Fast response (<2 s)",    passed: responseTime < 2,                                                       tip: `Response time is ${responseTime}s. Optimise hosting or use a CDN.` },
      { label: "Page title set",          passed: title.length > 0,                                                       tip: "Add a descriptive title tag (50–60 characters)." },
      { label: "Title length (≤60 ch)",   passed: title.length > 0 && title.length <= 60,                                 tip: `Title is ${title.length} chars. Keep it under 60 for full SERP display.` },
      { label: "Meta description",        passed: metaDesc.length > 0,                                                    tip: "Write a meta description (120–160 chars) to improve click-through rates." },
      { label: "Mobile viewport",         passed: !!doc.querySelector('meta[name="viewport"]'),                           tip: "Add <meta name='viewport' content='width=device-width, initial-scale=1'>." },
      { label: "Open Graph image",        passed: !!doc.querySelector('meta[property="og:image"]'),                       tip: "Add og:image for rich previews when shared on social media." },
      { label: "Open Graph title",        passed: !!doc.querySelector('meta[property="og:title"]'),                       tip: "Add og:title for consistent social sharing previews." },
      { label: "Canonical URL",           passed: !!doc.querySelector('link[rel="canonical"]'),                           tip: "Add a canonical tag to prevent duplicate-content SEO penalties." },
      { label: "Structured data",         passed: text.includes('"@type"') || text.includes("schema.org"),                tip: "Add Schema.org Product markup to enable rich results in Google." },
      { label: "Trust signals",           passed: /secure|guarantee|refund|return|ssl|protected|verified/i.test(html),    tip: "Display trust badges, money-back guarantee, and SSL seal prominently." },
      { label: "Social proof",            passed: /review|rating|star|testimonial|customer said/i.test(html),             tip: "Show customer reviews and star ratings to boost purchase confidence." },
      { label: "Add to Cart / Buy CTA",   passed: /add.to.cart|buy.now|shop.now|order.now|get.it.now/i.test(html),        tip: "Make the primary CTA button larger and higher on the page." },
      { label: "Urgency / scarcity",      passed: /limited|only \d+ left|sale ends|% off|today only|flash sale/i.test(html), tip: "Add scarcity signals (countdown timer, low stock notice) to drive action." },
      { label: "Contact / support link",  passed: /contact|support|help center|live chat/i.test(html),                   tip: "Show a contact option in the header — it dramatically reduces bounce rate." },
      { label: "Privacy / terms links",   passed: /privacy.policy|terms.of.service|terms.and.conditions/i.test(html),    tip: "Link to Privacy Policy and T&Cs in the footer (required by GDPR/FTC)." },
    ];

    const passed  = checks.filter((c) => c.passed).length;
    const score   = Math.round((passed / checks.length) * 100);
    const label   = score >= 85 ? "EXCELLENT" : score >= 70 ? "GOOD" : score >= 50 ? "FAIR" : "NEEDS IMPROVEMENT";
    const failing = checks.filter((c) => !c.passed);

    const report = [
      `# CRO Audit — ${title || url}`,
      `**Score: ${score}/100 (${label})**  |  ${passed}/${checks.length} checks passed  |  Response: ${responseTime}s`,
      "",
      "## ✅ What's Working",
      checks.filter((c) => c.passed).map((c) => `- ✅ ${c.label}`).join("\n") || "- None",
      "",
      "## ❌ Issues Found",
      failing.length ? failing.map((c) => `- ❌ **${c.label}** — ${c.tip}`).join("\n") : "- None — great job!",
      "",
      "## 🎯 Top Priorities",
      failing.slice(0, 5).map((c, i) => `${i + 1}. **${c.label}**: ${c.tip}`).join("\n") || "No critical issues.",
    ].join("\n");

    return { score, report, title, metaDesc, checks };
  };

  const handleAnalyze = async () => {
    if (!storeUrl.trim()) {
      toast({ title: "Error", description: "Please enter a store URL", variant: "destructive" });
      return;
    }

    const normalised = storeUrl.startsWith("http") ? storeUrl : `https://${storeUrl}`;

    setIsLoading(true);
    try {
      // 1️⃣ Try full AI analysis via Python backend
      try {
        const result = await analyzeShopifyStore(normalised);
        if (result.success && result.analysis) {
          setAnalysisResult(result);
          setStoreTitle(result.store_info?.title || "Store Analysis");
          setOverallScore(result.analysis.overall_score || 0);
          setAuditReport(result.analysis.audit_report);
          setIsAnalyzed(true);
          toast({ title: "AI analysis complete" });
          return;
        }
      } catch {
        // Backend unavailable — fall through to in-browser audit
      }

      // 2️⃣ Fetch store HTML + run in-browser CRO audit (no backend needed)
      try {
        const start    = performance.now();
        const proxied  = `https://corsproxy.io/?${encodeURIComponent(normalised)}`;
        const res      = await fetch(proxied);
        const elapsed  = parseFloat(((performance.now() - start) / 1000).toFixed(2));
        const html     = await res.text();

        const { score, report, title, metaDesc, checks } = runBrowserAudit(html, normalised, elapsed);

        const result: AnalysisResult = {
          success: true,
          url: normalised,
          store_info: {
            title,
            meta_description: metaDesc,
            response_time_seconds: elapsed,
            https_enabled: normalised.startsWith("https://"),
          },
          analysis: { overall_score: score, audit_report: report, analyzed_at: new Date().toISOString() },
        };

        setAnalysisResult(result);
        setStoreTitle(title || normalised);
        setOverallScore(score);
        setAuditReport(report);
        setIsAnalyzed(true);

        const passed = checks.filter((c) => c.passed).length;
        toast({ title: "Audit complete", description: `${score}/100 — ${passed}/${checks.length} checks passed.` });
      } catch {
        toast({
          title: "Scan failed",
          description: "Could not reach the store. Check the URL and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
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

        {/* ══════════════════════════════════════════════════════════════════
            STORE HEALTH SCORING DASHBOARD
        ══════════════════════════════════════════════════════════════════ */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Store Health Score
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={runHealthAudit}
                disabled={isLoadingHealth}
                className="h-8 text-xs"
              >
                {isLoadingHealth ? (
                  <><Loader className="w-3 h-3 mr-1.5 animate-spin" />Auditing...</>
                ) : (
                  <><RefreshCw className="w-3 h-3 mr-1.5" />Run Audit</>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {healthData ? (
              <>
                {/* Score gauge + label */}
                <div className="flex flex-col items-center gap-2 pt-2">
                  <ScoreGauge
                    score={healthData.score}
                    size="md"
                    label="Store Success Score"
                  />
                  <span
                    className={`text-sm font-semibold ${
                      healthData.score >= 70
                        ? "text-green-600 dark:text-green-400"
                        : healthData.score >= 50
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {healthData.label}
                  </span>
                </div>

                {/* 4 key metrics */}
                <div className="grid grid-cols-4 gap-2">
                  <StatCard
                    icon={Package}
                    value={healthData.products_count}
                    label="Products"
                  />
                  <StatCard
                    icon={ClipboardList}
                    value={healthData.audits_count}
                    label="Audits"
                  />
                  <StatCard
                    icon={AlertTriangle}
                    value={healthData.alerts.length}
                    label="Alerts"
                    className={healthData.alerts.length > 0 ? "border-warning/40" : ""}
                  />
                  <StatCard
                    icon={Heart}
                    value={`${healthData.health_percentage}%`}
                    label="Health"
                    className={
                      healthData.health_percentage >= 70
                        ? "border-success/40"
                        : "border-warning/40"
                    }
                  />
                </div>

                {/* Score breakdown toggle */}
                <button
                  onClick={() => setShowBreakdown((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                  {showBreakdown ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  {showBreakdown ? "Hide" : "Show"} score breakdown
                </button>

                {showBreakdown && (
                  <div className="space-y-3 pt-1">
                    {Object.entries(healthData.score_breakdown).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {METRIC_LABELS[key] ?? key}
                          </span>
                          <span className="font-medium tabular-nums">
                            {val.score}/100
                            <span className="text-muted-foreground ml-1">({val.weight})</span>
                          </span>
                        </div>
                        <ProgressBar
                          value={val.score}
                          variant={progressVariant(val.score)}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Alerts panel */}
                {healthData.alerts.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Active Alerts
                    </p>
                    {healthData.alerts.map((alert, i) => (
                      <AlertCard
                        key={i}
                        type={alertVariant(alert.severity)}
                        title={
                          alert.type === "critical" ? "Critical Health"
                          : alert.type === "sales" ? "Sales Alert"
                          : alert.type === "stock" ? "Stock Warning"
                          : alert.type === "retention" ? "Retention Alert"
                          : "Financial Warning"
                        }
                        description={`${alert.message} — ${alert.recommendation}`}
                        time="Just now"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Placeholder state */
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/30 border-2 border-dashed border-border flex items-center justify-center">
                  <Activity className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-medium">No audit data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click <strong>Run Audit</strong> to calculate your Store Success Score
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2 w-full opacity-40 pointer-events-none">
                  <StatCard icon={Package}      value="–" label="Products" />
                  <StatCard icon={ClipboardList} value="–" label="Audits" />
                  <StatCard icon={AlertTriangle} value="–" label="Alerts" />
                  <StatCard icon={Heart}         value="–" label="Health" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════════════════════════════
            EXISTING CRO ANALYSIS SECTION (unchanged)
        ══════════════════════════════════════════════════════════════════ */}

        {/* Store URL Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Your Store
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                  <><Loader className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Target Market:</span>
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="flex-1 text-xs border border-input rounded-md px-2 py-1.5 bg-background text-foreground"
              >
                <option value="US">🇺🇸 United States</option>
                <option value="ZA">🇿🇦 South Africa</option>
                <option value="UK">🇬🇧 United Kingdom</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="NG">🇳🇬 Nigeria</option>
                <option value="EU">🇪🇺 Europe</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Store Info + CRO results */}
        {isAnalyzed && analysisResult && analysisResult.success && (
          <>
            <Card className="bg-card/50">
              <CardContent className="pt-4">
                <div className="space-y-1">
                  <h3 className="font-semibold">{storeTitle}</h3>
                  <p className="text-sm text-muted-foreground">URL: {storeUrl}</p>
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

            {/* Overall CRO Score — only shown when there is a real AI-computed score */}
            {overallScore > 0 && (
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
            )}

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

            {/* Technical Store Signals — derived from real store_info */}
            {analysisResult?.store_info && (() => {
              const checks = [
                { text: "HTTPS / SSL secured", passed: analysisResult.store_info!.https_enabled },
                { text: "Store title configured", passed: !!(analysisResult.store_info!.title) },
                { text: "Meta description set", passed: !!(analysisResult.store_info!.meta_description) },
                { text: "Fast response time (<2 s)", passed: analysisResult.store_info!.response_time_seconds < 2 },
              ];
              const techScore = Math.round(
                (checks.filter((c) => c.passed).length / checks.length) * 100
              );
              return (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        📊 Technical Store Signals
                      </CardTitle>
                      <span
                        className={`text-lg font-bold ${
                          techScore >= 75
                            ? "text-success"
                            : techScore >= 50
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      >
                        {techScore}/100
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ProgressBar
                      value={techScore}
                      variant={techScore >= 75 ? "success" : techScore >= 50 ? "warning" : "critical"}
                      size="md"
                    />
                    <div className="space-y-2">
                      {checks.map((check, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {check.passed ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-warning" />
                          )}
                          <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
                            {check.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Market Saturation Research */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Market Saturation Research
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Research how saturated this product category is across {targetCountry} and global markets using live product intelligence.
                </p>
                <Link to="/product-intel">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Open Product Intel → Market Research
                  </Button>
                </Link>
                <Link to="/spy-tools">
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-1">
                    <Search className="w-4 h-4" />
                    Spy on Competitor Ads & Stores
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Profit Calculator — interactive, user enters their real numbers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Net Profit Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Selling Price ($)</label>
                    <Input
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="text-sm h-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Supplier Cost ($)</label>
                    <Input
                      type="number"
                      value={suppCost}
                      onChange={(e) => setSuppCost(e.target.value)}
                      className="text-sm h-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Shipping ($)</label>
                    <Input
                      type="number"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      className="text-sm h-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Ad Cost ($)</label>
                    <Input
                      type="number"
                      value={adCostVal}
                      onChange={(e) => setAdCostVal(e.target.value)}
                      className="text-sm h-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="border-t border-border pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Platform fees (~3%)</span>
                    <span>-${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total costs</span>
                    <span>-${(sc + sh + ac + platformFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-border">
                    <span>TRUE NET PROFIT</span>
                    <span className={netProfit >= 0 ? "text-success" : "text-destructive"}>
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
