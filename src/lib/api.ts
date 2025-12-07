import { Anime, AnimeResponse, SingleAnimeResponse, EpisodesResponse, Genre } from "@/types/anime";

const BASE_URL = "https://api.jikan.moe/v4";

// Rate limiting helper - Jikan has a 3 requests per second limit
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 350; // 350ms between requests

const rateLimitedFetch = async (url: string): Promise<Response> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();
  return fetch(url);
};

// Get top anime (popular)
export const getTopAnime = async (page = 1, filter = "bypopularity"): Promise<AnimeResponse> => {
  const response = await rateLimitedFetch(
    `${BASE_URL}/top/anime?page=${page}&filter=${filter}&limit=24`
  );
  if (!response.ok) throw new Error("Failed to fetch top anime");
  return response.json();
};

// Get currently airing anime
export const getSeasonNow = async (page = 1): Promise<AnimeResponse> => {
  const response = await rateLimitedFetch(
    `${BASE_URL}/seasons/now?page=${page}&limit=24`
  );
  if (!response.ok) throw new Error("Failed to fetch seasonal anime");
  return response.json();
};

// Get upcoming anime
export const getUpcomingAnime = async (page = 1): Promise<AnimeResponse> => {
  const response = await rateLimitedFetch(
    `${BASE_URL}/seasons/upcoming?page=${page}&limit=24`
  );
  if (!response.ok) throw new Error("Failed to fetch upcoming anime");
  return response.json();
};

// Search anime
export const searchAnime = async (
  query: string,
  page = 1,
  filters?: {
    genres?: string;
    status?: string;
    rating?: string;
    min_score?: number;
    order_by?: string;
    sort?: string;
  }
): Promise<AnimeResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "24",
    sfw: "true",
  });

  if (query) params.append("q", query);
  if (filters?.genres) params.append("genres", filters.genres);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.rating) params.append("rating", filters.rating);
  if (filters?.min_score) params.append("min_score", filters.min_score.toString());
  if (filters?.order_by) params.append("order_by", filters.order_by);
  if (filters?.sort) params.append("sort", filters.sort);

  const response = await rateLimitedFetch(`${BASE_URL}/anime?${params}`);
  if (!response.ok) throw new Error("Failed to search anime");
  return response.json();
};

// Get single anime details
export const getAnimeById = async (id: number): Promise<SingleAnimeResponse> => {
  const response = await rateLimitedFetch(`${BASE_URL}/anime/${id}/full`);
  if (!response.ok) throw new Error("Failed to fetch anime details");
  return response.json();
};

// Get anime episodes
export const getAnimeEpisodes = async (id: number, page = 1): Promise<EpisodesResponse> => {
  const response = await rateLimitedFetch(
    `${BASE_URL}/anime/${id}/episodes?page=${page}`
  );
  if (!response.ok) throw new Error("Failed to fetch episodes");
  return response.json();
};

// Get all genres
export const getGenres = async (): Promise<{ data: Genre[] }> => {
  const response = await rateLimitedFetch(`${BASE_URL}/genres/anime`);
  if (!response.ok) throw new Error("Failed to fetch genres");
  return response.json();
};

// Get anime recommendations
export const getAnimeRecommendations = async (id: number): Promise<{ data: { entry: Anime }[] }> => {
  const response = await rateLimitedFetch(`${BASE_URL}/anime/${id}/recommendations`);
  if (!response.ok) throw new Error("Failed to fetch recommendations");
  return response.json();
};

// Get random anime
export const getRandomAnime = async (): Promise<SingleAnimeResponse> => {
  const response = await rateLimitedFetch(`${BASE_URL}/random/anime`);
  if (!response.ok) throw new Error("Failed to fetch random anime");
  return response.json();
};
