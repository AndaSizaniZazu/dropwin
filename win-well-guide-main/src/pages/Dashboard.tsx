import { useState, useEffect, useRef } from "react";
import {
  Bell, Settings, Package, BarChart3, AlertCircle,
  TrendingUp, Search, Eye, Store, Plus, X,
} from "lucide-react";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { StatCard } from "@/components/ui/stat-card";
import { AlertCard } from "@/components/ui/alert-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const STORE_URL_KEY  = "dropwin_store_url";
export const STORE_NAME_KEY = "dropwin_store_name";

type Alert = {
  id: string;
  type: "critical" | "warning" | "success";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const quickActions = [
  { icon: BarChart3, label: "Run Store Audit",     path: "/store-audit",      color: "bg-primary/10 text-primary" },
  { icon: Search,    label: "Find Products",        path: "/product-intel",    color: "bg-success/10 text-success" },
  { icon: Eye,       label: "Spy on Competitors",   path: "/spy-tools",        color: "bg-warning/10 text-warning" },
  { icon: Store,     label: "Supplier Index",       path: "/supplier-index",   color: "bg-purple-500/10 text-purple-500" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [storeUrl,   setStoreUrl]   = useState(() => localStorage.getItem(STORE_URL_KEY)  || "");
  const [storeName,  setStoreName]  = useState(() => localStorage.getItem(STORE_NAME_KEY) || "");
  const [storeInput, setStoreInput] = useState("");
  const [alerts,     setAlerts]     = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [stats,      setStats]      = useState({ products: 0, audits: 0, health: 0 });

  const alertPanelRef = useRef<HTMLDivElement>(null);
  const hasStore    = !!storeUrl;
  const unreadCount = alerts.filter((a) => !a.read).length;

  // ── Load data + subscribe to real-time ───────────────────────────────────
  useEffect(() => {
    if (!hasStore) return;

    if (!isSupabaseConfigured || !user) {
      // Demo data when running without Supabase
      setStats({ products: 12, audits: 5, health: 89 });
      setAlerts([
        { id: "1", type: "warning",  title: "Ad Fatigue Warning", description: "LED Sunset Lamp creative seen by 5M+ users", time: "1h ago",  read: false },
        { id: "2", type: "success",  title: "New Opportunity",    description: "Trending product matches your niche",           time: "3h ago", read: true  },
      ]);
      return;
    }

    // Initial counts
    supabase.from("tracked_products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setStats((s) => ({ ...s, products: count ?? 0 })));

    supabase.from("store_audits")
      .select("health_percentage", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data, count }) =>
        setStats((s) => ({ ...s, audits: count ?? 0, health: (data?.[0] as any)?.health_percentage ?? 0 }))
      );

    // Recent unresolved audit alerts
    supabase.from("audit_alerts")
      .select("*")
      .eq("user_id", user.id)
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) {
          setAlerts(
            data.map((a) => ({
              id: a.id,
              type: a.severity === "high" ? "critical" : a.severity === "medium" ? "warning" : "success",
              title:
                a.type === "sales"     ? "Sales Alert"      :
                a.type === "stock"     ? "Stock Warning"    :
                a.type === "retention" ? "Retention Alert"  : "Store Alert",
              description: a.message,
              time: new Date(a.created_at).toLocaleDateString(),
              read: false,
            } as Alert))
          );
        }
      });

    // Real-time: new tracked product (Amazon / AliExpress)
    const productChannel = supabase
      .channel("rt-tracked-products")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tracked_products", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const p = payload.new as any;
          const platform = p.source_platform
            ? p.source_platform.charAt(0).toUpperCase() + p.source_platform.slice(1)
            : "Platform";
          const newAlert: Alert = {
            id: p.id,
            type: "success",
            title: `New Product on ${platform}`,
            description: `"${p.product_name}" was added to tracked products.`,
            time: "Just now",
            read: false,
          };
          setAlerts((prev) => [newAlert, ...prev]);
          setStats((s) => ({ ...s, products: s.products + 1 }));
          toast({ title: `New product on ${platform}`, description: p.product_name });
        }
      )
      .subscribe();

    // Real-time: new audit alert
    const alertChannel = supabase
      .channel("rt-audit-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_alerts", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const a = payload.new as any;
          const newAlert: Alert = {
            id: a.id,
            type: a.severity === "high" ? "critical" : "warning",
            title: "Store Alert",
            description: a.message,
            time: "Just now",
            read: false,
          };
          setAlerts((prev) => [newAlert, ...prev]);
          toast({ title: "New store alert", description: a.message, variant: "destructive" });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(alertChannel);
    };
  }, [hasStore, user]);

  // Close alert panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alertPanelRef.current && !alertPanelRef.current.contains(e.target as Node)) {
        setShowAlerts(false);
      }
    };
    if (showAlerts) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAlerts]);

  const handleConnectStore = () => {
    if (!storeInput.trim()) return;
    const url  = storeInput.trim().startsWith("http") ? storeInput.trim() : `https://${storeInput.trim()}`;
    const raw  = url.replace(/https?:\/\//, "").split(".")[0];
    const name = raw.charAt(0).toUpperCase() + raw.slice(1);
    localStorage.setItem(STORE_URL_KEY,  url);
    localStorage.setItem(STORE_NAME_KEY, name);
    setStoreUrl(url);
    setStoreName(name);
    toast({ title: "Store connected!", description: `${name} is now set up.` });
  };

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));

  // True only when the user has real data — prevents showing a generic score for a brand-new store.
  // In demo mode (no Supabase) we always show the demo data.
  const hasData =
    !isSupabaseConfigured || !user
      ? true
      : stats.products > 0 || stats.audits > 0 || alerts.length > 0;

  // ── No Store: Onboarding ──────────────────────────────────────────────────
  if (!hasStore) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              DropWin
            </h1>
            <Button variant="ghost" size="icon" onClick={() => navigate("/account")}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Create Your Store</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Connect your Shopify store to start auditing, tracking products, and getting real-time alerts from Amazon and AliExpress.
            </p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <Input
              value={storeInput}
              onChange={(e) => setStoreInput(e.target.value)}
              placeholder="yourstore.myshopify.com"
              className="text-center"
              onKeyDown={(e) => e.key === "Enter" && handleConnectStore()}
            />
            <Button className="w-full" onClick={handleConnectStore} disabled={!storeInput.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Store
            </Button>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
            <p className="text-xs text-muted-foreground">Or explore the platform first</p>
            <Link to="/product-intel">
              <Button variant="outline" className="w-full gap-2">
                <Search className="w-4 h-4" />
                Browse Trending Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal Dashboard ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              DropWin
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">{storeName}</p>
          </div>

          <div className="flex items-center gap-2 relative" ref={alertPanelRef}>
            {/* Bell with live badge */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => { setShowAlerts((v) => !v); markAllRead(); }}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-critical rounded-full text-[9px] text-white flex items-center justify-center font-bold px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {/* Settings → Account page */}
            <Button variant="ghost" size="icon" onClick={() => navigate("/account")}>
              <Settings className="w-5 h-5" />
            </Button>

            {/* Alerts dropdown */}
            {showAlerts && (
              <div className="absolute top-12 right-0 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-semibold">Alerts</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAlerts(false)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No alerts yet</p>
                  ) : (
                    alerts.slice(0, 8).map((alert) => (
                      <AlertCard
                        key={alert.id}
                        type={alert.type}
                        title={alert.title}
                        description={alert.description}
                        time={alert.time}
                        className="rounded-none border-0 border-b border-border/50 last:border-0"
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 animate-fade-in">
        {/* Score Gauge + Stats — or No-Data placeholder */}
        {hasData ? (
          <>
            <div className="flex flex-col items-center py-4">
              <ScoreGauge score={stats.health} label="Store Success Score" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <StatCard icon={Package}     value={String(stats.products)}                      label="Products" />
              <StatCard icon={BarChart3}   value={String(stats.audits)}                        label="Audits"   />
              <StatCard icon={AlertCircle} value={String(alerts.length)}                       label="Alerts"   />
              <StatCard icon={TrendingUp}  value={stats.health ? `${stats.health}%` : "—"}    label="Health"   />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/30 border-2 border-dashed border-border flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium">No data yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add products or run your first store audit to see your score
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 w-full opacity-40 pointer-events-none">
              <StatCard icon={Package}     value="0" label="Products" />
              <StatCard icon={BarChart3}   value="0" label="Audits"   />
              <StatCard icon={AlertCircle} value="0" label="Alerts"   />
              <StatCard icon={TrendingUp}  value="—" label="Health"   />
            </div>
          </div>
        )}

        {/* Alerts Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Recent Alerts
            </h2>
            {alerts.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => { setShowAlerts(true); markAllRead(); }}
              >
                See All →
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No alerts yet. Run a store audit to generate insights.
              </p>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <AlertCard
                  key={alert.id}
                  type={alert.type}
                  title={alert.title}
                  description={alert.description}
                  time={alert.time}
                  className="animate-slide-up"
                />
              ))
            )}
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
