import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, Play, Calendar, Film } from "lucide-react";
import { Anime, FavoriteAnime } from "@/types/anime";
import { toggleFavorite, isFavorite } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
}

export default function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  const [isLiked, setIsLiked] = useState(isFavorite(anime.mal_id));
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favorite: FavoriteAnime = {
      mal_id: anime.mal_id,
      title: anime.title,
      image_url: anime.images.jpg.large_image_url,
      score: anime.score,
      type: anime.type,
      episodes: anime.episodes,
      addedAt: Date.now(),
    };

    const added = toggleFavorite(favorite);
    setIsLiked(added);
    
    if (added) {
      toast.success(`${anime.title} added to favorites!`);
    } else {
      toast.info(`${anime.title} removed from favorites`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link to={`/anime/${anime.mal_id}`} className="block">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden card-shadow">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton-shimmer bg-muted" />
          )}

          {/* Image */}
          <img
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {anime.score && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg glass text-sm font-semibold"
              >
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span>{anime.score.toFixed(1)}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                isLiked
                  ? "bg-accent text-accent-foreground"
                  : "glass hover:bg-accent/80"
              )}
            >
              <Heart
                className={cn("w-4 h-4", isLiked && "fill-current")}
              />
            </motion.button>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              {anime.type && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/20 text-primary">
                  <Film className="w-3 h-3" />
                  {anime.type}
                </span>
              )}
              {anime.episodes && (
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {anime.episodes} eps
                </span>
              )}
            </div>
            {anime.year && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {anime.year}
              </span>
            )}
          </div>
        </div>

        {/* Title & Info */}
        <div className="mt-3 px-1">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            {anime.genres?.slice(0, 2).map((genre) => (
              <span
                key={genre.mal_id}
                className="px-2 py-0.5 rounded-md bg-muted"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
