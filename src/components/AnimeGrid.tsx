import { Anime } from "@/types/anime";
import AnimeCard from "./AnimeCard";
import AnimeCardSkeleton from "./AnimeCardSkeleton";
import { motion } from "framer-motion";

interface AnimeGridProps {
  anime: Anime[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export default function AnimeGrid({ anime, isLoading, skeletonCount = 12 }: AnimeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        <AnimeCardSkeleton count={skeletonCount} />
      </div>
    );
  }

  if (!anime.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <span className="text-4xl">😢</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">No anime found</h3>
        <p className="text-muted-foreground max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {anime.map((item, index) => (
        <AnimeCard key={item.mal_id} anime={item} index={index} />
      ))}
    </div>
  );
}
