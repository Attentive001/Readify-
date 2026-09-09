"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";

function normalizeChapters(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.chapters)) return data.chapters;
  if (Array.isArray(data?.data?.chapters)) return data.data.chapters;
  return [];
}

function chapterNumber(chapter, index) {
  return chapter.chapter_number ?? chapter.chapterNumber ?? index + 1;
}

function chapterTitle(chapter, index) {
  return chapter.title || `Chapter ${chapterNumber(chapter, index)}`;
}

function chapterContent(chapter) {
  return chapter.content || "";
}

export default function ReaderPage({ params }) {
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReader() {
      setLoading(true);
      setChapterLoading(true);
      setError("");

      try {
        // 1. Load book information
        const bookData = await api.getBook(params.id);

        if (cancelled) return;

        if (!bookData?.book) {
          setError("Book not found.");
          setLoading(false);
          setChapterLoading(false);
          return;
        }

        setBook(bookData.book);

        // 2. Load chapters
        try {
          const chapterData = await api.getChapters(params.id);

          if (cancelled) return;

          const loadedChapters = normalizeChapters(chapterData);

          if (loadedChapters.length === 0) {
            setError("This book does not have readable chapters.");
            setChapters([]);
          } else {
            setChapters(loadedChapters);
            setChapterIndex(0);
            setError("");
          }
        } catch (chapterError) {
          if (!cancelled) {
            console.error("Chapter loading error:", chapterError);

            setChapters([]);
            setError(
              "The book was found, but its chapters could not be loaded."
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Book loading error:", err);
          setError(err.message || "Unable to load this book.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setChapterLoading(false);
        }
      }
    }

    loadReader();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Loading screen
  if (loading) {
    return (
      <main className="min-h-screen px-5 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-ink/60">Loading book...</p>
        </div>
      </main>
    );
  }

  // Book not found
  if (!book) {
    return (
      <main className="min-h-screen px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/search"
            className="text-sm text-ink/60 hover:text-ink"
          >
            ← Back to search
          </Link>

          <h1 className="mt-8 font-display text-3xl font-bold">
            {error || "Book not found."}
          </h1>
        </div>
      </main>
    );
  }

  const currentChapter = chapters[chapterIndex];

  const content = currentChapter
    ? chapterContent(currentChapter)
    : "";

  return (
    <main className="min-h-screen">
      {/* Reader toolbar */}
      <div className="sticky top-0 z-20 border-b border-ink/10 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link
            href={`/books/${book.id}`}
            className="max-w-[45%] truncate text-sm text-ink/60 hover:text-ink"
          >
            ← {book.title}
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setFontSize((size) => Math.max(14, size - 2))
              }
              className="h-9 w-9 rounded-lg border border-ink/15 font-semibold hover:bg-white/60"
            >
              A−
            </button>

            <span className="text-xs text-ink/50">
              {fontSize}px
            </span>

            <button
              type="button"
              onClick={() =>
                setFontSize((size) => Math.min(28, size + 2))
              }
              className="h-9 w-9 rounded-lg border border-ink/15 font-semibold hover:bg-white/60"
            >
              A+
            </button>

            <button
              type="button"
              onClick={() => setBookmarked((value) => !value)}
              className="ml-2 h-9 rounded-lg border border-ink/15 px-3 text-sm hover:bg-white/60"
            >
              {bookmarked ? "★ Saved" : "☆ Bookmark"}
            </button>
          </div>
        </div>
      </div>

      {/* Reader content */}
      <article className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-gold">
          {currentChapter
            ? `Chapter ${chapterNumber(
                currentChapter,
                chapterIndex
              )}`
            : "Book"}
        </p>

        <h1 className="mt-4 text-center font-display text-4xl font-bold leading-tight sm:text-5xl">
          {currentChapter
            ? chapterTitle(currentChapter, chapterIndex)
            : book.title}
        </h1>

        <p className="mt-2 text-center text-sm text-ink/50">
          {book.author_name || "Unknown author"}
        </p>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {/* Chapter loading */}
        {chapterLoading ? (
          <div className="mt-12 text-center text-ink/50">
            Loading chapters...
          </div>
        ) : chapters.length > 0 && currentChapter ? (
          <>
            {/* Actual book content */}
            <div
              className="mt-12 whitespace-pre-wrap font-reading leading-[1.9] text-ink/80"
              style={{ fontSize: `${fontSize}px` }}
            >
              {content}
            </div>

            {/* Navigation */}
            <div className="mt-14 flex items-center justify-between border-t border-ink/10 pt-6 text-sm">
              <button
                type="button"
                disabled={chapterIndex === 0}
                onClick={() =>
                  setChapterIndex((index) =>
                    Math.max(0, index - 1)
                  )
                }
                className="font-semibold disabled:cursor-not-allowed disabled:text-ink/30"
              >
                ← Previous
              </button>

              <span className="text-ink/45">
                {chapterIndex + 1} / {chapters.length}
              </span>

              <button
                type="button"
                disabled={
                  chapterIndex === chapters.length - 1
                }
                onClick={() =>
                  setChapterIndex((index) =>
                    Math.min(
                      chapters.length - 1,
                      index + 1
                    )
                  )
                }
                className="font-semibold disabled:cursor-not-allowed disabled:text-ink/30"
              >
                Next chapter →
              </button>
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-2xl border border-ink/10 bg-white/50 p-6 text-center">
            <p className="font-semibold">
              No readable chapters found.
            </p>

            <p className="mt-2 text-sm text-ink/60">
              This book was found, but no content is available
              in book_chapters.
            </p>

            <Link
              href="/admin/upload"
              className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-parchment"
            >
              Upload another book
            </Link>
          </div>
        )}
      </article>
    </main>
  );
}