import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Settings,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import Layout from "@/components/Layout";
import { getAnimeById, getAnimeEpisodes } from "@/lib/api";
import { addToHistory } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EpisodePlayer() {
  const { animeId, episodeNum } = useParams<{ animeId: string; episodeNum: string }>();
  const navigate = useNavigate();
  const id = parseInt(animeId || "0");
  const currentEpisode = parseInt(episodeNum || "1");
  
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoSource, setVideoSource] = useState<"trailer" | "embed">("trailer");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch anime details
  const { data: animeData, isLoading: animeLoading } = useQuery({
    queryKey: ["anime", id],
    queryFn: () => getAnimeById(id),
    enabled: id > 0,
  });

  // Fetch episodes
  const { data: episodesData } = useQuery({
    queryKey: ["episodes", id],
    queryFn: () => getAnimeEpisodes(id),
    enabled: id > 0,
  });

  const anime = animeData?.data;
  const episodes = episodesData?.data || [];
  const currentEpisodeData = episodes.find((ep) => ep.mal_id === currentEpisode);
  const hasNextEpisode = currentEpisode < (anime?.episodes || episodes.length);
  const hasPrevEpisode = currentEpisode > 1;

  // Save to history when watching
  useEffect(() => {
    if (anime) {
      addToHistory(
        anime.mal_id,
        anime.title,
        anime.images.jpg.large_image_url,
        currentEpisode
      );
    }
  }, [anime, currentEpisode]);

  // Handle controls visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Navigate episodes
  const goToEpisode = (ep: number) => {
    navigate(`/watch/${id}/${ep}`);
    setShowEpisodeList(false);
  };

  const goNextEpisode = () => {
    if (hasNextEpisode) {
      goToEpisode(currentEpisode + 1);
    }
  };

  const goPrevEpisode = () => {
    if (hasPrevEpisode) {
      goToEpisode(currentEpisode - 1);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (animeLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 rounded-full gradient-bg mx-auto mb-4 flex items-center justify-center">
              <Play className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground">Loading player...</p>
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
      <div className="min-h-screen bg-background">
        {/* Player Section */}
        <div 
          ref={playerRef}
          className="relative bg-black aspect-video max-h-[80vh] w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video / Trailer Embed */}
          {anime.trailer.youtube_id ? (
            <iframe
              src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=0&rel=0&modestbranding=1`}
              title={`${anime.title} - Episode ${currentEpisode}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted">
              <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center mb-6 animate-pulse">
                <Play className="w-12 h-12 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Episode {currentEpisode}</h3>
              <p className="text-muted-foreground text-center max-w-md px-4">
                Video player ready. Connect your streaming source to watch this episode.
              </p>
            </div>
          )}

          {/* Controls Overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Top Bar */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between"
              >
                <Link to={`/anime/${id}`}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back
                  </Button>
                </Link>
                <div className="text-center flex-1 mx-4">
                  <h1 className="text-white font-semibold line-clamp-1">
                    {anime.title}
                  </h1>
                  <p className="text-white/70 text-sm">
                    Episode {currentEpisode}
                    {currentEpisodeData?.title && ` - ${currentEpisodeData.title}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEpisodeList(true)}
                  className="text-white hover:bg-white/20"
                >
                  <List className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center Play/Pause */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-auto"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goPrevEpisode}
                  disabled={!hasPrevEpisode}
                  className="w-12 h-12 rounded-full text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-20 h-20 rounded-full bg-white/20 text-white hover:bg-white/30"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10" />
                  ) : (
                    <Play className="w-10 h-10 ml-1" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goNextEpisode}
                  disabled={!hasNextEpisode}
                  className="w-12 h-12 rounded-full text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 p-4"
              >
                {/* Progress Bar */}
                <div className="mb-4">
                  <Slider
                    value={[30]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>0:00</span>
                    <span>24:00</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                    <div className="w-24 hidden sm:block">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        step={1}
                        onValueChange={(val) => {
                          setVolume(val[0]);
                          setIsMuted(val[0] === 0);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Episode Info & Navigation */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              {/* Episode Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={goPrevEpisode}
                  disabled={!hasPrevEpisode}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="text-center">
                  <h2 className="text-xl font-bold">Episode {currentEpisode}</h2>
                  {currentEpisodeData?.title && (
                    <p className="text-sm text-muted-foreground">
                      {currentEpisodeData.title}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={goNextEpisode}
                  disabled={!hasNextEpisode}
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Anime Info Card */}
              <div className="p-4 rounded-2xl glass flex gap-4">
                <Link to={`/anime/${id}`}>
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    className="w-20 h-28 object-cover rounded-xl"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/anime/${id}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                      {anime.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {anime.type} • {anime.episodes || "?"} Episodes
                  </p>
                  <div className="flex gap-2 mt-3">
                    {anime.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre.mal_id}
                        className="text-xs px-2 py-1 rounded-md bg-muted"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* External Links */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Watch On</h3>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Crunchyroll
                    </Button>
                  </a>
                  <a
                    href={`https://www.netflix.com/search?q=${encodeURIComponent(anime.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Netflix
                    </Button>
                  </a>
                  <a
                    href={anime.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      MyAnimeList
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Episode List Sidebar (Desktop) */}
            <div className="hidden lg:block w-80">
              <div className="p-4 rounded-2xl glass sticky top-24">
                <h3 className="font-semibold mb-4">Episodes</h3>
                <div className="max-h-[400px] overflow-y-auto space-y-2 hide-scrollbar">
                  {episodes.length > 0 ? (
                    episodes.map((ep) => (
                      <button
                        key={ep.mal_id}
                        onClick={() => goToEpisode(ep.mal_id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                          ep.mal_id === currentEpisode
                            ? "gradient-bg text-primary-foreground"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <span className="w-8 h-8 rounded-lg bg-background/20 flex items-center justify-center text-sm font-bold">
                          {ep.mal_id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {ep.title || `Episode ${ep.mal_id}`}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    // Generate placeholder episodes if no data
                    Array.from({ length: anime.episodes || 12 }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => goToEpisode(i + 1)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                          i + 1 === currentEpisode
                            ? "gradient-bg text-primary-foreground"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <span className="w-8 h-8 rounded-lg bg-background/20 flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Episode {i + 1}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Episode List Drawer */}
        <AnimatePresence>
          {showEpisodeList && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEpisodeList(false)}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] glass-strong z-50 p-6 lg:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Episodes</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEpisodeList(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="max-h-[calc(100vh-120px)] overflow-y-auto space-y-2 hide-scrollbar">
                  {episodes.length > 0 ? (
                    episodes.map((ep) => (
                      <button
                        key={ep.mal_id}
                        onClick={() => goToEpisode(ep.mal_id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                          ep.mal_id === currentEpisode
                            ? "gradient-bg text-primary-foreground"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <span className="w-8 h-8 rounded-lg bg-background/20 flex items-center justify-center text-sm font-bold">
                          {ep.mal_id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {ep.title || `Episode ${ep.mal_id}`}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    Array.from({ length: anime.episodes || 12 }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => goToEpisode(i + 1)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                          i + 1 === currentEpisode
                            ? "gradient-bg text-primary-foreground"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <span className="w-8 h-8 rounded-lg bg-background/20 flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Episode {i + 1}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
