import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { searchAnime } from "@/lib/api";
import { Anime } from "@/types/anime";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  variant?: "default" | "hero";
  onSearch?: (query: string) => void;
}

export default function SearchBar({ className, variant = "default", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchAnime(query, 1);
          setResults(data.data.slice(0, 5));
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-xl", className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center transition-all duration-300",
            isHero ? "h-14 md:h-16" : "h-12",
            isFocused && "neon-glow"
          )}
        >
          <div className={cn(
            "absolute left-4 text-muted-foreground transition-colors",
            isFocused && "text-primary"
          )}>
            <Search className={cn(isHero ? "w-5 h-5 md:w-6 md:h-6" : "w-5 h-5")} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search anime..."
            className={cn(
              "w-full h-full rounded-2xl border-2 bg-card/50 backdrop-blur-sm",
              "pl-12 pr-12 font-medium transition-all duration-300",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:bg-card",
              isHero ? "text-base md:text-lg" : "text-sm",
              isFocused
                ? "border-primary/50 ring-2 ring-primary/20"
                : "border-border hover:border-border/80"
            )}
          />

          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={handleClear}
                className="absolute right-4 p-1 rounded-full hover:bg-muted transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isFocused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-strong overflow-hidden z-50"
          >
            {results.map((anime, index) => (
              <motion.button
                key={anime.mal_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(`/anime/${anime.mal_id}`);
                  setIsFocused(false);
                  setQuery("");
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <img
                  src={anime.images.jpg.small_image_url}
                  alt={anime.title}
                  className="w-12 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{anime.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {anime.type && <span>{anime.type}</span>}
                    {anime.year && <span>• {anime.year}</span>}
                    {anime.score && <span>• ⭐ {anime.score}</span>}
                  </div>
                </div>
              </motion.button>
            ))}
            
            <button
              onClick={handleSubmit}
              className="w-full p-3 text-sm text-primary font-medium hover:bg-muted/50 transition-colors border-t border-border"
            >
              See all results for "{query}"
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
