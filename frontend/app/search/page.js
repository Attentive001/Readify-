"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import BookCard from "../../components/BookCard";
import SearchBar from "../../components/SearchBar";

import T from "../../components/T";
const categories = [
  "All",
  "Self-Development",
  "Business",
  "Technology",
  "Science",
  "History",
  "Literature",
  "Philosophy",
  "Education",
  "Fiction",
  "Economics"
];

const categoryKey = {
  All: "allBooks",
  "Self-Development": "catSelfDevelopment",
  Business: "catBusiness", Technology: "catTechnology", Science: "catScience",
  History: "catHistory", Literature: "catLiterature", Philosophy: "catPhilosophy",
  Education: "catEducation", Fiction: "catFiction", Economics: "catEconomics",
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [category, setCategory] = useState("All");

  const [searched, setSearched] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function runSearch(e) {
    e.preventDefault();

    setSearched(true);
    setLoading(true);
    setError("");

    try {
      const data = await api.search({
        q: q.trim(),
        category:
          category === "All"
            ? ""
            : category,
        page: 1,
        pageSize: 100,
      });

      setResults(
        Array.isArray(data?.results)
          ? data.results
          : []
      );
    } catch (err) {
      console.error(
        "Search error:",
        err
      );

      setResults([]);

      setError(
        err.message ||
          "Unable to search the library."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

      {/* Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
          <T k="findNextBook" />
        </p>

        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
          <T k="searchLibrary" />
        </h1>

        <p className="mt-3 text-ink/60">
          <T k="searchBy" />
        </p>
      </div>

      {/* Search Bar */}
      <div className="mt-8 max-w-3xl">
        <SearchBar
          value={q}
          onChange={setQ}
          onSubmit={runSearch}
          large
        />
      </div>

      {/* Categories */}
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setCategory(item);
            }}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              category === item
                ? "border-ink bg-ink text-parchment"
                : "border-ink/15 hover:bg-white/50"
            }`}
          >
            <T k={categoryKey[item] || item} />
          </button>
        ))}
      </div>

      {/* Results */}
      {searched && (
        <section className="mt-10">

          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold">
              {loading
                ? <T k="searching" />
                : `${results.length} result${
                    results.length === 1
                      ? ""
                      : "s"
                  }`}
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-ink/10 bg-white/50 p-10 text-center">
              <p className="text-sm text-ink/60">
                <T k="searchingLibrary" />
              </p>
            </div>
          )}

          {/* Results */}
          {!loading &&
            !error &&
            results.length > 0 && (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
                {results.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                  />
                ))}
              </div>
            )}

          {/* No results */}
          {!loading &&
            !error &&
            results.length === 0 && (
              <div className="rounded-2xl border border-ink/10 bg-white/50 p-10 text-center">
                <p className="font-display text-xl font-bold">
                  <T k="noBooks" />
                </p>

                <p className="mt-2 text-sm text-ink/55">
                  <T k="tryAnother" />
                </p>
              </div>
            )}

        </section>
      )}
    </main>
  );
}