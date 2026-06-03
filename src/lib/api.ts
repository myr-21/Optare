const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081/api";

export function getStoredToken(): string | null {
  return localStorage.getItem("token");
}

export function getStoredUser(): any | null {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to log in. Please check your credentials.");
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export async function register(username: string, email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create account. Check if email/username is already in use.");
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  source: string;
  contentType: string;
  author: string;
  category: string;
  tags: string[];
  publishedDate: string;
  engagementScore: number;
  titleHighlight: string;
}

export interface SearchResponse {
  totalResults: number;
  query: string;
  groups: {
    VIDEO: SearchResultItem[];
    DISCUSSION: SearchResultItem[];
    ARTICLE: SearchResultItem[];
  };
}

export async function searchContent(query: string): Promise<SearchResponse | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers
    });
    
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("Error during search fetch:", e);
  }
  return null;
}

export async function getFeed(page = 0, size = 8, category = "", source = ""): Promise<any> {
  const headers = await getAuthHeaders();
  const url = new URL(`${API_BASE}/feed`);
  url.searchParams.append("page", String(page));
  url.searchParams.append("size", String(size));
  if (category) url.searchParams.append("category", category);
  if (source) url.searchParams.append("source", source);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers
  });

  if (!res.ok) {
    throw new Error("Failed to fetch personalized feed");
  }

  return await res.json();
}

export async function getInterestCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/interests/categories`);
  if (!res.ok) {
    throw new Error("Failed to load categories");
  }
  return await res.json();
}

export async function getUserInterests(): Promise<any[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/interests`, {
    method: "GET",
    headers
  });
  if (!res.ok) {
    throw new Error("Failed to load user interests");
  }
  return await res.json();
}

export async function updateUserInterests(interests: { category: string, weight: string }[]): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/interests`, {
    method: "PUT",
    headers,
    body: JSON.stringify(interests)
  });
  if (!res.ok) {
    throw new Error("Failed to update user interests");
  }
  return await res.json();
}

export async function recordInteraction(contentId: string, interaction: string, collectionName?: string): Promise<void> {
  const headers = await getAuthHeaders();
  await fetch(`${API_BASE}/interactions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ contentId, interaction, collectionName })
  });
}

export async function removeInteraction(contentId: string, interaction: string): Promise<void> {
  const headers = await getAuthHeaders();
  await fetch(`${API_BASE}/interactions/${contentId}/${interaction}`, {
    method: "DELETE",
    headers
  });
}

export async function getBookmarks(type = "BOOKMARK", collection = "", page = 0, size = 20): Promise<any> {
  const headers = await getAuthHeaders();
  const url = new URL(`${API_BASE}/bookmarks`);
  url.searchParams.append("type", type);
  if (collection) url.searchParams.append("collection", collection);
  url.searchParams.append("page", String(page));
  url.searchParams.append("size", String(size));

  const res = await fetch(url.toString(), {
    headers
  });
  if (!res.ok) {
    throw new Error("Failed to fetch bookmarks");
  }
  return await res.json();
}

export async function getBookmarkCollections(): Promise<string[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/bookmarks/collections`, {
    headers
  });
  if (!res.ok) {
    throw new Error("Failed to fetch collections list");
  }
  return await res.json();
}

export async function getMe(): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers
  });
  if (!res.ok) {
    throw new Error("Failed to load profile details");
  }
  return await res.json();
}
