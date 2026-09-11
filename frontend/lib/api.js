const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Request failed: ${res.status}`
    );
  }

  return res.json();
}

export const api = {
  // Books
  getBooks: (params = {}) =>
  request(`/books?${new URLSearchParams(params)}`),
  
  getFeatured: () => request("/books/featured"),

  getPopular: () => request("/books/popular"),

  getRecent: () => request("/books/recent"),

  getBook: (id) => request(`/books/${id}`),

  getChapters: (id) =>
    request(`/books/${id}/chapters`),

  // Search
  search: (params) =>
    request(`/search?${new URLSearchParams(params)}`),

  // Categories
  getCategories: () =>
    request("/categories"),

  getCategoryBooks: (slug) =>
    request(`/categories/${slug}/books`),

  // Auth
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

  // Upload book
  uploadBook: async (formData) => {
    const res = await fetch(`${API_URL}/books/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));

      throw new Error(
        body.error || `Upload failed: ${res.status}`
      );
    }

    return res.json();
  },
};