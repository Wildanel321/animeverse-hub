import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import AnimeGrid from "@/components/AnimeGrid";
import { getSeasonNow, getUpcomingAnime } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function SeasonalPage() {
  const [tab, setTab] = useState<"current" | "upcoming">("current");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["seasonal", tab, page],
    queryFn: () => (tab === "current" ? getSeasonNow(page) : getUpcomingAnime(page)),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  const handleTabChange = (newTab: "current" | "upcoming") => {
    setTab(newTab);
    setPage(1);
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                Seasonal Anime
              </h1>
              <p className="text-muted-foreground">
                {tab === "current"
                  ? "Anime airing this season"
                  : "Coming soon to your screens"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <Button
              variant={tab === "current" ? "default" : "outline"}
              onClick={() => handleTabChange("current")}
              className={tab === "current" ? "gradient-bg border-0" : ""}
            >
              This Season
            </Button>
            <Button
              variant={tab === "upcoming" ? "default" : "outline"}
              onClick={() => handleTabChange("upcoming")}
              className={tab === "upcoming" ? "gradient-bg border-0" : ""}
            >
              Upcoming
            </Button>
          </div>
        </motion.div>

        {/* Anime Grid */}
        <AnimeGrid
          anime={data?.data || []}
          isLoading={isLoading}
          skeletonCount={24}
        />

        {/* Pagination */}
        {data?.pagination && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-4 mt-12"
          >
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Page {page}</span>
              <span>of</span>
              <span>{data.pagination.last_visible_page}</span>
              {isFetching && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
            </div>

            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.has_next_page || isFetching}
            >
              Next
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
