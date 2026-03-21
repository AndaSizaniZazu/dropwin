import { useState } from "react";
import { Search, Play, Eye, Copy, ExternalLink, Send, Bookmark, Users, Store, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "@/components/ui/progress-bar";

const topAds = [
  {
    id: 1,
    product: "LED Sunset Lamp",
    thumbnail: "🌅",
    views: "2.3M",
    estRevenue: "$50K",
    platform: "TikTok",
    hook: "POV: Your room is about to look 10x better for under $30",
    hookType: "Problem-Solution | POV Style",
    script: `POV: Your room is about to look 10x better for under $30.

I found this sunset lamp on TikTok and honestly? It hits different.

The golden hour glow makes everything look aesthetic without any effort.

Perfect for content creators, or anyone who wants their space to feel like a vibe.

Link in bio - trust me on this one.`,
  },
  {
    id: 2,
    product: "Portable Blender",
    thumbnail: "🧋",
    views: "1.8M",
    estRevenue: "$35K",
    platform: "TikTok",
    hook: "Stop paying $15 for smoothies when you can make them anywhere",
    hookType: "Pain Point | Cost Savings",
    script: `Stop paying $15 for smoothies.

This portable blender changed my morning routine completely.

USB rechargeable, fits in your gym bag, and makes perfect smoothies in 30 seconds.

I've saved over $200 this month alone.`,
  },
];

const competitors = [
  {
    name: "glowlamps.co",
    rating: "Top 5%",
    estRevenue: "$120K/mo",
    trustBadges: ["Secure Checkout", "Free Shipping", "30-Day Return", "4.9 Reviews"],
    offers: ["Buy 2 Get 1 FREE", "15% off with email signup", "Free shipping over $50"],
    layout: ["Hero: Video + Urgency Timer", "Social Proof: UGC Reviews", "Benefits: 3-Column Icons", "FAQ: Accordion Style", "CTA: Sticky Add-to-Cart"],
  },
];

const influencers = [
  {
    id: 1,
    handle: "@cozyroom.vibes",
    avatar: "🏠",
    location: "USA",
    niche: "Home Decor",
    followers: "34.2K",
    engagement: "4.8%",
    matchScore: 94,
    audience: "18-34, 70% female",
    postsAbout: "Room makeovers, aesthetic",
    avgViews: "45K",
    estRate: "$150-300",
  },
  {
    id: 2,
    handle: "@aesthetic.living",
    avatar: "✨",
    location: "UK",
    niche: "Interior Design",
    followers: "28.1K",
    engagement: "5.2%",
    matchScore: 91,
    audience: "21-35, 65% female",
    postsAbout: "Home styling, minimalism",
    avgViews: "38K",
    estRate: "$120-250",
  },
  {
    id: 3,
    handle: "@modernhome.tips",
    avatar: "🪴",
    location: "CA",
    niche: "Home Tips",
    followers: "52.8K",
    engagement: "3.9%",
    matchScore: 87,
    audience: "25-40, 60% female",
    postsAbout: "Home hacks, organization",
    avgViews: "62K",
    estRate: "$200-400",
  },
];

export default function SpyTools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [activeTab, setActiveTab] = useState("ads");
  const [showBigSpy, setShowBigSpy] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 h-14 flex items-center">
          <h1 className="text-lg font-semibold">Spy Tools</h1>
        </div>
      </header>

      <div className="animate-fade-in">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="ads" className="flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                Ads
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-1.5">
                💳 Payment
              </TabsTrigger>
              <TabsTrigger value="stores" className="flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                Stores
              </TabsTrigger>
              <TabsTrigger value="influencers" className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Influencers
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Ads Tab */}
          <TabsContent value="ads" className="px-4 py-4 space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search competitor ads..."
                  className="pl-9"
                />
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>🔥</span>
                  <span>Top Performing Ads This Week</span>
                </div>
              </div>

              {/* BigSpy Iframe Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm">BigSpy Page Analysis</h3>
                  </div>
                  <div className="w-full h-96 bg-background">
                    <iframe
                      src="https://bigspy.com/page-analysis"
                      className="w-full h-full border-0"
                      title="BigSpy Page Analysis"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="px-4 py-4 space-y-4">
            <div className="space-y-4">
              {/* Payment Methods Section */}
              <div>
                <div className="text-sm font-semibold mb-4">💳 Payment Methods</div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Stripe Card */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600/10 rounded flex items-center justify-center text-lg">
                          💳
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Stripe</h4>
                          <p className="text-[10px] text-muted-foreground">Primary</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-[10px]">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Status:</span> Active
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Volume:</span> $127.5K
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PayPal Card */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center text-lg">
                          🅿️
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">PayPal</h4>
                          <p className="text-[10px] text-muted-foreground">Secondary</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-[10px]">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Status:</span> Active
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Volume:</span> $34.2K
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Stripe Details */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="text-sm font-semibold mb-4">🔐 Stripe Details</div>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Account Status</p>
                        <p className="text-sm font-medium text-green-600">✓ Verified</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Transaction Volume</p>
                        <p className="text-sm font-medium">$127,534</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Processing Fee</p>
                        <p className="text-sm font-medium">2.9% + $0.30</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Dispute Rate</p>
                        <p className="text-sm font-medium text-green-600">0.8%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Influencers Tab */}
          <TabsContent value="influencers" className="px-4 py-4 space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Brand24 Influencers</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        "https://app.brand24.com/panel/influencers/1397402893?p=1&or=5&cdt=days&dr=4&va=1&d1=2026-01-23&d2=2026-02-22",
                        "_blank"
                      )
                    }
                    className="gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Brand24
                  </Button>
                </div>
                <div className="p-8 text-center min-h-96 flex flex-col items-center justify-center bg-muted/30">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Brand24 influencer dashboard
                  </p>
                  <Button
                    onClick={() =>
                      window.open(
                        "https://app.brand24.com/panel/influencers/1397402893?p=1&or=5&cdt=days&dr=4&va=1&d1=2026-01-23&d2=2026-02-22",
                        "_blank"
                      )
                    }
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Influencers Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
