import { motion } from "framer-motion";

interface AnimeCardSkeletonProps {
  count?: number;
}

export default function AnimeCardSkeleton({ count = 12 }: AnimeCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="animate-pulse"
        >
          {/* Card Image */}
          <div className="aspect-[3/4] rounded-2xl skeleton-shimmer bg-muted" />
          
          {/* Title */}
          <div className="mt-3 px-1 space-y-2">
            <div className="h-4 bg-muted rounded-lg w-3/4" />
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded-md w-16" />
              <div className="h-5 bg-muted rounded-md w-12" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
