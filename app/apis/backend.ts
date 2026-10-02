import type { HistoryPage, SearchResponse, User } from "../types/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { ...options, credentials: "same-origin", cache: "no-store" });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(0, "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail
      : response.status === 422 ? "이메일 형식과 비밀번호 길이(8~128자)를 확인해 주세요."
      : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    throw new ApiError(response.status, detail);
  }
  return response.status === 204 ? undefined as T : response.json();
}
const json = (body: unknown): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
export const getMe = (signal?: AbortSignal) => request<User>("/auth/me", { signal });
export const signIn = (email: string, password: string) => request<User>("/auth/login", json({ email, password }));
export const signUp = (email: string, password: string) => request<User>("/auth/register", json({ email, password }));
export const signOut = () => request<void>("/auth/logout", { method: "POST" });
export const getHistory = (before?: number, signal?: AbortSignal) => request<HistoryPage>(`/history${before ? `?before=${before}` : ""}`, { signal });
export const getHistoryDetail = (id: string) => request<SearchResponse>(`/history/${id}`);
export const deleteHistory = (id?: string) => request<{ deleted_ids: string[] }>(`/history${id ? `/${id}` : ""}`, { method: "DELETE" });
export const restoreHistory = (ids: string[]) => request<{ restored: number }>("/history/restore", json({ ids }));
export const searchImage = (file: File, signal?: AbortSignal) => {
  const form = new FormData();
  form.append("image", file);
  return request<SearchResponse>("/search?limit=20", { method: "POST", body: form, signal });
};
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
