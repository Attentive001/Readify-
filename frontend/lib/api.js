const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    throw new Error(
      body.error || body.message || `Request failed: ${res.status}`
    );
  }

  return res.json();
}

export const api = {
  // =========================
  // BOOKS
  // =========================

  getBooks: (params = {}) =>
    request(`/books?${new URLSearchParams(params)}`),

  getFeatured: () =>
    request("/books/featured"),

  getPopular: () =>
    request("/books/popular"),

  getRecent: () =>
    request("/books/recent"),

  getBook: (id) =>
    request(`/books/${id}`),

  // =========================
  // SEARCH
  // =========================

  search: async ({
    q = "",
    category = "",
    language = "",
    year = "",
    page = 1,
    pageSize = 20,
  } = {}) => {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (language) params.set("language", language);
    if (year) params.set("year", year);

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    return request(`/search?${params.toString()}`);
  },

  // =========================
  // CATEGORIES
  // =========================

  getCategories: () =>
    request("/categories"),

  getCategoryBooks: (slug) =>
    request(`/categories/${slug}/books`),

  // =========================
  // AUTH
  // =========================

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  register: (email, password, displayName) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        displayName,
      }),
    }),

  logout: () => {
    localStorage.removeItem("readify_token");
    localStorage.removeItem("readify_user");
  },

  getProfile: (token) =>
    request("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // =========================
  // READING PROGRESS
  // =========================

  getProgress: async (bookId) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("readify_token")
        : null;

    return request(`/books/${bookId}/progress`, {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
  },

  saveProgress: async (bookId, percent, location) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("readify_token")
        : null;

    if (!token) {
      return null;
    }

    return request(`/books/${bookId}/progress`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        percent,
        location,
      }),
    });
  },

  // =========================
  // UPLOAD BOOK
  // =========================

  uploadBook: async (formData) => {
    const res = await fetch(`${API_URL}/books/upload`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));

      throw new Error(
        body.error ||
          body.message ||
          `Upload failed: ${res.status}`
      );
    }

    return res.json();
  },
};
