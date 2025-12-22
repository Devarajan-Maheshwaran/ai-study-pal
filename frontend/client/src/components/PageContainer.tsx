import { ReactNode } from "react";
import { Sidebar, MobileNav } from "./Sidebar";
import { motion } from "framer-motion";

interface PageContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function PageContainer({ children, title, description }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
