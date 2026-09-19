"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import BookCard from "../../components/BookCard";

import T from "../../components/T";
const categoryIcons = [
  "✦",
  "◈",
  "⌘",
  "◌",
  "◍",
  "❧",
  "◇",
  "▤",
];

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [selected, setSelected] = useState(
    urlCategory || "All"
  );

  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [booksLoading, setBooksLoading] = useState(false);

  const [error, setError] = useState("");

  // ==================================================
  // LOAD CATEGORIES
  // ==================================================

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setError("");

        const data = await api.getCategories();

        const loadedCategories = Array.isArray(
          data?.categories
        )
          ? data.categories
          : [];

        setCategories(loadedCategories);

        // If URL has a category, keep it.
        // Otherwise show All.
        if (urlCategory) {
          const exists = loadedCategories.some(
            (category) =>
              category.name === urlCategory ||
              category.slug === urlCategory
          );

          if (exists) {
            const matchingCategory =
              loadedCategories.find(
                (category) =>
                  category.name === urlCategory ||
                  category.slug === urlCategory
              );

            setSelected(
              matchingCategory?.name || urlCategory
            );
          } else {
            setSelected("All");
          }
        }
      } catch (err) {
        console.error(
          "Failed to load categories:",
          err
        );

        setError(
          err?.message ||
            "Unable to load categories."
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, [urlCategory]);

  // ==================================================
  // LOAD BOOKS
  // ==================================================

  useEffect(() => {
    async function loadBooks() {
      try {
        setBooksLoading(true);
        setError("");

        // ------------------------------------------
        // ALL BOOKS
        // ------------------------------------------

        if (selected === "All") {
          const data = await api.getBooks({
            page: 1,
            pageSize: 100,
          });

          setBooks(
            Array.isArray(data?.books)
              ? data.books
              : []
          );

          return;
        }

        // ------------------------------------------
        // SELECTED CATEGORY
        // ------------------------------------------

        const category = categories.find(
          (item) =>
            item.name === selected ||
            item.slug === selected
        );

        const categorySlug =
          category?.slug || selected;

        const data =
          await api.getCategoryBooks(
            categorySlug
          );

        setBooks(
          Array.isArray(data?.books)
            ? data.books
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load category books:",
          err
        );

        setBooks([]);

        setError(
          err?.message ||
            "Unable to load books."
        );
      } finally {
        setBooksLoading(false);
      }
    }

    if (
      selected === "All" ||
      categories.length > 0
    ) {
      loadBooks();
    }
  }, [selected, categories]);

  // ==================================================
  // BOOK COUNT
  // ==================================================

  const countLabel = useMemo(() => {
    const count = books.length;

    return `${count} ${
      count === 1 ? "book" : "books"
    }`;
  }, [books.length]);

  // ==================================================
  // CATEGORY SELECT
  // ==================================================

  function handleCategorySelect(categoryName) {
    setSelected(categoryName);

    // Update URL without reloading the page.
    const url =
      categoryName === "All"
        ? "/categories"
        : `/categories?category=${encodeURIComponent(
            categoryName
          )}`;

    window.history.pushState(
      {},
      "",
      url
    );
  }

  return (
    <main className="min-h-screen bg-parchment">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-12 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
            <T k="browseBooks" />
          </p>

          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            <T k="categories" />
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60 sm:text-base">
            Explore books by the subjects, ideas,
            and topics you want to discover.
          </p>
        </section>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            CATEGORY CARDS
        ================================================== */}

        <section className="mt-9">

          {categoriesLoading ? (
            <div className="rounded-2xl border border-ink/10 bg-white/50 p-10 text-center text-sm text-ink/60">
              <T k="loadingCategories" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

              {/* ALL BOOKS */}

              <button
                type="button"
                onClick={() =>
                  handleCategorySelect("All")
                }
                className={`rounded-2xl border p-4 text-left transition sm:p-5 ${
                  selected === "All"
                    ? "border-ink bg-ink text-parchment shadow-lg"
                    : "border-ink/10 bg-white/50 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                }`}
              >
                <span className="text-2xl">
                  ✦
                </span>

                <h2 className="mt-4 font-display font-bold">
                  <T k="allBooks" />
                </h2>

                <p
                  className={`mt-1 text-xs leading-5 ${
                    selected === "All"
                      ? "text-parchment/60"
                      : "text-ink/50"
                  }`}
                >
                  Every book currently
                  available in Readify.
                </p>
              </button>

              {/* DATABASE CATEGORIES */}

              {categories.map(
                (category, index) => {
                  const isSelected =
                    selected === category.name;

                  return (
                    <button
                      key={
                        category.id ||
                        category.slug ||
                        category.name
                      }
                      type="button"
                      onClick={() =>
                        handleCategorySelect(
                          category.name
                        )
                      }
                      className={`rounded-2xl border p-4 text-left transition sm:p-5 ${
                        isSelected
                          ? "border-ink bg-ink text-parchment shadow-lg"
                          : "border-ink/10 bg-white/50 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                      }`}
                    >
                      <span className="text-2xl">
                        {
                          categoryIcons[
                            index %
                              categoryIcons.length
                          ]
                        }
                      </span>

                      <h2 className="mt-4 font-display font-bold">
                        {category.name}
                      </h2>

                      <p
                        className={`mt-1 text-xs ${
                          isSelected
                            ? "text-parchment/60"
                            : "text-ink/50"
                        }`}
                      >
                        {category.book_count ||
                          0}{" "}
                        {Number(
                          category.book_count
                        ) === 1
                          ? "book"
                          : "books"}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* ==================================================
            BOOK RESULTS
        ================================================== */}

        <section className="mt-14">

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/40">
                <T k="books" />
              </p>

              <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                {selected === "All"
                  ? "All Books"
                  : selected}
              </h2>
            </div>

            {!booksLoading && (
              <span className="shrink-0 text-sm text-ink/50">
                {countLabel}
              </span>
            )}
          </div>

          {/* LOADING */}

          {booksLoading ? (
            <div className="rounded-2xl border border-ink/10 bg-white/50 p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />

              <p className="mt-4 text-sm text-ink/60">
                <T k="loadingBooks" />
              </p>
            </div>
          ) : books.length > 0 ? (
            /* BOOK GRID */

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                />
              ))}
            </div>
          ) : (
            /* EMPTY */

            <div className="rounded-2xl border border-ink/10 bg-white/50 p-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink/5 text-2xl">
                📚
              </div>

              <h3 className="mt-5 font-display text-xl font-bold">
                <T k="noBooks" />
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">
                This category does not have
                any books currently stored in
                the database.
              </p>

              {selected !== "All" && (
                <button
                  type="button"
                  onClick={() =>
                    handleCategorySelect("All")
                  }
                  className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment transition hover:opacity-90"
                >
                  <T k="viewAllBooks" />
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}