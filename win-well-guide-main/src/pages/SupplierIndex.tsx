import { useState } from "react";
import { Search, Star, Package, Clock, AlertTriangle, Bell, TrendingUp, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";

const suppliers = [
  {
    id: 1,
    name: "ShenZhen Lighting Co.",
    reliabilityScore: 87,
    stars: 4,
    shippingAdvertised: "7-12 days",
    shippingActual: 11,
    shippingOnTime: 82,
    disputeRate: 2.1,
    disputeTrend: +0.3,
    price: 8.50,
    moq: 1,
    stock: "5,000+",
    alertEnabled: true,
  },
  {
    id: 2,
    name: "Guangzhou Home Products",
    reliabilityScore: 92,
    stars: 5,
    shippingAdvertised: "5-10 days",
    shippingActual: 8,
    shippingOnTime: 91,
    disputeRate: 1.2,
    disputeTrend: -0.1,
    price: 9.20,
    moq: 5,
    stock: "10,000+",
    alertEnabled: false,
  },
  {
    id: 3,
    name: "CJ Dropshipping - LED Division",
    reliabilityScore: 78,
    stars: 3,
    shippingAdvertised: "8-15 days",
    shippingActual: 14,
    shippingOnTime: 68,
    disputeRate: 3.4,
    disputeTrend: +1.2,
    price: 7.80,
    moq: 1,
    stock: "3,000+",
    alertEnabled: true,
  },
];

const backupSupplier = {
  name: "CJ Dropshipping - LED Division",
  score: 92,
  shipping: "9 days avg",
  price: 9.20,
};

export default function SupplierIndex() {
  const [searchQuery, setSearchQuery] = useState("LED Sunset Lamp");
  const [shipTo, setShipTo] = useState("USA");
  const [alertStates, setAlertStates] = useState<{ [key: number]: boolean }>(
    suppliers.reduce((acc, s) => ({ ...acc, [s.id]: s.alertEnabled }), {})
  );

  const toggleAlert = (id: number) => {
    setAlertStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold">Supplier Index</h1>
          <Button variant="ghost" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 animate-fade-in">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers..."
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            Ship to: {shipTo} ▼
          </Button>
          <Button variant="outline" size="sm">
            Platform: All ▼
          </Button>
        </div>

        {/* Suppliers List */}
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < supplier.stars
                              ? "fill-warning text-warning"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{supplier.reliabilityScore}</div>
                    <div className="text-xs text-muted-foreground">/100</div>
                  </div>
                </div>

                {/* Reliability Progress */}
                <ProgressBar
                  value={supplier.reliabilityScore}
                  variant={
                    supplier.reliabilityScore >= 85
                      ? "success"
                      : supplier.reliabilityScore >= 70
                      ? "warning"
                      : "critical"
                  }
                  size="md"
                />

                {/* Shipping */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs font-medium mb-2">
                    <Clock className="w-3 h-3" />
                    Shipping (to USA)
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Advertised: {supplier.shippingAdvertised}</span>
                    <span className="font-medium">Actual: {supplier.shippingActual} days</span>
                  </div>
                  <div className="mt-2">
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-success via-warning to-critical" style={{ width: "100%" }} />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background shadow"
                        style={{ left: `${(supplier.shippingActual / 30) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>7</span>
                      <span>10</span>
                      <span>14</span>
                      <span>21</span>
                      <span>30</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {supplier.shippingOnTime}% on time
                  </p>
                </div>

                {/* Dispute Rate */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Dispute Rate (30 days)
                    </div>
                    <div className={`text-sm font-semibold ${
                      supplier.disputeRate > 3 ? "text-critical" : supplier.disputeRate > 2 ? "text-warning" : "text-success"
                    }`}>
                      {supplier.disputeRate}%
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`w-3 h-3 ${supplier.disputeTrend > 0 ? "text-critical" : "text-success"}`} />
                    <span className={`text-xs ${supplier.disputeTrend > 0 ? "text-critical" : "text-success"}`}>
                      {supplier.disputeTrend > 0 ? "+" : ""}{supplier.disputeTrend}% this month
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({supplier.disputeTrend > 0.5 ? "Elevated" : "Normal"})
                    </span>
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold ml-1">${supplier.price}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MOQ:</span>
                    <span className="font-semibold ml-1">{supplier.moq}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-semibold ml-1">{supplier.stock}</span>
                  </div>
                </div>

                {/* Alert Toggle */}
                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Alert me if reliability drops</span>
                  </div>
                  <Switch
                    checked={alertStates[supplier.id]}
                    onCheckedChange={() => toggleAlert(supplier.id)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <ExternalLink className="w-3 h-3" />
                    View on AliExpress
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Package className="w-3 h-3" />
                    Backup Suppliers
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Backup Suggestion */}
        <div>
          <div className="text-sm font-medium mb-2 flex items-center gap-2">
            🔄 Suggested Backup
          </div>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{backupSupplier.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ⭐ {backupSupplier.score}/100 | 📦 {backupSupplier.shipping} | ${backupSupplier.price}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                  Recommended
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
