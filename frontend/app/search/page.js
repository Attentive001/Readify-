"use client";
import { useMemo, useState } from "react";
import { api } from "../../lib/api";
import { mockBooks } from "../../lib/mockData";
import BookCard from "../../components/BookCard";
import SearchBar from "../../components/SearchBar";

export default function SearchPage() {
  const [q, setQ] = useState(""); const [results, setResults] = useState([]); const [searched, setSearched] = useState(false); const [category, setCategory] = useState("All");
  async function runSearch(e) { e.preventDefault(); const term = q.trim(); setSearched(true); try { const data = await api.search({ q: term }); setResults(data.results?.length ? data.results : filterMock(term)); } catch { setResults(filterMock(term)); } }
  function filterMock(term) { const t = term.toLowerCase(); return mockBooks.filter(b => !t || `${b.title} ${b.author_name} ${b.category}`.toLowerCase().includes(t)); }
  const shown = useMemo(() => category === "All" ? results : results.filter(b => b.category === category), [results, category]);
  return <main className="max-w-7xl mx-auto px-5 lg:px-8 py-12"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[.2em] text-gold font-bold">Find your next book</p><h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Search the library</h1><p className="text-ink/60 mt-3">Search by title, author, ISBN, category, or keyword.</p></div><div className="mt-8 max-w-3xl"><SearchBar value={q} onChange={setQ} onSubmit={runSearch} large/></div><div className="mt-8 flex flex-wrap gap-2">{["All", "Self-Development", "Business", "Technology", "Science", "History"].map(c => <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-4 py-2 text-xs font-semibold border ${category === c ? "bg-ink text-parchment border-ink" : "border-ink/15 hover:bg-white/50"}`}>{c}</button>)}</div>{searched && <div className="mt-10"><div className="flex justify-between items-center mb-5"><h2 className="font-display text-2xl font-bold">{shown.length} result{shown.length === 1 ? "" : "s"}</h2></div>{shown.length ? <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5">{shown.map(b => <BookCard key={b.id} book={b}/>)}</div> : <div className="rounded-2xl border border-ink/10 bg-white/50 p-10 text-center"><p className="font-display text-xl font-bold">No books found</p><p className="text-sm text-ink/55 mt-2">Try another title, author, or keyword.</p></div>}</div>}</main>;
}
