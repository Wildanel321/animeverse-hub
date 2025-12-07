import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Grid, List, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { getFavorites, removeFavorite, getWatchHistory, clearHistory } from "@/lib/storage";
import { FavoriteAnime } from "@/types/anime";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "grid" | "list";
type Tab = "favorites" | "history";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteAnime[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<Tab>("favorites");

  useEffect(() => {
    setFavorites(getFavorites());
    setHistory(getWatchHistory());
  }, []);

  const handleRemoveFavorite = (malId: number, title: string) => {
    removeFavorite(malId);
    setFavorites(getFavorites());
    toast.info(`${title} removed from favorites`);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    toast.success("Watch history cleared");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  My Collection
                </h1>
                <p className="text-muted-foreground">
                  {activeTab === "favorites"
                    ? `${favorites.length} anime saved`
                    : `${history.length} anime watched`}
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-muted" : ""}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-muted" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <Button
              variant={activeTab === "favorites" ? "default" : "outline"}
              onClick={() => setActiveTab("favorites")}
              className={activeTab === "favorites" ? "gradient-bg border-0" : ""}
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "outline"}
              onClick={() => setActiveTab("history")}
              className={activeTab === "history" ? "gradient-bg border-0" : ""}
            >
              <Clock className="w-4 h-4 mr-2" />
              History
            </Button>
            {activeTab === "history" && history.length > 0 && (
              <Button
                variant="ghost"
                onClick={handleClearHistory}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "favorites" ? (
            <FavoritesList
              key="favorites"
              items={favorites}
              viewMode={viewMode}
              onRemove={handleRemoveFavorite}
            />
          ) : (
            <HistoryList key="history" items={history} viewMode={viewMode} />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

interface FavoritesListProps {
  items: FavoriteAnime[];
  viewMode: ViewMode;
  onRemove: (malId: number, title: string) => void;
}

function FavoritesList({ items, viewMode, onRemove }: FavoritesListProps) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Start exploring and add anime to your favorites by clicking the heart icon!
        </p>
        <Link to="/trending">
          <Button className="gradient-bg">Explore Anime</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
          : "flex flex-col gap-4"
      )}
    >
      {items.map((anime, index) => (
        <motion.div
          key={anime.mal_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "group relative",
            viewMode === "list" && "flex gap-4 p-4 rounded-2xl glass"
          )}
        >
          <Link
            to={`/anime/${anime.mal_id}`}
            className={cn(viewMode === "list" && "flex gap-4 flex-1")}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-xl",
                viewMode === "grid" ? "aspect-[3/4]" : "w-20 h-28 flex-shrink-0"
              )}
            >
              <img
                src={anime.image_url}
                alt={anime.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {viewMode === "list" && (
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {anime.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  {anime.type && <span>{anime.type}</span>}
                  {anime.episodes && <span>• {anime.episodes} eps</span>}
                  {anime.score && <span>• ⭐ {anime.score}</span>}
                </div>
              </div>
            )}
          </Link>

          {viewMode === "grid" && (
            <div className="mt-3 px-1">
              <h3 className="font-semibold text-sm line-clamp-2">{anime.title}</h3>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(anime.mal_id, anime.title)}
            className={cn(
              "absolute text-destructive hover:text-destructive hover:bg-destructive/10",
              viewMode === "grid" ? "top-2 right-2" : "right-4 top-1/2 -translate-y-1/2"
            )}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface HistoryListProps {
  items: any[];
  viewMode: ViewMode;
}

function HistoryList({ items, viewMode }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No watch history</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Your recently watched anime will appear here.
        </p>
        <Link to="/trending">
          <Button className="gradient-bg">Start Watching</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
          : "flex flex-col gap-4"
      )}
    >
      {items.map((item, index) => (
        <motion.div
          key={`${item.mal_id}-${item.watchedAt}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "group",
            viewMode === "list" && "flex gap-4 p-4 rounded-2xl glass"
          )}
        >
          <Link
            to={`/anime/${item.mal_id}`}
            className={cn(viewMode === "list" && "flex gap-4 flex-1")}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-xl",
                viewMode === "grid" ? "aspect-[3/4]" : "w-20 h-28 flex-shrink-0"
              )}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg glass text-xs font-medium">
                Ep {item.episode}
              </div>
            </div>
            {viewMode === "list" && (
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Episode {item.episode}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(item.watchedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </Link>
          {viewMode === "grid" && (
            <div className="mt-3 px-1">
              <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(item.watchedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
