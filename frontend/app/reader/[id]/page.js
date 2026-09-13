"use client";

import { useEffect, useRef, useState } from "react";
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

  const [progress, setProgress] = useState(0);
  const [savedLocation, setSavedLocation] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(true);
  const [error, setError] = useState("");

  const contentRef = useRef(null);
  const saveTimerRef = useRef(null);

  const currentChapter = chapters[chapterIndex];

  const content = currentChapter
    ? chapterContent(currentChapter)
    : "";

  /*
   * ============================================================
   * 1. LOAD BOOK + CHAPTERS + SAVED PROGRESS
   * ============================================================
   */
  useEffect(() => {
    let cancelled = false;

    async function loadReader() {
      setLoading(true);
      setChapterLoading(true);
      setProgressLoading(true);
      setError("");

      try {
        // Load book
        const bookData = await api.getBook(params.id);

        if (cancelled) return;

        if (!bookData?.book) {
          setError("Book not found.");
          setLoading(false);
          setChapterLoading(false);
          setProgressLoading(false);
          return;
        }

        setBook(bookData.book);

        // Load chapters
        try {
          const chapterData = await api.getChapters(params.id);

          if (cancelled) return;

          const loadedChapters = normalizeChapters(chapterData);

          if (loadedChapters.length === 0) {
            setError("This book does not have readable chapters.");
            setChapters([]);
            setProgressLoading(false);
          } else {
            setChapters(loadedChapters);

            /*
             * Default chapter
             */
            let selectedChapterIndex = 0;

            /*
             * Load saved reading progress
             */
            try {
              const progressData = await api.getProgress(params.id);

              if (!cancelled && progressData?.progress) {
                const saved = progressData.progress;

                const savedPercent =
                  Number(saved.percent) || 0;

                setProgress(savedPercent);
                setSavedLocation(saved.location || null);

                /*
                 * Find saved chapter
                 */
                if (saved.location) {
                  const foundIndex = loadedChapters.findIndex(
                    (chapter, index) => {
                      const number = chapterNumber(
                        chapter,
                        index
                      );

                      return (
                        String(saved.location) ===
                          String(chapter.id) ||
                        String(saved.location) ===
                          String(number)
                      );
                    }
                  );

                  if (foundIndex >= 0) {
                    selectedChapterIndex = foundIndex;
                  }
                }
              }
            } catch (progressError) {
              /*
               * User may not be logged in.
               * Reading should still work.
               */
              console.warn(
                "Progress loading skipped:",
                progressError
              );
            }

            if (!cancelled) {
              setChapterIndex(selectedChapterIndex);
            }
          }
        } catch (chapterError) {
          if (!cancelled) {
            console.error(
              "Chapter loading error:",
              chapterError
            );

            setChapters([]);

            setError(
              "The book was found, but its chapters could not be loaded."
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Book loading error:", err);

          setError(
            err.message || "Unable to load this book."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setChapterLoading(false);
          setProgressLoading(false);
        }
      }
    }

    loadReader();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  /*
   * ============================================================
   * 2. SCROLL → CALCULATE PROGRESS → SAVE PROGRESS
   * ============================================================
   */
  useEffect(() => {
    if (!chapters.length || !currentChapter) {
      return;
    }

    function handleScroll() {
      const element = contentRef.current;

      if (!element) {
        return;
      }

      /*
       * Position of the chapter content
       */
      const rect = element.getBoundingClientRect();

      const chapterTop =
        window.scrollY + rect.top;

      const chapterHeight = element.offsetHeight;

      const viewportHeight = window.innerHeight;

      /*
       * How far the user has moved through this chapter
       */
      const start = chapterTop;

      const end =
        chapterTop +
        chapterHeight -
        viewportHeight;

      const availableDistance =
        Math.max(1, end - start);

      const currentPosition =
        window.scrollY - start;

      const chapterProgress = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (currentPosition / availableDistance) *
              100
          )
        )
      );

      /*
       * Calculate whole-book progress
       */
      const overallProgress = Math.round(
        ((chapterIndex +
          chapterProgress / 100) /
          chapters.length) *
          100
      );

      const safeOverallProgress = Math.max(
        0,
        Math.min(100, overallProgress)
      );

      setProgress(safeOverallProgress);

      /*
       * Location = current chapter.
       *
       * This allows Continue Reading to know
       * which chapter to open.
       */
      const location =
        currentChapter.id ||
        chapterNumber(
          currentChapter,
          chapterIndex
        );

      setSavedLocation(String(location));

      /*
       * Avoid sending a request on every scroll event.
       * Wait 1 second after the user stops scrolling.
       */
      clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(
        async () => {
          try {
            await api.saveProgress(
              params.id,
              safeOverallProgress,
              String(location)
            );
          } catch (saveError) {
            console.warn(
              "Could not save reading progress:",
              saveError
            );
          }
        },
        1000
      );
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      clearTimeout(saveTimerRef.current);
    };
  }, [
    chapters,
    chapterIndex,
    currentChapter,
    params.id,
  ]);

  /*
   * ============================================================
   * 3. WHEN USER CHANGES CHAPTER → SCROLL TO TOP
   * ============================================================
   */
  useEffect(() => {
    if (!currentChapter) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [chapterIndex, currentChapter]);

  /*
   * ============================================================
   * 4. SAVE PROGRESS WHEN USER LEAVES PAGE
   * ============================================================
   */
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current);
    };
  }, []);

  /*
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */
  if (loading) {
    return (
      <main className="min-h-screen px-5 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-ink/60">
            Loading book...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * BOOK NOT FOUND
   * ============================================================
   */
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

  return (
    <main className="min-h-screen">

      {/* ======================================================
          READER TOOLBAR
      ====================================================== */}
      <div className="sticky top-0 z-20 border-b border-ink/10 bg-parchment/95 backdrop-blur">

        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">

          <Link
            href={`/books/${book.id}`}
            className="max-w-[40%] truncate text-sm text-ink/60 hover:text-ink"
          >
            ← {book.title}
          </Link>

          <div className="flex items-center gap-2">

            {/* Font decrease */}
            <button
              type="button"
              onClick={() =>
                setFontSize((size) =>
                  Math.max(14, size - 2)
                )
              }
              className="h-9 w-9 rounded-lg border border-ink/15 font-semibold hover:bg-white/60"
            >
              A−
            </button>

            <span className="text-xs text-ink/50">
              {fontSize}px
            </span>

            {/* Font increase */}
            <button
              type="button"
              onClick={() =>
                setFontSize((size) =>
                  Math.min(28, size + 2)
                )
              }
              className="h-9 w-9 rounded-lg border border-ink/15 font-semibold hover:bg-white/60"
            >
              A+
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() =>
                setBookmarked(
                  (value) => !value
                )
              }
              className="ml-2 h-9 rounded-lg border border-ink/15 px-3 text-sm hover:bg-white/60"
            >
              {bookmarked
                ? "★ Saved"
                : "☆ Bookmark"}
            </button>
          </div>
        </div>

        {/* ==================================================
            REAL READING PROGRESS BAR
        ================================================== */}
        <div className="h-1 w-full bg-ink/10">

          <div
            className="h-full rounded-r-full bg-amber-300 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* ======================================================
          PROGRESS INFORMATION
      ====================================================== */}
      <div className="mx-auto max-w-3xl px-5 pt-5">

        <div className="flex items-center justify-between text-xs text-ink/50">

          <span>
            Reading progress
          </span>

          <span className="font-semibold text-ink/70">
            {progress}%
          </span>

        </div>

      </div>

      {/* ======================================================
          READER CONTENT
      ====================================================== */}
      <article className="mx-auto max-w-3xl px-5 py-14">

        {/* Chapter label */}
        <p className="text-center text-xs font-bold uppercase tracking-[.25em] text-gold">

          {currentChapter
            ? `Chapter ${chapterNumber(
                currentChapter,
                chapterIndex
              )}`
            : "Book"}

        </p>

        {/* Chapter title */}
        <h1 className="mt-4 text-center font-display text-4xl font-bold leading-tight sm:text-5xl">

          {currentChapter
            ? chapterTitle(
                currentChapter,
                chapterIndex
              )
            : book.title}

        </h1>

        {/* Author */}
        <p className="mt-2 text-center text-sm text-ink/50">
          {book.author_name ||
            "Unknown author"}
        </p>

        {/* Saved location */}
        {savedLocation && (
          <p className="mt-3 text-center text-xs text-ink/40">
            Your progress is saved
          </p>
        )}

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

        ) : chapters.length > 0 &&
          currentChapter ? (

          <>

            {/* =================================================
                ACTUAL BOOK CONTENT
            ================================================= */}
            <div
              ref={contentRef}
              className="mt-12 whitespace-pre-wrap font-reading leading-[1.9] text-ink/80"
              style={{
                fontSize: `${fontSize}px`,
              }}
            >
              {content}
            </div>

            {/* =================================================
                CHAPTER NAVIGATION
            ================================================= */}
            <div className="mt-14 flex items-center justify-between border-t border-ink/10 pt-6 text-sm">

              {/* Previous */}
              <button
                type="button"
                disabled={chapterIndex === 0}
                onClick={() =>
                  setChapterIndex(
                    (index) =>
                      Math.max(
                        0,
                        index - 1
                      )
                  )
                }
                className="font-semibold disabled:cursor-not-allowed disabled:text-ink/30"
              >
                ← Previous
              </button>

              {/* Chapter count */}
              <span className="text-ink/45">
                {chapterIndex + 1} /{" "}
                {chapters.length}
              </span>

              {/* Next */}
              <button
                type="button"
                disabled={
                  chapterIndex ===
                  chapters.length - 1
                }
                onClick={() =>
                  setChapterIndex(
                    (index) =>
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

          /* ==================================================
             NO CHAPTERS
          ================================================== */
          <div className="mt-12 rounded-2xl border border-ink/10 bg-white/50 p-6 text-center">

            <p className="font-semibold">
              No readable chapters found.
            </p>

            <p className="mt-2 text-sm text-ink/60">
              This book was found, but no
              content is available in
              book_chapters.
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