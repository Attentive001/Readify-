"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookCard from "../../components/BookCard";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * GET TOKEN
   * ============================================================
   */
  function getToken() {
    return (
      localStorage.getItem("readify_token") ||
      localStorage.getItem("token")
    );
  }

  /*
   * ============================================================
   * LOAD LIBRARY
   * ============================================================
   */
  async function loadLibrary() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Please sign in to view your library."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/library`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load your library."
        );
      }

      setBooks(data.books || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load your library."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * LOAD READING PROGRESS FOR ALL SAVED BOOKS
   * ============================================================
   */
  async function loadProgress(savedBooks) {
    try {
      setProgressLoading(true);

      const token = getToken();

      if (!token || !savedBooks.length) {
        return;
      }

      const results = await Promise.all(
        savedBooks.map(async (book) => {
          try {
            const response = await fetch(
              `${API_URL}/books/${book.id}/progress`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              return {
                id: book.id,
                progress: null,
              };
            }

            const data = await response
              .json()
              .catch(() => ({}));

            return {
              id: book.id,
              progress:
                data.progress || null,
            };
          } catch {
            return {
              id: book.id,
              progress: null,
            };
          }
        })
      );

      const progressMap = {};

      results.forEach((item) => {
        progressMap[item.id] = item.progress;
      });

      setProgress(progressMap);
    } finally {
      setProgressLoading(false);
    }
  }

  /*
   * ============================================================
   * REMOVE BOOK
   * ============================================================
   */
  async function removeFromLibrary(bookId) {
    try {
      const token = getToken();

      if (!token) {
        setError("Please sign in first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/library/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to remove book."
        );
      }

      setBooks((currentBooks) =>
        currentBooks.filter(
          (book) => book.id !== bookId
        )
      );

      setProgress((currentProgress) => {
        const updated = {
          ...currentProgress,
        };

        delete updated[bookId];

        return updated;
      });
    } catch (err) {
      setError(
        err.message ||
          "Failed to remove book."
      );
    }
  }

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */
  useEffect(() => {
    loadLibrary();
  }, []);

  /*
   * ============================================================
   * LOAD PROGRESS AFTER BOOKS ARE LOADED
   * ============================================================
   */
  useEffect(() => {
    if (!loading && books.length > 0) {
      loadProgress(books);
    }
  }, [loading, books]);

  /*
   * ============================================================
   * FIND BOOK TO CONTINUE
   *
   * Priority:
   * 1. Book with progress > 0
   * 2. First saved book
   * ============================================================
   */
  const continueBook =
    books.find((book) => {
      const value = progress[book.id];

      return (
        value &&
        Number(value.percent) > 0
      );
    }) || books[0];

  const continueProgress =
    continueBook
      ? progress[continueBook.id]
      : null;

  const continuePercent = Math.round(
    Number(
      continueProgress?.percent || 0
    )
  );

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

      {/* ======================================================
          HEADER
      ====================================================== */}
      <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
        Your reading space
      </p>

      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
        My Library
      </h1>

      <p className="mt-3 text-ink/60">
        Books you have saved to your personal
        library.
      </p>

      {/* ======================================================
          ERROR
      ====================================================== */}
      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}
      {loading ? (
        <div className="mt-10 rounded-3xl border border-ink/10 bg-white/50 p-10 text-center">
          <p className="text-sm text-ink/60">
            Loading your library...
          </p>
        </div>
      ) : !error && books.length === 0 ? (

        /* ====================================================
           EMPTY LIBRARY
        ==================================================== */
        <div className="mt-10 rounded-3xl border border-ink/10 bg-white/50 p-10 text-center">

          <h2 className="font-display text-2xl font-bold">
            Your library is empty
          </h2>

          <p className="mt-2 text-sm text-ink/60">
            Find a book you like and add it
            to your library.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-parchment"
          >
            Explore books →
          </Link>

        </div>

      ) : (

        /* ====================================================
           LIBRARY CONTENT
        ==================================================== */
        <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">

          {/* ==================================================
              SAVED BOOKS
          ================================================== */}
          <div>

            <div className="flex items-center justify-between border-b border-ink/10 pb-4">

              <h2 className="font-display text-2xl font-bold">
                Saved books
              </h2>

              <span className="text-sm text-ink/50">
                {books.length}{" "}
                {books.length === 1
                  ? "book"
                  : "books"}
              </span>

            </div>

            <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3">

              {books.map((book) => {
                const bookProgress =
                  progress[book.id];

                const percent = Math.round(
                  Number(
                    bookProgress?.percent || 0
                  )
                );

                return (
                  <div
                    key={book.id}
                    className="relative"
                  >

                    <BookCard book={book} />

                    {/* Progress */}
                    <div className="mt-3">

                      <div className="flex items-center justify-between text-xs text-ink/50">
                        <span>
                          Reading progress
                        </span>

                        <span className="font-semibold text-ink/70">
                          {percent}%
                        </span>
                      </div>

                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10">

                        <div
                          className="h-full rounded-full bg-amber-300 transition-all"
                          style={{
                            width: `${percent}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* Continue */}
                    <Link
                      href={`/reader/${book.id}`}
                      className="mt-3 block w-full rounded-full bg-ink px-4 py-2.5 text-center text-xs font-bold text-parchment transition hover:opacity-90"
                    >
                      {percent > 0
                        ? "Continue reading →"
                        : "Start reading →"}
                    </Link>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() =>
                        removeFromLibrary(
                          book.id
                        )
                      }
                      className="mt-2 w-full rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      Remove from library
                    </button>

                  </div>
                );
              })}

            </div>

          </div>

          {/* ==================================================
              CONTINUE READING PANEL
          ================================================== */}
          <aside className="h-fit rounded-3xl bg-ink p-7 text-parchment">

            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              Reading progress
            </p>

            <h2 className="mt-3 font-display text-2xl font-bold">
              Keep going
            </h2>

            {progressLoading ? (

              <p className="mt-4 text-sm text-parchment/60">
                Loading your progress...
              </p>

            ) : continueBook ? (

              <>

                <p className="mt-3 text-sm text-parchment/60">
                  Continue reading where you
                  left off.
                </p>

                <div className="mt-6">

                  <p className="text-sm font-semibold">
                    {continueBook.title}
                  </p>

                  <p className="mt-1 text-xs text-parchment/50">
                    {continueBook.author_name ||
                      "Unknown author"}
                  </p>

                </div>

                {/* Progress bar */}
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-amber-300 transition-all"
                    style={{
                      width: `${continuePercent}%`,
                    }}
                  />

                </div>

                <div className="mt-2 flex justify-between text-xs text-parchment/55">

                  <span>
                    {continuePercent}% complete
                  </span>

                  <span>
                    {continueProgress?.location
                      ? "Saved"
                      : "Not started"}
                  </span>

                </div>

                {/* Continue button */}
                <Link
                  href={`/reader/${continueBook.id}`}
                  className="mt-6 block rounded-full bg-parchment px-5 py-3 text-center text-sm font-bold text-ink transition hover:opacity-90"
                >
                  {continuePercent > 0
                    ? "Continue reading →"
                    : "Start reading →"}
                </Link>

              </>

            ) : (

              <p className="mt-4 text-sm text-parchment/60">
               Your reading progress will
               appear here when you start
                reading.
              </p>

            )}

          </aside>

        </section>
      )}

    </main>
  );
}