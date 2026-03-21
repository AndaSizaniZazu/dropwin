import { ArrowLeft, ExternalLink, TrendingUp, Star, Award, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TakealotCenter() {
  const navigate = useNavigate();

  const bestSellers = [
    {
      title: "Electronics",
      description: "Top-selling tech products and gadgets",
      icon: "📱",
    },
    {
      title: "Home & Garden",
      description: "Most popular home improvement items",
      icon: "🏠",
    },
    {
      title: "Fashion & Accessories",
      description: "Best-selling clothing and accessories",
      icon: "👗",
    },
    {
      title: "Sports & Outdoors",
      description: "Popular sporting goods and equipment",
      icon: "⚽",
    },
    {
      title: "Beauty & Personal Care",
      description: "Top beauty and wellness products",
      icon: "💄",
    },
    {
      title: "Books & Media",
      description: "Best-selling books and media",
      icon: "📚",
    },
  ];

  const categories = [
    { name: "All Categories", emoji: "🛍️" },
    { name: "New Arrivals", emoji: "✨" },
    { name: "Deals", emoji: "💰" },
    { name: "Sales", emoji: "🔥" },
    { name: "Specials", emoji: "⭐" },
    { name: "Clearance", emoji: "📉" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/product-intel")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Takealot Trending On Social</h1>
          </div>
          <a
            href="https://www.takealot.com/trending-on-social-media?srsltid=AfmBOoofjiEbKldJ95gYOKiubJHvalVIgSDAvKRPJljOQiz7CJS7kxJk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Iframe Container */}
      <div className="w-full h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
        <iframe
          src="https://www.takealot.com/trending-on-social-media?srsltid=AfmBOoofjiEbKldJ95gYOKiubJHvalVIgSDAvKRPJljOQiz7CJS7kxJk"
          className="w-full h-full border-0"
          title="Takealot Trending on Social Media"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}

