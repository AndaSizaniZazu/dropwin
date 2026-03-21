import { useState } from "react";
import { Zap, Sparkles, CheckCircle2, ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StoreAIBuilder() {
  const [storeName, setStoreName] = useState("");
  const [industry, setIndustry] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Store Design",
      description: "Automatic store layout and theme customization based on your industry"
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Have your Shopify store ready in minutes, not weeks"
    },
    {
      icon: CheckCircle2,
      title: "Complete Configuration",
      description: "Products, payment methods, and shipping all pre-configured"
    }
  ];

  const industries = [
    "Fashion & Apparel",
    "Electronics",
    "Home & Garden",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Books & Media",
    "Toys & Games",
    "Food & Beverage",
    "Pet Supplies",
    "Office Supplies"
  ];

  const handleBuildStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !industry.trim()) return;

    setIsBuilding(true);
    
    // Simulate building process
    setTimeout(() => {
      // Generate a Shopify store URL based on the input
      const storeSlug = storeName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const generatedUrl = `https://${storeSlug}.myshopify.com`;
      setStoreUrl(generatedUrl);
      setIsBuilding(false);
    }, 2000);
  };

  const handleOpenStore = () => {
    if (storeUrl) {
      window.open(storeUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Store AI Builder</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build your Shopify store instantly with AI. Just tell us your store name and industry, 
            and we'll create a fully-configured online store ready to launch.
          </p>
        </div>

        {/* Main Builder Card */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle>Create Your Store</CardTitle>
            <CardDescription>Fill in your store details to get started</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleBuildStore} className="space-y-6">
              {/* Store Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Store Name</label>
                <Input
                  placeholder="e.g., StyleHub, TechGear, EcoHome"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={isBuilding}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Your store URL will be: {storeName ? 
                    `${storeName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.myshopify.com` 
                    : "your-store.myshopify.com"}
                </p>
              </div>

              {/* Industry Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setIndustry(ind)}
                      disabled={isBuilding}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        industry === ind
                          ? "bg-primary text-primary-foreground border border-primary"
                          : "bg-secondary text-secondary-foreground border border-border hover:border-primary"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* Build Button */}
              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={!storeName.trim() || !industry.trim() || isBuilding}
                  className="w-full h-11 text-base font-semibold"
                  size="lg"
                >
                  {isBuilding ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Building Your Store...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Build My Store
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Success State */}
        {storeUrl && (
          <Card className="mb-8 border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <CardTitle>Your Store Is Ready!</CardTitle>
              </div>
              <CardDescription>Your Shopify store has been created and configured</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Store URL:</p>
                <p className="font-mono text-lg font-semibold break-all">{storeUrl}</p>
              </div>
              <Button 
                onClick={handleOpenStore}
                className="w-full"
                size="lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Open Your Shopify Store
              </Button>
              <Button 
                onClick={() => {
                  setStoreUrl(null);
                  setStoreName("");
                  setIndustry("");
                }}
                variant="outline"
                className="w-full"
              >
                Create Another Store
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <feature.icon className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="border-border/50 bg-secondary/30">
          <CardHeader>
            <CardTitle className="text-lg">What's Included?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Professional store theme customized for your industry</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Pre-configured payment methods (Stripe, PayPal, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Shipping method setup and configuration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Mobile-responsive design for all devices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Email setup for transactional messages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">SEO optimization for search engines</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
