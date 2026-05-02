import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ExternalLink, Search, Filter, Flame,
  TrendingUp, MessageSquare, AlertTriangle,
  ChevronDown, ChevronUp, Loader, CheckCircle2, LogIn, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { researchProduct, fetchTrendingProducts, TrendingProduct } from "@/services/storeAnalyzerService";

// ─── Platform config ───────────────────────────────────────────────────────────
const platforms = ["TikTok", "Amazon", "AliExpress", "Takealot"] as const;
type Platform = (typeof platforms)[number];

const CONNECTED_KEY: Record<string, string> = {
  TikTok:     "dropwin_tiktok_connected",
  Amazon:     "dropwin_amazon_connected",
  AliExpress: "dropwin_aliexpress_connected",
};

const platformConfig: Record<Platform, {
  emoji: string;
  description: string;
  url: string;
  loginUrl: string;
  loginMethod: string;
  gradient: string;
}> = {
  TikTok: {
    emoji:       "🎵",
    description: "Top trending products & winning ad creatives",
    url:         "https://ads.tiktok.com/business/creativecenter/top-products/pc/en",
    loginUrl:    "https://ads.tiktok.com/i18n/login",
    loginMethod: "TikTok Business account",
    gradient:    "from-pink-500/10 to-transparent",
  },
  Amazon: {
    emoji:       "📦",
    description: "Movers & Shakers — top trending products this week on Amazon ZA",
    url:         "https://www.amazon.co.za/gp/movers-and-shakers",
    loginUrl:    "https://www.amazon.co.za/ap/signin",
    loginMethod: "Amazon account",
    gradient:    "from-orange-500/10 to-transparent",
  },
  AliExpress: {
    emoji:       "🛍️",
    description: "Browse trending & best-selling dropshipping products on AliExpress",
    url:         "https://www.aliexpress.com/",
    loginUrl:    "https://login.aliexpress.com/",
    loginMethod: "AliExpress account",
    gradient:    "from-red-500/10 to-transparent",
  },
  Takealot: {
    emoji:       "🏪",
    description: "Trending products on South Africa's #1 retailer",
    url:         "https://www.takealot.com/trending-on-social-media",
    loginUrl:    "",
    loginMethod: "Takealot account",
    gradient:    "from-blue-500/10 to-transparent",
  },
};


