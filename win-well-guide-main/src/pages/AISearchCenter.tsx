import { ArrowLeft, ExternalLink, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AISearchCenter() {
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
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-critical" />
              <h1 className="text-lg font-semibold">AI Search</h1>
            </div>
          </div>
          <a
            href="https://www.accio.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Iframe Container */}
      <div className="w-full h-[calc(100vh-3.5rem)]">
        <iframe
          src="https://www.accio.com/"
          className="w-full h-full border-0"
          title="Accio AI Search"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
