import { FAVORITES_KEY } from "../constants/look-find";
const get = (key: string, fallback: string[]): string[] => {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
};
export const readFavorites = () => typeof window === "undefined" ? [] : get(FAVORITES_KEY, []);
export const writeFavorites = (value: string[]) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(value));
