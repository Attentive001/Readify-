"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import BookCard from "../../components/BookCard";

const ICONS = ["✦", "◈", "⌘", "◌", "◍", "❧", "◇", "▤"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState({ slug: "all", name: "All" });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load real categories from the database once.
  useEffect(() => {
    api
      .getCategories()
      .then((d) => setCategories(Array.isArray(d?.categories) ? d.categories : []))
      .catch(() => setCategories([]));
  }, []);

  // Load real books from the database whenever the selected category changes.
  useEffect(() => {
    setLoading(true);
    const fetchBooks =
      selected.slug === "all"
        ? api.getBooks({ page: 1, pageSize: 100 })
        : api.getCategoryBooks(selected.slug);

    fetchBooks
      .then((d) => setBooks(Array.isArray(d?.books) ? d.books : []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <main className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
      <p className="text-xs uppercase tracking-[.2em] text-gold font-bold">Browse</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Book categories</h1>
      <p className="mt-3 text-ink/60 max-w-2xl">
        Find books by the subjects and ideas you want to explore.
      </p>

      <div className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setSelected({ slug: "all", name: "All" })}
          className={`text-left rounded-2xl border p-5 transition ${
            selected.slug === "all"
              ? "border-ink bg-ink text-parchment"
              : "border-ink/10 bg-white/45 hover:bg-white/70"
          }`}
        >
          <span className="text-2xl">✦</span>
          <h2 className="font-display font-bold mt-4">All</h2>
          <p className={`text-xs mt-1 ${selected.slug === "all" ? "text-parchment/60" : "text-ink/55"}`}>
            Every book in the catalog
          </p>
        </button>

        {categories.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => setSelected({ slug: c.slug, name: c.name })}
            className={`text-left rounded-2xl border p-5 transition ${
              selected.slug === c.slug
                ? "border-ink bg-ink text-parchment"
                : "border-ink/10 bg-white/45 hover:bg-white/70"
            }`}
          >
            <span className="text-2xl">{ICONS[i % ICONS.length]}</span>
            <h2 className="font-display font-bold mt-4">{c.name}</h2>
            <p className={`text-xs mt-1 ${selected.slug === c.slug ? "text-parchment/60" : "text-ink/55"}`}>
              {c.book_count || 0} books to explore
            </p>
          </button>
        ))}
      </div>

      <section className="mt-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold">
            {selected.slug === "all" ? "All books" : selected.name}
          </h2>
          <span className="text-sm text-ink/50">
            {loading ? "Loading…" : `${books.length} books`}
          </span>
        </div>

        {!loading && books.length === 0 ? (
          <div className="rounded-2xl border border-ink/10 bg-white/50 p-10 text-center">
            <h3 className="font-display text-xl font-bold">No books found</h3>
            <p className="mt-2 text-sm text-ink/55">
              This category doesn't have any titles in the catalog yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
