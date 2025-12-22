import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "accent" | "orange" | "blue";
}

export function StatsCard({ title, value, icon, description, color = "primary" }: StatsCardProps) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-display font-bold mt-2 tracking-tight text-foreground">
            {value}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {description}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl border", colorMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
