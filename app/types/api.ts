export type User = { id: string; email: string; display_name?: string | null; avatar_url?: string | null };
export type SearchResult = {
  platform: string; goods_no: string; goods_name: string; brand_name: string;
  price: number | null; product_url: string; image_url: string; similarity: number;
};
export type SearchResponse = {
  query_id: string; used_top_mask: boolean; top_ratio: number; elapsed_ms: number;
  results: SearchResult[]; image_url?: string | null; label?: string;
};
export type HistoryItem = { id: string; label: string; searched_at: string; count: number; image_url: string | null };
export type HistoryPage = { items: HistoryItem[]; next_cursor: number | null };
