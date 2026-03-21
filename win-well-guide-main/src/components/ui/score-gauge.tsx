import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function ScoreGauge({ score, size = "lg", label, className }: ScoreGaugeProps) {
  const getColor = () => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-critical";
  };

  const getGradient = () => {
    if (score >= 70) return "from-success to-emerald-400";
    if (score >= 40) return "from-warning to-amber-400";
    return "from-critical to-red-400";
  };

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-44 h-44",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  const strokeWidth = size === "lg" ? 8 : size === "md" ? 6 : 4;
  const radius = 50 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={cn("stop-color", getColor())} stopColor="currentColor" />
              <stop offset="100%" className={cn("stop-color", getColor())} stopColor="currentColor" style={{ opacity: 0.6 }} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", textSizes[size], getColor())}>
            {score}
          </span>
          {label && (
            <span className="text-xs text-muted-foreground mt-1">{label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
