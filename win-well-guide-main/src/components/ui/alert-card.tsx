import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

type AlertType = "critical" | "warning" | "success";

interface AlertCardProps {
  type: AlertType;
  title: string;
  description: string;
  time: string;
  className?: string;
}

const alertConfig = {
  critical: {
    icon: AlertCircle,
    bgClass: "bg-critical/10",
    borderClass: "border-critical/30",
    iconClass: "text-critical",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    iconClass: "text-warning",
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-success/10",
    borderClass: "border-success/30",
    iconClass: "text-success",
  },
};

export function AlertCard({ type, title, description, time, className }: AlertCardProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-xl p-4 border transition-all duration-200 hover:scale-[1.01]",
      config.bgClass,
      config.borderClass,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconClass)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm text-foreground truncate">{title}</h4>
            <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
}
