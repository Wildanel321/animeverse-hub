import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  Play,
  Calendar,
  Clock,
  Film,
  Users,
  ChevronLeft,
  ExternalLink,
  Download,
  Share2,
  Bookmark,
} from "lucide-react";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import AnimeCardSkeleton from "@/components/AnimeCardSkeleton";
import { getAnimeById, getAnimeEpisodes, getAnimeRecommendations } from "@/lib/api";
import { toggleFavorite, isFavorite, addToHistory } from "@/lib/storage";
import { FavoriteAnime } from "@/types/anime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const animeId = parseInt(id || "0");
  const [isLiked, setIsLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "episodes">("overview");

  // Fetch anime details
  const { data: animeData, isLoading: animeLoading } = useQuery({
    queryKey: ["anime", animeId],
    queryFn: () => getAnimeById(animeId),
    enabled: animeId > 0,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch episodes
  const { data: episodesData, isLoading: episodesLoading } = useQuery({
    queryKey: ["episodes", animeId],
    queryFn: () => getAnimeEpisodes(animeId),
    enabled: animeId > 0,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch recommendations
  const { data: recommendationsData } = useQuery({
    queryKey: ["recommendations", animeId],
    queryFn: () => getAnimeRecommendations(animeId),
    enabled: animeId > 0,
    staleTime: 1000 * 60 * 10,
  });

  const anime = animeData?.data;
  const episodes = episodesData?.data || [];
  const recommendations = recommendationsData?.data?.slice(0, 6) || [];

  useEffect(() => {
    if (animeId > 0) {
      setIsLiked(isFavorite(animeId));
    }
  }, [animeId]);

  const handleFavorite = () => {
    if (!anime) return;

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

  const handleDownloadPoster = () => {
    if (!anime) return;
    const link = document.createElement("a");
    link.href = anime.images.jpg.large_image_url;
    link.download = `${anime.title.replace(/[^a-z0-9]/gi, "_")}_poster.jpg`;
    link.target = "_blank";
    link.click();
    toast.success("Poster download started!");
  };

  const handleShare = async () => {
    if (!anime) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: anime.title,
          text: `Check out ${anime.title} on AnimeVault!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (animeLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-muted rounded-lg mb-6" />
            <div className="grid md:grid-cols-[300px_1fr] gap-8">
              <div className="aspect-[3/4] bg-muted rounded-2xl" />
              <div className="space-y-4">
                <div className="h-10 w-3/4 bg-muted rounded-lg" />
                <div className="h-6 w-1/2 bg-muted rounded-lg" />
                <div className="h-32 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!anime) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Anime not found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Background */}
      <div className="relative">
        <div
          className="absolute inset-0 h-[500px] bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.images.jpg.large_image_url})` }}
        />
        <div className="absolute inset-0 h-[500px] bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto md:mx-0"
          >
            <div className="relative aspect-[3/4] w-64 md:w-full rounded-2xl overflow-hidden card-shadow neon-glow">
              <img
                src={anime.images.jpg.large_image_url}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              {anime.rank && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg glass font-bold text-sm">
                  #{anime.rank}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                className={cn(
                  "flex-1",
                  isLiked ? "gradient-bg" : ""
                )}
                variant={isLiked ? "default" : "outline"}
                onClick={handleFavorite}
              >
                <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
                {isLiked ? "Saved" : "Favorite"}
              </Button>
              <Button variant="outline" size="icon" onClick={handleDownloadPoster}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-2">
              {anime.title}
            </h1>
            {anime.title_english && anime.title_english !== anime.title && (
              <p className="text-lg text-muted-foreground mb-4">
                {anime.title_english}
              </p>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3 mb-6">
              {anime.score && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  {anime.score.toFixed(1)}
                </div>
              )}
              {anime.type && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  <Film className="w-3.5 h-3.5 mr-1.5" />
                  {anime.type}
                </Badge>
              )}
              {anime.episodes && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  {anime.episodes} Episodes
                </Badge>
              )}
              {anime.duration && (
                <Badge variant="secondary" className="px-3 py-1.5">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {anime.duration}
                </Badge>
              )}
              {anime.status && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "px-3 py-1.5",
                    anime.airing && "bg-green-500/10 text-green-500"
                  )}
                >
                  {anime.status}
                </Badge>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres.map((genre) => (
                <Badge key={genre.mal_id} variant="outline" className="cursor-pointer hover:bg-primary/10">
                  {genre.name}
                </Badge>
              ))}
            </div>

            {/* Trailer Button */}
            {anime.trailer.youtube_id && (
              <Button
                className="gradient-bg mb-6"
                onClick={() => setShowTrailer(true)}
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Watch Trailer
              </Button>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border pb-4">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                onClick={() => setActiveTab("overview")}
                className={activeTab === "overview" ? "gradient-bg" : ""}
              >
                Overview
              </Button>
              <Button
                variant={activeTab === "episodes" ? "default" : "ghost"}
                onClick={() => setActiveTab("episodes")}
                className={activeTab === "episodes" ? "gradient-bg" : ""}
              >
                Episodes ({episodes.length})
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "overview" ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Synopsis */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {anime.synopsis || "No synopsis available."}
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl glass mb-8">
                    <InfoItem label="Japanese Title" value={anime.title_japanese} />
                    <InfoItem label="Aired" value={anime.aired.string} />
                    <InfoItem label="Season" value={anime.season && anime.year ? `${anime.season} ${anime.year}` : null} />
                    <InfoItem label="Rating" value={anime.rating} />
                    <InfoItem label="Source" value={anime.source} />
                    <InfoItem
                      label="Studios"
                      value={anime.studios.map((s) => s.name).join(", ")}
                    />
                    <InfoItem label="Members" value={anime.members?.toLocaleString()} />
                    <InfoItem label="Favorites" value={anime.favorites?.toLocaleString()} />
                  </div>

                  {/* External Links */}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={anime.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        MyAnimeList
                      </Button>
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="episodes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {episodesLoading ? (
                    <div className="grid gap-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-16 bg-muted rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : episodes.length > 0 ? (
                    <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-2 hide-scrollbar">
                      {episodes.map((episode) => (
                        <EpisodeItem
                          key={episode.mal_id}
                          episode={episode}
                          anime={anime}
                        />
                      ))}
                    </div>
                  ) : anime.episodes ? (
                    <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-2 hide-scrollbar">
                      {Array.from({ length: anime.episodes }).map((_, i) => (
                        <EpisodeItemPlaceholder
                          key={i + 1}
                          episodeNum={i + 1}
                          anime={anime}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No episode information available.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="text-2xl font-display font-bold mb-6">
              You might also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((rec, index) => (
                <AnimeCard key={rec.entry.mal_id} anime={rec.entry} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && anime.trailer.youtube_id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTrailer(false)}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden"
            >
              <iframe
                src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=1`}
                title={`${anime.title} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}

function EpisodeItem({ episode, anime }: { episode: any; anime: any }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    addToHistory(
      anime.mal_id,
      anime.title,
      anime.images.jpg.large_image_url,
      episode.mal_id
    );
    navigate(`/watch/${anime.mal_id}/${episode.mal_id}`);
  };

  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={handleClick}
      className="flex items-center gap-4 p-4 rounded-xl glass hover:bg-muted/50 transition-colors text-left w-full"
    >
      <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-primary-foreground">
          {episode.mal_id}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium line-clamp-1">
          {episode.title || `Episode ${episode.mal_id}`}
        </p>
        {episode.aired && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(episode.aired).toLocaleDateString()}
          </p>
        )}
      </div>
      {episode.filler && (
        <Badge variant="outline" className="text-xs">
          Filler
        </Badge>
      )}
      <Play className="w-4 h-4 text-muted-foreground" />
    </motion.button>
  );
}

function EpisodeItemPlaceholder({ episodeNum, anime }: { episodeNum: number; anime: any }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    addToHistory(
      anime.mal_id,
      anime.title,
      anime.images.jpg.large_image_url,
      episodeNum
    );
    navigate(`/watch/${anime.mal_id}/${episodeNum}`);
  };

  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={handleClick}
      className="flex items-center gap-4 p-4 rounded-xl glass hover:bg-muted/50 transition-colors text-left w-full"
    >
      <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-primary-foreground">
          {episodeNum}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium line-clamp-1">Episode {episodeNum}</p>
      </div>
      <Play className="w-4 h-4 text-muted-foreground" />
    </motion.button>
  );
}
