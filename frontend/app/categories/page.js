"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { categories as mockCategories, mockBooks } from "../../lib/mockData";
import BookCard from "../../components/BookCard";

export default function CategoriesPage() {
  const [selected, setSelected] = useState("All"); const [categories, setCategories] = useState(mockCategories.map(([name, desc, icon]) => ({name, desc, icon})));
  useEffect(() => { api.getCategories().then(d => { if (d.categories?.length) setCategories(d.categories); }).catch(() => {}); }, []);
  const books = selected === "All" ? mockBooks : mockBooks.filter(b => b.category === selected);
  return <main className="max-w-7xl mx-auto px-5 lg:px-8 py-12"><p className="text-xs uppercase tracking-[.2em] text-gold font-bold">Browse</p><h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Book categories</h1><p className="mt-3 text-ink/60 max-w-2xl">Find books by the subjects and ideas you want to explore.</p><div className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-3">{categories.map((c, i) => <button key={c.name} onClick={() => setSelected(c.name)} className={`text-left rounded-2xl border p-5 transition ${selected === c.name ? "border-ink bg-ink text-parchment" : "border-ink/10 bg-white/45 hover:bg-white/70"}`}><span className="text-2xl">{c.icon || ["✦","◈","⌘","◌","◍","❧","◇","▤"][i % 8]}</span><h2 className="font-display font-bold mt-4">{c.name}</h2><p className={`text-xs mt-1 ${selected === c.name ? "text-parchment/60" : "text-ink/55"}`}>{c.desc || `${c.book_count || 0} books to explore`}</p></button>)}</div><section className="mt-14"><div className="flex items-center justify-between mb-5"><h2 className="font-display text-2xl font-bold">{selected === "All" ? "All recommendations" : selected}</h2><span className="text-sm text-ink/50">{books.length} books</span></div><div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5">{books.map(b => <BookCard key={b.id} book={b}/>)}</div></section></main>;
}
 
