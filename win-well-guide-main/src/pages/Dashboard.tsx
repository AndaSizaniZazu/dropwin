import { Bell, Settings, Package, BarChart3, AlertCircle, TrendingUp, Search, Eye, Users } from "lucide-react";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { StatCard } from "@/components/ui/stat-card";
import { AlertCard } from "@/components/ui/alert-card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const alerts = [
  {
    type: "critical" as const,
    title: "Supplier Alert",
    description: "CJ-Electronics dispute rate spiked 340%",
    time: "2m ago",
  },
  {
    type: "warning" as const,
    title: "Ad Fatigue Warning",
    description: "LED Sunset Lamp creative seen by 5M+ users",
    time: "1h ago",
  },
  {
    type: "success" as const,
    title: "New Opportunity",
    description: "Trending product matches your Home Decor niche",
    time: "3h ago",
  },
];

const quickActions = [
  { icon: BarChart3, label: "Run Store Audit", path: "/store-audit", color: "bg-primary/10 text-primary" },
  { icon: Search, label: "Find Products", path: "/product-intel", color: "bg-success/10 text-success" },
  { icon: Eye, label: "Spy on Competitors", path: "/spy-tools", color: "bg-warning/10 text-warning" },
  { icon: Users, label: "Find Influencers", path: "/spy-tools", color: "bg-purple-500/10 text-purple-500" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            DropWin
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-critical rounded-full" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 animate-fade-in">
        {/* Score Gauge */}
        <div className="flex flex-col items-center py-4">
          <ScoreGauge score={78} label="Store Success Score" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard icon={Package} value="12" label="Products" />
          <StatCard icon={BarChart3} value="5" label="Audits" />
          <StatCard icon={AlertCircle} value="3" label="Alerts" />
          <StatCard icon={TrendingUp} value="89%" label="Health" />
        </div>

        {/* Alerts Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              See All →
            </Button>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <AlertCard
                key={index}
                {...alert}
                className="animate-slide-up"
              />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] hover:border-primary/30"
              >
                <div className={`p-2.5 rounded-lg ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
