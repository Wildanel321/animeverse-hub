import { ReactNode } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="pt-16 md:pt-20"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">A</span>
              </div>
              <span className="font-display font-bold gradient-text">AnimeVault</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Data provided by{" "}
              <a
                href="https://jikan.moe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Jikan API
              </a>{" "}
              (MyAnimeList)
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AnimeVault. For educational purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
