import { ArrowLeft, ExternalLink, Zap, TrendingUp, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AmazonCenter() {
  const navigate = useNavigate();

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
            <h1 className="text-lg font-semibold">Amazon Best Sellers</h1>
          </div>
          <a
            href="https://www.amazon.co.za/gp/bestsellers"
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
          src="https://www.amazon.co.za/gp/bestsellers"
          className="w-full h-full border-0"
          title="Amazon Best Sellers"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}