// ─── Component ─────────────────────────────────────────────────────────────────
export default function ProductIntel() {
  const [searchQuery,      setSearchQuery]      = useState("");
  const [activePlatform,   setActivePlatform]   = useState<Platform | null>(null);
  const [expandedProduct,  setExpandedProduct]  = useState<number | null>(null);
  const [isSearching,      setIsSearching]      = useState(false);
  const [searchResults,    setSearchResults]    = useState<any>(null);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [loadingTrends,    setLoadingTrends]    = useState(true);
  const [trendsError,      setTrendsError]      = useState<string | null>(null);
  const [connected,        setConnected]        = useState<Record<string, boolean>>(() => ({
    TikTok:     localStorage.getItem(CONNECTED_KEY.TikTok)     === "true",
    Amazon:     localStorage.getItem(CONNECTED_KEY.Amazon)     === "true",
    AliExpress: localStorage.getItem(CONNECTED_KEY.AliExpress) === "true",
  }));
  const [signingIn,        setSigningIn]        = useState<Platform | null>(null);
  const popupRef = useRef<Window | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signInWithGoogle } = useAuth();

  // Clean up popup poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Load trending products from Google Trends on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingTrends(true);
    setTrendsError(null);
    fetchTrendingProducts("ZA")
      .then((res) => {
        if (!cancelled) setTrendingProducts(res.trends);
      })
      .catch((err) => {
        if (!cancelled) setTrendsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingTrends(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── One-time sign-in popup: open login page, detect close, mark connected ──
  const handleSignInPopup = (platform: Platform) => {
    const cfg = platformConfig[platform];
    if (!cfg.loginUrl) return;

    setSigningIn(platform);
    const popup = window.open(
      cfg.loginUrl,
      `${platform}-login`,
      "width=520,height=680,left=200,top=100"
    );
    popupRef.current = popup;

    pollRef.current = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(pollRef.current!);
        setSigningIn(null);
        localStorage.setItem(CONNECTED_KEY[platform], "true");
        setConnected((prev) => ({ ...prev, [platform]: true }));
        toast({
          title: `${platform} connected`,
          description: `Opening ${platform === "TikTok" ? "Creative Center" : platform} now…`,
        });
        window.open(cfg.url, "_blank", "noopener,noreferrer");
      }
    }, 600);
  };

  const markDisconnected = (platform: Platform) => {
    localStorage.removeItem(CONNECTED_KEY[platform]);
    setConnected((prev) => ({ ...prev, [platform]: false }));
    toast({ title: `${platform} disconnected` });
  };

  // ── Platform click: toggle card, open Takealot directly ─────────────────
  const handlePlatformClick = (platform: Platform) => {
    if (platform === "Takealot") {
      window.open(platformConfig.Takealot.url, "_blank", "noopener,noreferrer");
      toast({ title: "Opening Takealot", description: "Trending products opening in a new tab." });
      return;
    }
    setActivePlatform((prev) => (prev === platform ? null : platform));
  };

  // ── Search via Python API ────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: "Error", description: "Please enter a search query", variant: "destructive" });
      return;
    }
    setIsSearching(true);
    try {
      const result = await researchProduct({
        query: searchQuery,
        platforms: activePlatform ? [activePlatform.toLowerCase()] : undefined,
      });
      if (result.success && result.research) {
        setSearchResults(result);
        toast({ title: "Research complete" });
      } else {
        toast({ title: "Research failed", description: result.error || "Try again", variant: "destructive" });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to research product",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Product Intel</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 animate-fade-in">

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search products across platforms…"
              className="pl-9"
              disabled={isSearching}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="px-4">
            {isSearching ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Searching…</> : "Search"}
          </Button>
        </div>

        {/* Platform tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {platforms.map((p) => (
            <Button
              key={p}
              variant={activePlatform === p ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 gap-1.5"
              onClick={() => handlePlatformClick(p)}
            >
              <span>{platformConfig[p].emoji}</span>
              {p}
              {p !== "Takealot" && <ExternalLink className="w-3 h-3 opacity-60" />}
            </Button>
          ))}
        </div>

        {/* Platform Launcher Card */}
        {activePlatform && (
          <Card className={`border bg-gradient-to-br ${platformConfig[activePlatform].gradient} border-border/60`}>
            <CardContent className="p-4 space-y-4">
              {/* Platform header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center text-2xl shadow-sm">
                  {platformConfig[activePlatform].emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{activePlatform} Creative Center</h3>
                  <p className="text-xs text-muted-foreground">{platformConfig[activePlatform].description}</p>
                </div>
                {connected[activePlatform] && (
                  <Badge className="text-[10px] bg-success/15 text-success border-success/30 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </Badge>
                )}
              </div>

              {/* Status banner */}
              {connected[activePlatform] ? (
                <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/5 px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">
                      Auto-login active — you're all set
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Your {activePlatform} session is saved in this browser. Clicking Open below
                      will land you directly on the platform, already signed in.
                    </p>
                  </div>
                  <button
                    className="text-[10px] text-muted-foreground hover:text-destructive underline flex-shrink-0 mt-0.5"
                    onClick={() => markDisconnected(activePlatform)}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">One-time setup required</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Sign in to {activePlatform} once below. After that, every time you click
                        "Open" you'll land directly on the platform — no login prompt.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2 h-8 text-xs"
                    disabled={signingIn === activePlatform}
                    onClick={() => handleSignInPopup(activePlatform)}
                  >
                    {signingIn === activePlatform ? (
                      <><RefreshCw className="w-3 h-3 animate-spin" />Waiting for sign-in…</>
                    ) : (
                      <><LogIn className="w-3 h-3" />Sign in to {activePlatform}</>
                    )}
                  </Button>
                  {signingIn === activePlatform && (
                    <p className="text-[10px] text-center text-muted-foreground">
                      Complete the login in the popup, then close it to continue.
                    </p>
                  )}
                </div>
              )}

              {/* Launch button — only shown once connected */}
              {connected[activePlatform] && (
                <Button
                  className="w-full gap-2"
                  onClick={() => window.open(platformConfig[activePlatform].url, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open {activePlatform}
                </Button>
              )}

              <p className="text-[10px] text-center text-muted-foreground">
                Opens in a new tab — ad platforms block in-app embedding for security reasons.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchResults?.research && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm">Results for: {searchResults.query}</h3>
              <div className="text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto bg-muted/30 p-4 rounded-md">
                {searchResults.research.markdown_report}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trending label */}
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-critical" />
          <span className="text-sm font-semibold">Trending Now</span>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            Reddit · r/dropshipping
          </Badge>
        </div>

        {/* Loading state */}
        {loadingTrends && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading Google Trends data…</span>
          </div>
        )}

        {/* Error state */}
        {!loadingTrends && trendsError && (
          <Card>
            <CardContent className="p-4 flex items-start gap-3 text-destructive">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Could not load trends</p>
                <p className="text-xs text-muted-foreground mt-0.5">{trendsError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-7 text-xs gap-1.5"
                  onClick={() => {
                    setLoadingTrends(true);
                    setTrendsError(null);
                    fetchTrendingProducts("ZA")
                      .then((res) => setTrendingProducts(res.trends))
                      .catch((err) => setTrendsError(err.message))
                      .finally(() => setLoadingTrends(false));
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products list */}
        {!loadingTrends && !trendsError && (
          <div className="space-y-3">
            {trendingProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden transition-all duration-300">
                <CardContent className="p-4">
                  {/* Product header */}
                  <div className="flex items-start gap-3">
                    {/* Image or rank badge */}
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center text-lg font-bold text-muted-foreground flex-shrink-0">
                        #{product.id}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-critical" />
                          {product.traffic}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            product.adFatigue > 70
                              ? "bg-critical/10 text-critical border-critical/20"
                              : product.adFatigue > 40
                              ? "bg-warning/10 text-warning border-warning/20"
                              : "bg-success/10 text-success border-success/20"
                          }`}
                        >
                          {product.adFatigue > 70
                            ? "🔴 High saturation"
                            : product.adFatigue > 40
                            ? "🟡 Medium saturation"
                            : "🟢 Low saturation"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                    >
                      {expandedProduct === product.id
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Expanded detail */}
                  {expandedProduct === product.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-slide-up">
                      {/* Why trending */}
                      <div className="bg-primary/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-1">
                          <TrendingUp className="w-3 h-3" />
                          Why It's Trending
                        </div>
                        <p className="text-sm text-muted-foreground">{product.whyTrending}</p>
                      </div>

                      {/* Sentiment */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-medium mb-2">
                          <MessageSquare className="w-3 h-3" />
                          Sentiment Analysis
                          <span className="text-[10px] text-muted-foreground font-normal">— from community upvotes</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { label: "😍 Positive", val: product.sentiment.positive, variant: "success"  as const },
                            { label: "😐 Neutral",  val: product.sentiment.neutral,  variant: "default"  as const },
                            { label: "😤 Negative", val: product.sentiment.negative, variant: "critical" as const },
                          ].map(({ label, val, variant }) => (
                            <div key={label} className="flex items-center gap-2">
                              <span className="text-xs w-16">{label}</span>
                              <ProgressBar value={val} variant={variant} size="sm" className="flex-1" />
                              <span className="text-xs font-medium w-8">{val}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* News headlines */}
                      {product.newsItems.length > 0 && (
                        <div>
                          <div className="text-xs font-medium mb-2">💬 Community Post</div>
                          <div className="space-y-2">
                            {product.newsItems.map((n, i) => (
                              <div key={i} className="text-xs text-muted-foreground space-y-0.5">
                                <p className="text-foreground font-medium leading-snug">• {n.title}</p>
                                {n.snippet && (
                                  <p className="pl-3 text-muted-foreground line-clamp-2">{n.snippet}</p>
                                )}
                                <p className="pl-3 text-[10px] text-muted-foreground/70">
                                  {n.source}{n.time ? ` · ${n.time}` : ""}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ad fatigue */}
                      <div className="bg-warning/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-warning">
                            <AlertTriangle className="w-3 h-3" />
                            Market Saturation
                          </div>
                          <span className="text-xs text-muted-foreground">{product.adFatigueViews}</span>
                        </div>
                        <ProgressBar
                          value={product.adFatigue}
                          variant={product.adFatigue > 70 ? "critical" : product.adFatigue > 40 ? "warning" : "success"}
                          size="md"
                        />
                        {product.adFatigue > 70 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 High search volume = high competition. Find a unique angle or niche.
                          </p>
                        )}
                        {product.adFatigue <= 40 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ✅ Early trend — low competition window still open.
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSearchQuery(product.name);
                            handleSearch();
                          }}
                        >
                          📊 Research This
                        </Button>
                        <Button size="sm" className="flex-1">➕ Track Product</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
