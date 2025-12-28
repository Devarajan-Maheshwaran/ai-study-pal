import type { ReactNode } from "react";
import Aurora from "./Aurora";

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-root">
      <Aurora
        colorStops={["#1d4ed8", "#16a34a", "#22c55e"]}
        amplitude={0.9}
        blend={0.5}
        speed={0.6}
      />
      <div className="app-shell">
        {children}
      </div>
    </div>
  );
};