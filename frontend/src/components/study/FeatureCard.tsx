import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  active?: boolean;
}

const FeatureCard = ({ icon: Icon, title, description, onClick, active }: FeatureCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-300 hover:shadow-card ${
        active
          ? "border-primary bg-primary/5 shadow-glow"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 ${
          active
            ? "gradient-hero shadow-soft"
            : "bg-secondary group-hover:gradient-hero"
        }`}
      >
        <Icon
          className={`h-7 w-7 transition-colors ${
            active
              ? "text-primary-foreground"
              : "text-primary group-hover:text-primary-foreground"
          }`}
        />
      </div>
      <div>
        <h3 className="font-heading font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
};

export default FeatureCard;
