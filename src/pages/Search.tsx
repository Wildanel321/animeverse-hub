import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import AnimeGrid from "@/components/AnimeGrid";
import { searchAnime, getGenres } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "airing", label: "Airing" },
  { value: "complete", label: "Complete" },
  { value: "upcoming", label: "Upcoming" },
];

const RATING_OPTIONS = [
  { value: "", label: "All Ratings" },
  { value: "g", label: "G - All Ages" },
  { value: "pg", label: "PG - Children" },
  { value: "pg13", label: "PG-13" },
  { value: "r17", label: "R-17+" },
];

const SORT_OPTIONS = [
  { value: "score", label: "Score" },
  { value: "popularity", label: "Popularity" },
  { value: "title", label: "Title" },
  { value: "start_date", label: "Start Date" },
  { value: "episodes", label: "Episodes" },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    rating: "",
    genre: "",
    orderBy: "score",
    sort: "desc",
  });

  // Fetch genres
  const { data: genresData } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Search anime
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", query, page, filters],
    queryFn: () =>
      searchAnime(query, page, {
        status: filters.status || undefined,
        rating: filters.rating || undefined,
        genres: filters.genre || undefined,
        order_by: filters.orderBy,
        sort: filters.sort,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  // Update query from URL
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
    setSearchParams({ q: newQuery });
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      rating: "",
      genre: "",
      orderBy: "score",
      sort: "desc",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.status || filters.rating || filters.genre;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                Search Anime
              </h1>
              <p className="text-muted-foreground">
                Find your next favorite anime
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              className="flex-1"
              onSearch={handleSearch}
            />
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? "border-primary text-primary" : ""}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 rounded-2xl glass">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filter Results</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Genre Select */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Genre
                    </label>
                    <Select
                      value={filters.genre}
                      onValueChange={(value) =>
                        setFilters((f) => ({ ...f, genre: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Genres</SelectItem>
                        {genresData?.data?.map((genre) => (
                          <SelectItem
                            key={genre.mal_id}
                            value={genre.mal_id.toString()}
                          >
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Select */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Status
                    </label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilters((f) => ({ ...f, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating Select */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Rating
                    </label>
                    <Select
                      value={filters.rating}
                      onValueChange={(value) =>
                        setFilters((f) => ({ ...f, rating: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        {RATING_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Select */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Sort By
                    </label>
                    <Select
                      value={filters.orderBy}
                      onValueChange={(value) =>
                        setFilters((f) => ({ ...f, orderBy: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        {data && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-6"
          >
            Found{" "}
            <span className="font-semibold text-foreground">
              {data.pagination.items.total.toLocaleString()}
            </span>{" "}
            results
            {query && (
              <>
                {" "}
                for "<span className="text-primary">{query}</span>"
              </>
            )}
          </motion.p>
        )}

        {/* Anime Grid */}
        <AnimeGrid
          anime={data?.data || []}
          isLoading={isLoading}
          skeletonCount={24}
        />

        {/* Pagination */}
        {data?.pagination && data.data.length > 0 && (
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
