import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({ icon: Icon, value, label, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-4 border border-border/50",
      className
    )}>
      {Icon && (
        <Icon className="w-4 h-4 text-muted-foreground mb-2" />
      )}
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {trend && (
        <div className={cn(
          "text-xs mt-1 font-medium",
          trend.positive ? "text-success" : "text-critical"
        )}>
          {trend.positive ? "+" : ""}{trend.value}%
        </div>
      )}
    </div>
  );
}
