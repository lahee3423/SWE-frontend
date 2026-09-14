import { FAVORITES_KEY,HISTORY_KEY,initialHistory } from "../constants/look-find";
import type { SearchHistory } from "../types/look-find";
const get=(key:string,fallback:unknown)=>{try{return JSON.parse(localStorage.getItem(key)??"null")??fallback}catch{return fallback}};
export const readHistory=()=>typeof window==="undefined"?initialHistory:get(HISTORY_KEY,initialHistory) as SearchHistory[];
export const writeHistory=(value:SearchHistory[])=>localStorage.setItem(HISTORY_KEY,JSON.stringify(value));
export const readFavorites=()=>typeof window==="undefined"?[]:get(FAVORITES_KEY,[]) as string[];
export const writeFavorites=(value:string[])=>localStorage.setItem(FAVORITES_KEY,JSON.stringify(value));
