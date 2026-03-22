import { Store, CreditCard, Bell, HelpCircle, FileText, Shield, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const connectedStores = [
  { name: "Modern Home Essentials", url: "mystore.myshopify.com" },
];

const notificationSettings = [
  { label: "Supplier Alerts", enabled: true },
  { label: "Ad Fatigue Warnings", enabled: true },
  { label: "New Trending Products", enabled: false },
  { label: "Weekly Reports", enabled: true },
];

const menuItems = [
  { icon: HelpCircle, label: "Help & Support" },
  { icon: FileText, label: "Terms of Service" },
  { icon: Shield, label: "Privacy Policy" },
];

export default function Account() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center px-4 h-14">
          <h1 className="text-lg font-semibold">Account</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 animate-fade-in">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              JS
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg">John Smith</h2>
            <p className="text-sm text-muted-foreground">john@example.com</p>
            <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
              Pro Plan
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Connected Stores */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Store className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Connected Stores</h3>
          </div>
          <div className="space-y-2">
            {connectedStores.map((store, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{store.name}</p>
                    <p className="text-xs text-muted-foreground">{store.url}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Disconnect
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Connect Another Store
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
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Pro Plan - $49/month</p>
                  <p className="text-xs text-muted-foreground">Next billing: Jan 15, 2025</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
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
              {notificationSettings.map((setting, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <span className="text-sm">{setting.label}</span>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Menu Items */}
        <section className="space-y-1">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-between h-12 px-4"
            >
              <span className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          ))}
          <div className="px-4 py-3 text-sm text-muted-foreground">
            Login is disabled for this preview deployment.
          </div>
        </section>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">DropWin Intelligence v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
