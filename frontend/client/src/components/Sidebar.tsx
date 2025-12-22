import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  BrainCircuit, 
  LayoutDashboard, 
  Library, 
  Sparkles, 
  Settings,
  GraduationCap
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BrainCircuit, label: "Notes to Quiz", href: "/notes-to-mcqs" },
  { icon: GraduationCap, label: "Adaptive Quiz", href: "/quiz" },
  { icon: Sparkles, label: "AI Study Tools", href: "/study-tips" },
  { icon: Library, label: "Resources", href: "/resources" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 z-30">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight leading-none">AI Study Pal</h1>
            <p className="text-xs text-muted-foreground mt-1">Smart Learning Companion</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="bg-gradient-to-br from-accent/20 to-primary/20 p-4 rounded-xl border border-primary/10">
          <h4 className="font-display font-bold text-sm text-foreground">Pro Tip</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Review your incorrect answers daily to improve retention by 40%.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  // Simple bottom nav for mobile
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50 px-4 py-2 flex justify-between items-center safe-area-pb">
      {NAV_ITEMS.slice(0, 5).map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div className="flex flex-col items-center gap-1 p-2">
              <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.label.split(' ')[0]}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
