import { useState } from "react";
import { ArrowLeft, RefreshCw, AlertCircle, AlertTriangle, Lightbulb, TrendingUp, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Link } from "react-router-dom";

const criticalIssues = [
  {
    title: "Slow Page Load Speed",
    description: "Your product page loads in 6.2s (target: <3s)",
    impact: "-23% conversions",
  },
  {
    title: "Mobile Checkout Broken",
    description: "\"Add to Cart\" button hidden on iPhone Safari",
    impact: "-18% mobile conversions",
  },
];

const warnings = [
  { title: "No Trust Badges", description: "Missing security seals on checkout" },
  { title: "No Customer Reviews", description: "Product pages lack social proof" },
  { title: "Weak Product Descriptions", description: "Descriptions are under 100 words" },
  { title: "No Urgency Elements", description: "No countdown timers or stock indicators" },
];

const suggestions = [
  "Add exit-intent popup",
  "Implement abandoned cart emails",
  "Add product comparison feature",
];

export default function CROAuditor() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 2000);
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
          <h1 className="text-lg font-semibold">CRO Auditor</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5 animate-fade-in">
        {/* Scan Card */}
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">Modern Home Essentials</h3>
                <p className="text-xs text-muted-foreground">Last scan: 2 days ago</p>
              </div>
              <Button
                size="lg"
                className="w-full max-w-xs gap-2"
                onClick={handleScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Run New Scan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasScanned && (
          <>
            {/* Probability Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Conversion Probability
                  </h3>
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <span className="text-3xl font-bold text-muted-foreground">2.1%</span>
                      <span className="text-sm text-muted-foreground ml-1">Current</span>
                    </div>
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-3xl font-bold text-success">3.4%</span>
                      <span className="text-sm text-muted-foreground ml-1">Potential</span>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-sm font-medium">
                      Fix 3 issues to boost by <span className="text-success">+62%</span>
                    </p>
                    <ProgressBar value={62} max={100} variant="success" size="md" className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critical Issues */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-critical" />
                <h2 className="text-sm font-semibold">Critical Issues ({criticalIssues.length})</h2>
              </div>
              <div className="space-y-2">
                {criticalIssues.map((issue, index) => (
                  <Card key={index} className="bg-critical/5 border-critical/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-critical">❌</span>
                            <h4 className="font-medium text-sm">{issue.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                          <p className="text-xs text-critical font-medium mt-1">Impact: {issue.impact}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                          View Fix Guide
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h2 className="text-sm font-semibold">Warnings ({warnings.length})</h2>
              </div>
              <Card className="bg-warning/5 border-warning/20">
                <CardContent className="p-0 divide-y divide-warning/10">
                  {warnings.map((warning, index) => (
                    <div key={index} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-warning">⚠️</span>
                          <span className="text-sm font-medium">{warning.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">{warning.description}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-primary h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-success" />
                <h2 className="text-sm font-semibold">Suggestions ({suggestions.length})</h2>
              </div>
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-3 space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-success">💡</span>
                      <span className="text-muted-foreground">{suggestion}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
