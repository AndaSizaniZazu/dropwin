import { useState } from "react";
import { ArrowLeft, ExternalLink, Search, Filter, Star, Flame, TrendingUp, MessageSquare, AlertTriangle, Tag, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { researchProduct } from "@/services/storeAnalyzerService";

const platforms = ["TikTok", "Amazon", "AliExpress", "Takealot"];

const platformRoutes: Record<string, string> = {
  "TikTok": "https://ads.tiktok.com/business/creativecenter/top-products/pc/en",
  "Amazon": "https://www.amazon.co.za/gp/bestsellers",
  "AliExpress": "https://www.aliexpress.com/",
  "Takealot": "https://www.takealot.com/trending-on-social-media?srsltid=AfmBOoofjiEbKldJ95gYOKiubJHvalVIgSDAvKRPJljOQiz7CJS7kxJk",
};

const trendingProducts = [
  {
    id: 1,
    name: "LED Sunset Lamp",
    image: "🌅",
    rating: 4.8,
    salesPerWeek: "15.2K",
    supplierCost: 8.50,
    sellingPrice: 34.99,
    margin: 76,
    whyTrending: "TikTok aesthetic lighting trend + gift season approaching. High shareability and UGC potential.",
    sentiment: { positive: 72, neutral: 18, negative: 10 },
    topComments: [
      { text: "I wish this came in blue!", likes: 847 },
      { text: "Shipping took 3 weeks 😤", likes: 523 },
      { text: "Best room upgrade ever", likes: 1200 },
    ],
    adFatigue: 85,
    adFatigueViews: "5.2M",
    opportunities: ["Blue Variant", "Fast Shipping", "Gift Bundle"],
    saturation: "medium",
  },
  {
    id: 2,
    name: "Portable Blender",
    image: "🧋",
    rating: 4.6,
    salesPerWeek: "8.7K",
    supplierCost: 12.00,
    sellingPrice: 39.99,
    margin: 70,
    whyTrending: "Health & fitness trend continues. Perfect for gym-goers and busy professionals.",
    sentiment: { positive: 68, neutral: 22, negative: 10 },
    topComments: [
      { text: "Perfect for protein shakes!", likes: 632 },
      { text: "Battery life is amazing", likes: 445 },
    ],
    adFatigue: 45,
    adFatigueViews: "2.1M",
    opportunities: ["Recipe Book Bundle", "Premium Version"],
    saturation: "low",
  },
  {
    id: 3,
    name: "Cloud Slides",
    image: "☁️",
    rating: 4.5,
    salesPerWeek: "22.1K",
    supplierCost: 6.00,
    sellingPrice: 29.99,
    margin: 80,
    whyTrending: "Comfort footwear trend exploding. Celebrity endorsements driving demand.",
    sentiment: { positive: 65, neutral: 25, negative: 10 },
    topComments: [
      { text: "Most comfortable slides ever!", likes: 2100 },
      { text: "Run a size small", likes: 890 },
    ],
    adFatigue: 92,
    adFatigueViews: "8.5M",
    opportunities: ["Size Guide", "Bundle Deal"],
    saturation: "high",
  },
];

function ProductIntelContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("TikTok");
  const [expandedProduct, setExpandedProduct] = useState<number | null>(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [iframeTitle, setIframeTitle] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlatformClick = (platform: string) => {
    const url = platformRoutes[platform];
    if (url) {
      // Takealot has iframe restrictions, open in new tab
      if (platform === "Takealot") {
        window.open(url, "_blank");
        toast({
          title: "Opening",
          description: `Opening ${platform} in a new tab...`,
        });
      } else {
        setIframeUrl(url);
        setIframeTitle(`${platform} Trending`);
        setShowIframe(true);
      }
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Map platform selection to API format
      const platforms = selectedPlatform === "All" 
        ? undefined 
        : [selectedPlatform.toLowerCase()];
      
      const result = await researchProduct({
        query: searchQuery,
        platforms: platforms
      });

      if (result.success && result.research) {
        setSearchResults(result);
        toast({
          title: "Success",
          description: "Product research completed",
        });
      } else {
        toast({
          title: "Research Failed",
          description: result.error || "Failed to research product",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to research product";
      toast({
        title: "Error",
        description: errorMessage,
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
          <h1 className="text-lg font-semibold">Product Intel</h1>
          <Button variant="ghost" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 animate-fade-in">
        {/* Search */}
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search products (e.g., TikTok, AliExpress, Takealot, Amazon)..."
              className="pl-9 bg-muted text-foreground placeholder:text-muted-foreground border-muted-foreground/20"
              disabled={isSearching}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSearching ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {platforms.map((platform) => (
            <Button
              key={platform}
              variant="default"
              size="sm"
              className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
              onClick={() => handlePlatformClick(platform)}
            >
              {platform}
              <ExternalLink className="w-3 h-3" />
            </Button>
          ))}
        </div>

        {/* Iframe Card */}
        {showIframe && (
          <Card className="mb-4 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between bg-muted/50 px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">{iframeTitle}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIframe(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              <div className="w-full h-96 bg-background">
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  title={iframeTitle}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox"
                  onError={() => {
                    toast({
                      title: "Error",
                      description: "Unable to load content. Please try opening in a new tab.",
                      variant: "destructive",
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchResults && searchResults.research && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Research Results for: {searchResults.query}</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="text-sm text-foreground whitespace-pre-wrap max-h-96 overflow-y-auto bg-muted/30 p-4 rounded-md">
                    {searchResults.research.markdown_report}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trending Label */}
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-critical" />
          <span className="text-sm font-semibold">Trending Now</span>
        </div>

        {/* Products List */}
        <div className="space-y-3">
          {trendingProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden transition-all duration-300"
            >
              <CardContent className="p-4">
                {/* Product Header */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center text-2xl">
                    {product.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-warning text-warning" />
                        {product.rating}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-critical" />
                        {product.salesPerWeek} sales/week
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">${product.supplierCost} →</span>
                      <span className="text-sm font-semibold text-success">${product.sellingPrice}</span>
                      <Badge variant="secondary" className="text-[10px]">{product.margin}% margin</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                  >
                    {expandedProduct === product.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded Content */}
                {expandedProduct === product.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 animate-slide-up">
                    {/* Why Trending */}
                    <div className="bg-primary/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-primary mb-1">
                        <TrendingUp className="w-3 h-3" />
                        Why It's Trending
                      </div>
                      <p className="text-sm text-muted-foreground">{product.whyTrending}</p>
                    </div>

                    {/* Sentiment Analysis */}
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium mb-2">
                        <MessageSquare className="w-3 h-3" />
                        Sentiment Analysis
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">😍 Positive</span>
                          <ProgressBar value={product.sentiment.positive} variant="success" size="sm" className="flex-1" />
                          <span className="text-xs font-medium w-8">{product.sentiment.positive}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">😐 Neutral</span>
                          <ProgressBar value={product.sentiment.neutral} variant="default" size="sm" className="flex-1" />
                          <span className="text-xs font-medium w-8">{product.sentiment.neutral}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-16">😤 Negative</span>
                          <ProgressBar value={product.sentiment.negative} variant="critical" size="sm" className="flex-1" />
                          <span className="text-xs font-medium w-8">{product.sentiment.negative}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Comments */}
                    <div>
                      <div className="text-xs font-medium mb-2">📝 Top Comments</div>
                      <div className="space-y-1.5">
                        {product.topComments.map((comment, i) => (
                          <div key={i} className="text-xs text-muted-foreground flex justify-between items-center">
                            <span className="truncate flex-1">• "{comment.text}"</span>
                            <span className="text-[10px] flex-shrink-0 ml-2">({comment.likes.toLocaleString()} likes)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ad Fatigue */}
                    <div className="bg-warning/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-warning">
                          <AlertTriangle className="w-3 h-3" />
                          Ad Fatigue Level
                        </div>
                        <span className="text-xs text-muted-foreground">{product.adFatigueViews} views</span>
                      </div>
                      <ProgressBar
                        value={product.adFatigue}
                        variant={product.adFatigue > 70 ? "critical" : product.adFatigue > 40 ? "warning" : "success"}
                        size="md"
                      />
                      {product.adFatigue > 70 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 Recommend: Create new creative angle
                        </p>
                      )}
                    </div>

                    {/* Opportunities */}
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium mb-2">
                        <Tag className="w-3 h-3" />
                        Opportunities
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.opportunities.map((opp, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {opp}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        📊 Full Analysis
                      </Button>
                      <Button size="sm" className="flex-1">
                        ➕ Add to Store
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductIntel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Product Intel</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Iframe Container */}
      <div className="w-full h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
        <div className="w-full h-full border-0">
          <ProductIntelContent />
        </div>
      </div>
    </div>
  );
}
