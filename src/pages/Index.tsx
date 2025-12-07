import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Sparkles, TrendingUp, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AnimeCard from "@/components/AnimeCard";
import AnimeCardSkeleton from "@/components/AnimeCardSkeleton";
import { getTopAnime, getSeasonNow } from "@/lib/api";

export default function Index() {
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Fetch trending anime
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTopAnime(1, "airing"),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch popular anime
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ["popular"],
    queryFn: () => getTopAnime(1, "bypopularity"),
    staleTime: 1000 * 60 * 10,
  });

  // Fetch seasonal anime
  const { data: seasonalData, isLoading: seasonalLoading } = useQuery({
    queryKey: ["seasonal"],
    queryFn: () => getSeasonNow(1),
    staleTime: 1000 * 60 * 10,
  });

  const featuredAnime = trendingData?.data?.slice(0, 5) || [];
  const currentFeatured = featuredAnime[featuredIndex];

  // Auto-rotate featured anime
  useEffect(() => {
    if (featuredAnime.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredAnime.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredAnime.length]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
        {/* Background Image */}
        {currentFeatured && (
          <motion.div
            key={currentFeatured.mal_id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentFeatured.images.jpg.large_image_url})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
          </motion.div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                Discover Your Next Favorite Anime
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6"
            >
              <span className="gradient-text">AnimeVault</span>
              <br />
              <span className="text-foreground/80">Your Anime Universe</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8 max-w-md"
            >
              Explore thousands of anime, track your favorites, and discover new series with our beautifully crafted anime discovery platform.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SearchBar variant="hero" />
            </motion.div>

            {/* Featured Indicators */}
            {featuredAnime.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 mt-8"
              >
                {featuredAnime.map((anime, index) => (
                  <button
                    key={anime.mal_id}
                    onClick={() => setFeaturedIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === featuredIndex
                        ? "w-8 gradient-bg"
                        : "w-4 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Featured Anime Card */}
        {currentFeatured && (
          <motion.div
            key={`card-${currentFeatured.mal_id}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="hidden lg:block absolute right-8 xl:right-20 top-1/2 -translate-y-1/2"
          >
            <Link to={`/anime/${currentFeatured.mal_id}`} className="block group">
              <div className="relative w-64 xl:w-80 aspect-[3/4] rounded-3xl overflow-hidden card-shadow neon-glow">
                <img
                  src={currentFeatured.images.jpg.large_image_url}
                  alt={currentFeatured.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    {currentFeatured.score && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg glass text-sm font-semibold">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        {currentFeatured.score.toFixed(1)}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-lg glass text-xs font-medium">
                      #{currentFeatured.rank}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {currentFeatured.title}
                  </h3>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Trending Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            icon={<TrendingUp className="w-5 h-5" />}
            title="Trending Now"
            subtitle="The hottest anime everyone's watching"
            link="/trending"
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {trendingLoading ? (
              <AnimeCardSkeleton count={6} />
            ) : (
              trendingData?.data?.slice(0, 6).map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* This Season Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionHeader
            icon={<Play className="w-5 h-5" />}
            title="This Season"
            subtitle="Fresh anime airing right now"
            link="/seasonal"
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {seasonalLoading ? (
              <AnimeCardSkeleton count={6} />
            ) : (
              seasonalData?.data?.slice(0, 6).map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={index} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Popular Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            icon={<Star className="w-5 h-5" />}
            title="Most Popular"
            subtitle="All-time favorites loved by millions"
            link="/trending"
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {popularLoading ? (
              <AnimeCardSkeleton count={12} />
            ) : (
              popularData?.data?.slice(0, 12).map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={index} />
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Section Header Component
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  link?: string;
}

function SectionHeader({ icon, title, subtitle, link }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6 md:mb-8">
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 text-primary mb-2"
        >
          {icon}
          <span className="text-sm font-semibold uppercase tracking-wider">{title}</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-display font-bold"
        >
          {subtitle}
        </motion.h2>
      </div>
      {link && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            to={link}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
