import { useState } from "react";
import {
  Store, CreditCard, Bell, HelpCircle, FileText, Shield,
  ChevronRight, Plus, LogOut, Trash2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { STORE_URL_KEY, STORE_NAME_KEY } from "./Dashboard";

const notificationSettings = [
  { label: "Supplier Alerts",        key: "supplier",  defaultEnabled: true  },
  { label: "Ad Fatigue Warnings",    key: "adfatigue", defaultEnabled: true  },
  { label: "New Trending Products",  key: "trending",  defaultEnabled: false },
  { label: "Weekly Reports",         key: "weekly",    defaultEnabled: true  },
];

const menuItems = [
  { icon: HelpCircle, label: "Help & Support"   },
  { icon: FileText,   label: "Terms of Service" },
  { icon: Shield,     label: "Privacy Policy"   },
];

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting,    setIsDeleting]    = useState(false);

  const storeUrl  = localStorage.getItem(STORE_URL_KEY)  || "";
  const storeName = localStorage.getItem(STORE_NAME_KEY) || "";

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split("@")[0]
    || "User";
  const email    = user?.email || "Not signed in";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({ title: "Signed out", description: "See you next time!" });
  };

  const handleDisconnectStore = () => {
    localStorage.removeItem(STORE_URL_KEY);
    localStorage.removeItem(STORE_NAME_KEY);
    navigate("/");
    toast({ title: "Store disconnected" });
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      if (isSupabaseConfigured && user) {
        await Promise.all([
          supabase.from("tracked_products").delete().eq("user_id", user.id),
          supabase.from("store_audits").delete().eq("user_id", user.id),
          supabase.from("audit_alerts").delete().eq("user_id", user.id),
        ]);
        await signOut();
      }
      localStorage.removeItem(STORE_URL_KEY);
      localStorage.removeItem(STORE_NAME_KEY);
      navigate("/");
      toast({ title: "Account deleted", description: "Your data has been removed." });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center px-4 h-14">
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 animate-fade-in">

        {/* Profile */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
            <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
              Pro Plan
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Connected Store */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Store className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Connected Store</h3>
          </div>
          <div className="space-y-2">
            {storeUrl ? (
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{storeName || "My Store"}</p>
                    <p className="text-xs text-muted-foreground">{storeUrl.replace(/https?:\/\//, "")}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleDisconnectStore}
                  >
                    Disconnect
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <p className="text-xs text-muted-foreground px-1">No store connected.</p>
            )}
            <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/")}>
              <Plus className="w-4 h-4" />
              {storeUrl ? "Change Store" : "Connect a Store"}
            </Button>
          </div>
        </section>

        {/* Subscription */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Subscription</h3>
          </div>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Pro Plan — R499/month</p>
                <p className="text-xs text-muted-foreground">Billed monthly</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </CardContent>
          </Card>
        </section>

        {/* Notifications */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {notificationSettings.map((s) => (
                <div key={s.key} className="p-4 flex items-center justify-between">
                  <span className="text-sm">{s.label}</span>
                  <Switch defaultChecked={s.defaultEnabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Help / Legal */}
        <section className="space-y-1">
          {menuItems.map((item, i) => (
            <Button key={i} variant="ghost" className="w-full justify-between h-12 px-4">
              <span className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          ))}
        </section>

        <Separator />

        {/* Sign Out + Delete Account */}
        <section className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>

          {confirmDelete ? (
            <div className="border border-destructive/30 rounded-xl p-4 space-y-3 bg-destructive/5">
              <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                This will permanently delete your account and all data.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting…" : "Yes, Delete"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          )}
        </section>

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground">DropWin Intelligence v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
