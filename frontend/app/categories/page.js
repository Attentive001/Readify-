"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import BookCard from "../../components/BookCard";

export default function CategoriesPage() {
  const [selected, setSelected] = useState("All");
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCategories();
        setCategories(Array.isArray(data?.categories) ? data.categories : []);
      } catch (err) {
        setError(err.message || "Unable to load categories.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      setError("");
      try {
        if (selected === "All") {
          const data = await api.getBooks({ page: 1, pageSize: 100 });
          setBooks(Array.isArray(data?.books) ? data.books : []);
        } else {
          const category = categories.find((item) => item.name === selected);
          const data = await api.getCategoryBooks(category?.slug || selected);
          setBooks(Array.isArray(data?.books) ? data.books : []);
        }
      } catch (err) {
        setBooks([]);
        setError(err.message || "Unable to load books.");
      } finally {
        setLoading(false);
      }
    }

    if (categories.length || selected === "All") loadBooks();
  }, [selected, categories]);

  const countLabel = useMemo(() => `${books.length} book${books.length === 1 ? "" : "s"}`, [books.length]);

  return (
    <main className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
      <p className="text-xs uppercase tracking-[.2em] text-gold font-bold">Browse</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Book categories</h1>
      <p className="mt-3 text-ink/60 max-w-2xl">Find books by the subjects and ideas you want to explore.</p>

      <div className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelected("All")}
          className={`text-left rounded-2xl border p-5 transition ${selected === "All" ? "border-ink bg-ink text-parchment" : "border-ink/10 bg-white/45 hover:bg-white/70"}`}
        >
          <span className="text-2xl">✦</span>
          <h2 className="font-display font-bold mt-4">All books</h2>
          <p className={`text-xs mt-1 ${selected === "All" ? "text-parchment/60" : "text-ink/55"}`}>Every book currently stored in the database</p>
        </button>

        {categories.map((category, i) => (
          <button
            key={category.id || category.slug || category.name}
            type="button"
            onClick={() => setSelected(category.name)}
            className={`text-left rounded-2xl border p-5 transition ${selected === category.name ? "border-ink bg-ink text-parchment" : "border-ink/10 bg-white/45 hover:bg-white/70"}`}
          >
            <span className="text-2xl">{["✦","◈","⌘","◌","◍","❧","◇","▤"][i % 8]}</span>
            <h2 className="font-display font-bold mt-4">{category.name}</h2>
            <p className={`text-xs mt-1 ${selected === category.name ? "text-parchment/60" : "text-ink/55"}`}>
              {category.book_count || 0} books to explore
            </p>
          </button>
        ))}
      </div>

      <section className="mt-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold">{selected === "All" ? "All books" : selected}</h2>
          <span className="text-sm text-ink/50">{countLabel}</span>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-2xl border border-ink/10 bg-white/50 p-10 text-center text-sm text-ink/60">Loading books...</div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5">
            {books.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-ink/10 bg-white/50 p-10 text-center">
            <p className="font-display text-xl font-bold">No books found</p>
            <p className="text-sm text-ink/55 mt-2">This category has no books currently stored in the database.</p>
          </div>
        )}
      </section>
    </main>
  );
}
