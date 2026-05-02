import { useState } from "react";
import { Search, Copy, ExternalLink, Users, Store, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleAccountBanner } from "@/components/GoogleAccountBanner";

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

export default function SpyTools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [activeTab, setActiveTab] = useState("ads");

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

              {/* Google account banner – BigSpy uses Google OAuth */}
              <GoogleAccountBanner
                platformName="BigSpy"
                platformUrl="https://bigspy.com/page-analysis"
              />

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

          {/* Stores Tab */}
          <TabsContent value="stores" className="px-4 py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="Enter competitor store URL..."
                className="pl-9"
              />
            </div>

            <div className="text-sm font-semibold flex items-center gap-2">
              <Store className="w-4 h-4" />
              Top Competitor Stores
            </div>

            {competitors.map((store) => (
              <Card key={store.name}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{store.name}</h3>
                      <p className="text-xs text-muted-foreground">{store.rating} performer</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-success">{store.estRevenue}</div>
                      <div className="text-xs text-muted-foreground">Est. monthly</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Trust Badges</p>
                    <div className="flex flex-wrap gap-1">
                      {store.trustBadges.map((badge) => (
                        <span key={badge} className="text-[10px] bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5">
                          ✓ {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Active Offers</p>
                    <div className="space-y-0.5">
                      {store.offers.map((offer) => (
                        <p key={offer} className="text-xs text-foreground">• {offer}</p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Landing Page Layout</p>
                    <div className="space-y-0.5">
                      {store.layout.map((item, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{i + 1}. {item}</p>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => window.open(`https://${store.name}`, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit Store
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Copy className="w-3 h-3" />
                      Copy Layout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
