import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AliExpressCenter() {
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
            <h1 className="text-lg font-semibold">AliExpress Dropshipping</h1>
          </div>
          <a
            href="https://www.aliexpress.com/dropshipping/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Iframe Container */}
      <div className="w-full flex-1">
        <iframe
          src="https://www.aliexpress.com/dropshipping/"
          className="w-full h-screen border-0"
          title="AliExpress Dropshipping Center"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
        />
      </div>

      {/* Mobile Hint */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-2 bg-primary/10 border-t border-primary/20 text-center text-xs text-muted-foreground md:hidden">
        Scroll to explore AliExpress Dropshipping opportunities
      </div>
    </div>
  );
}
