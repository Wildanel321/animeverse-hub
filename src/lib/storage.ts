import { FavoriteAnime } from "@/types/anime";

const FAVORITES_KEY = "animevault_favorites";
const HISTORY_KEY = "animevault_history";

// Favorites Management
export const getFavorites = (): FavoriteAnime[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addFavorite = (anime: FavoriteAnime): void => {
  const favorites = getFavorites();
  if (!favorites.some((f) => f.mal_id === anime.mal_id)) {
    favorites.unshift({ ...anime, addedAt: Date.now() });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = (malId: number): void => {
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.mal_id !== malId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
};

export const isFavorite = (malId: number): boolean => {
  const favorites = getFavorites();
  return favorites.some((f) => f.mal_id === malId);
};

export const toggleFavorite = (anime: FavoriteAnime): boolean => {
  if (isFavorite(anime.mal_id)) {
    removeFavorite(anime.mal_id);
    return false;
  } else {
    addFavorite(anime);
    return true;
  }
};

// Watch History Management
interface WatchHistoryItem {
  mal_id: number;
  title: string;
  image_url: string;
  episode: number;
  watchedAt: number;
}

export const getWatchHistory = (): WatchHistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addToHistory = (
  malId: number,
  title: string,
  imageUrl: string,
  episode: number
): void => {
  const history = getWatchHistory();
  const existingIndex = history.findIndex((h) => h.mal_id === malId);

  const newEntry: WatchHistoryItem = {
    mal_id: malId,
    title,
    image_url: imageUrl,
    episode,
    watchedAt: Date.now(),
  };

  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }

  history.unshift(newEntry);

  // Keep only last 50 items
  const trimmed = history.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

// Theme Management
const THEME_KEY = "animevault_theme";

export type Theme = "light" | "dark" | "system";

export const getTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return (stored as Theme) || "dark";
  } catch {
    return "dark";
  }
};

export const setTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
};

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};
