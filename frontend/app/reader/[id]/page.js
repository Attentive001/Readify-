"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";

/* ============================================================
   HELPERS
   ============================================================ */

function normalizeChapters(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.chapters)) return data.chapters;
  if (Array.isArray(data?.data?.chapters)) {
    return data.data.chapters;
  }

  return [];
}

function chapterNumber(chapter, index) {
  return (
    chapter.chapter_number ??
    chapter.chapterNumber ??
    index + 1
  );
}

function chapterTitle(chapter, index) {
  return (
    chapter.title ||
    `Chapter ${chapterNumber(chapter, index)}`
  );
}

function chapterContent(chapter) {
  return chapter.content || "";
}

function containsHtml(content) {
  return /<[^>]+>/.test(
    String(content || "")
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToHtml(text) {
  return String(text || "")
    .replace(/\u0000/g, "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replace(
          /\n/g,
          "<br />"
        )}</p>`
    )
    .join("");
}

function prepareContent(content) {
  if (!content) return "";

  if (containsHtml(content)) {
    return String(content).replace(
      /\u0000/g,
      ""
    );
  }

  return textToHtml(content);
}

/*
 * Convert all chapters into one HTML document.
 */
function buildFullBookHtml(chapters) {
  return chapters
    .map((chapter, index) => {
      const title = escapeHtml(
        chapterTitle(chapter, index)
      );

      const content = prepareContent(
        chapterContent(chapter)
      );

      return `
        <section class="book-chapter">
          <h2>${title}</h2>
          ${content}
        </section>
      `;
    })
    .join("");
}


/* ============================================================
   COMPONENT
   ============================================================ */

export default function ReaderPage({ params }) {
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pages, setPages] = useState([]);

  const [fontSize, setFontSize] = useState(18);
  const [bookmarked, setBookmarked] =
    useState(false);

  const [progress, setProgress] = useState(0);
  const [savedLocation, setSavedLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [paginationReady, setPaginationReady] =
    useState(false);

  const measureRef = useRef(null);
  const saveTimerRef = useRef(null);

  /*
   * ============================================================
   * LOAD BOOK
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadReader() {
      setLoading(true);
      setError("");

      try {
        /*
         * Load book
         */
        const bookData =
          await api.getBook(params.id);

        if (cancelled) return;

        if (!bookData?.book) {
          setError("Book not found.");
          setLoading(false);
          return;
        }

        setBook(bookData.book);

        /*
         * Load ALL chapters
         */
        const chapterData =
          await api.getChapters(params.id);

        if (cancelled) return;

        const loadedChapters =
          normalizeChapters(chapterData);

        if (!loadedChapters.length) {
          setError(
            "This book does not have readable chapters."
          );

          setChapters([]);
          setLoading(false);
          return;
        }

        /*
         * Sort chapters correctly.
         */
        const sortedChapters =
          [...loadedChapters].sort(
            (a, b) =>
              Number(
                a.chapter_number ??
                  a.chapterNumber ??
                  0
              ) -
              Number(
                b.chapter_number ??
                  b.chapterNumber ??
                  0
              )
          );

        setChapters(sortedChapters);

        /*
         * Load saved progress.
         */
        try {
          const progressData =
            await api.getProgress(params.id);

          if (
            !cancelled &&
            progressData?.progress
          ) {
            const saved =
              progressData.progress;

            setProgress(
              Number(saved.percent) || 0
            );

            setSavedLocation(
              saved.location || null
            );
          }
        } catch (progressError) {
          console.warn(
            "Progress loading skipped:",
            progressError
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Reader loading error:",
            err
          );

          setError(
            err.message ||
              "Unable to load this book."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReader();

    return () => {
      cancelled = true;
    };
  }, [params.id]);


  /* ============================================================
     FULL BOOK HTML
     ============================================================ */

  const fullBookHtml = useMemo(() => {
    if (!chapters.length) {
      return "";
    }

    return buildFullBookHtml(
      chapters
    );
  }, [chapters]);


  /* ============================================================
     REAL PAGINATION
     ============================================================

     We measure the actual height of the reader page.

     Nothing is split after a fixed number of paragraphs.

     Instead:

       Content
          ↓
       Page height
          ↓
       If content fits → same page
       If content does not fit → next page
   ============================================================ */

 useEffect(() => {
  if (!fullBookHtml || !measureRef.current) {
    return;
  }

  let cancelled = false;

  const createPages = () => {
    const measure = measureRef.current;

    if (!measure) return;

    /*
     * IMPORTANT:
     * Give the measuring element a real size.
     */
    measure.style.width =
      window.innerWidth <= 640
        ? "calc(100vw - 40px)"
        : "760px";

    measure.style.height =
      window.innerWidth <= 640
        ? "650px"
        : "720px";

    measure.style.padding =
      window.innerWidth <= 640
        ? "32px 20px"
        : "56px 64px";

    measure.innerHTML = "";

    const source =
      document.createElement("div");

    source.innerHTML =
      fullBookHtml;

    /*
     * Only use direct children.
     * This is much faster than searching
     * the entire document repeatedly.
     */
    const blocks = [];

    Array.from(source.children).forEach(
      (chapter) => {
        if (
          chapter.classList.contains(
            "book-chapter"
          )
        ) {
          Array.from(
            chapter.children
          ).forEach((child) => {
            blocks.push(
              child.cloneNode(true)
            );
          });
        } else {
          blocks.push(
            chapter.cloneNode(true)
          );
        }
      }
    );

    if (!blocks.length) {
      setPages([fullBookHtml]);
      setPageIndex(0);
      setPaginationReady(true);
      return;
    }

    const generatedPages = [];

    let currentPage =
      document.createElement("div");

    currentPage.className =
      "pagination-page-content";

    measure.appendChild(
      currentPage
    );

    const pageHeight =
      measure.clientHeight;

    /*
     * Safety fallback.
     */
    if (pageHeight <= 0) {
      console.warn(
        "Reader page height is 0."
      );

      setPages([fullBookHtml]);
      setPageIndex(0);
      setPaginationReady(true);

      return;
    }

    function saveCurrentPage() {
      const html =
        currentPage.innerHTML.trim();

      if (html) {
        generatedPages.push(html);
      }
    }

    function newPage() {
      saveCurrentPage();

      measure.innerHTML = "";

      currentPage =
        document.createElement("div");

      currentPage.className =
        "pagination-page-content";

      measure.appendChild(
        currentPage
      );
    }

    /*
     * Add each block to the current page.
     */
    for (const block of blocks) {
      const clone =
        block.cloneNode(true);

      currentPage.appendChild(
        clone
      );

      /*
       * If it doesn't fit,
       * move it to the next page.
       */
      if (
        currentPage.scrollHeight >
        pageHeight
      ) {
        currentPage.removeChild(
          clone
        );

        /*
         * If there is already content
         * on this page, save it and
         * move the block to next page.
         */
        if (
          currentPage.children.length > 0
        ) {
          newPage();

          currentPage.appendChild(
            clone
          );
        } else {
          /*
           * The single block itself is
           * larger than a page.
           *
           * Keep it instead of losing it.
           */
          currentPage.appendChild(
            clone
          );

          saveCurrentPage();

          measure.innerHTML = "";

          currentPage =
            document.createElement(
              "div"
            );

          currentPage.className =
            "pagination-page-content";

          measure.appendChild(
            currentPage
          );
        }
      }
    }

    saveCurrentPage();

    if (!cancelled) {
      setPages(
        generatedPages
      );

      setPageIndex((oldIndex) =>
        Math.min(
          oldIndex,
          Math.max(
            0,
            generatedPages.length - 1
          )
        )
      );

      setPaginationReady(true);
    }
  };

  /*
   * Wait only one browser frame.
   * This allows fonts/CSS to settle
   * without an unnecessary long delay.
   */
  const frame =
    requestAnimationFrame(
      createPages
    );

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}, [
  fullBookHtml,
  fontSize,
]);
  /* ============================================================
     PAGE PROGRESS
     ============================================================ */

  useEffect(() => {
    if (!pages.length) {
      return;
    }

    const newProgress =
      Math.round(
        ((pageIndex + 1) /
          pages.length) *
          100
      );

    setProgress(
      Math.max(
        0,
        Math.min(
          100,
          newProgress
        )
      )
    );

    const location =
      String(pageIndex + 1);

    setSavedLocation(
      location
    );

    clearTimeout(
      saveTimerRef.current
    );

    saveTimerRef.current =
      setTimeout(async () => {
        try {
          await api.saveProgress(
            params.id,
            newProgress,
            location
          );
        } catch (error) {
          console.warn(
            "Could not save reading progress:",
            error
          );
        }
      }, 700);

    return () => {
      clearTimeout(
        saveTimerRef.current
      );
    };
  }, [
    pageIndex,
    pages.length,
    params.id,
  ]);


  /* ============================================================
     GO TO TOP WHEN PAGE CHANGES
     ============================================================ */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pageIndex]);


  /* ============================================================
     KEYBOARD
     ============================================================ */

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowRight") {
        setPageIndex((index) =>
          Math.min(
            pages.length - 1,
            index + 1
          )
        );
      }

      if (event.key === "ArrowLeft") {
        setPageIndex((index) =>
          Math.max(
            0,
            index - 1
          )
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [pages.length]);


  /* ============================================================
     CLEANUP
     ============================================================ */

  useEffect(() => {
    return () => {
      clearTimeout(
        saveTimerRef.current
      );
    };
  }, []);


  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <main className="min-h-screen bg-parchment px-5 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-ink/60">
            Loading book...
          </p>
        </div>
      </main>
    );
  }


  /* ============================================================
     BOOK NOT FOUND
     ============================================================ */

  if (!book) {
    return (
      <main className="min-h-screen bg-parchment px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/search"
            className="text-sm text-ink/60 hover:text-ink"
          >
            ← Back to search
          </Link>

          <h1 className="mt-8 font-display text-3xl font-bold">
            {error ||
              "Book not found."}
          </h1>
        </div>
      </main>
    );
  }


  /* ============================================================
     CURRENT PAGE
     ============================================================ */

  const currentPage =
    pages[pageIndex] || "";


  /* ============================================================
     UI
     ============================================================ */

  return (
    <main className="min-h-screen bg-parchment">

      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="sticky top-0 z-30 border-b border-ink/10 bg-parchment/95 backdrop-blur">

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
                setFontSize(
                  (size) =>
                    Math.max(
                      15,
                      size - 1
                    )
                )
              }
              className="h-9 w-9 rounded-lg border border-ink/15 font-semibold hover:bg-white/60"
            >
              A−
            </button>

            <span className="hidden text-xs text-ink/50 sm:block">
              {fontSize}px
            </span>

            {/* Font increase */}

            <button
              type="button"
              onClick={() =>
                setFontSize(
                  (size) =>
                    Math.min(
                      30,
                      size + 1
                    )
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
                  (value) =>
                    !value
                )
              }
              className="ml-1 h-9 rounded-lg border border-ink/15 px-3 text-sm hover:bg-white/60"
            >
              {bookmarked
                ? "★ Saved"
                : "☆ Bookmark"}
            </button>

          </div>
        </div>

        {/* Progress bar */}

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
          READING PROGRESS
      ====================================================== */}

      <div className="mx-auto max-w-3xl px-5 pt-6">

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
          BOOK HEADER
      ====================================================== */}

      <article className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:px-10">

        <h1 className="mx-auto max-w-3xl text-center font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {book.title}
        </h1>

        <p className="mt-3 text-center text-sm text-ink/50">
          {book.author_name ||
            "Unknown author"}
        </p>

        {savedLocation && (
          <p className="mt-3 text-center text-xs text-ink/40">
            Your progress is saved
          </p>
        )}

        {error && (
          <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}


        {/* ====================================================
            HIDDEN MEASURING PAGE

            IMPORTANT:
            This is what calculates the real page height.
        ==================================================== */}

        <div
          ref={measureRef}
          aria-hidden="true"
          className="
            pointer-events-none
            invisible
            absolute
            left-[-99999px]
            top-0
            overflow-hidden

            reader-page
            reader-content
          "
         style={{
  position: "fixed",
  left: "-10000px",
  top: "0",
  width:
    typeof window !== "undefined" &&
    window.innerWidth <= 640
      ? "calc(100vw - 40px)"
      : "760px",
  height:
    typeof window !== "undefined" &&
    window.innerWidth <= 640
      ? "650px"
      : "720px",
  padding:
    typeof window !== "undefined" &&
    window.innerWidth <= 640
      ? "32px 20px"
      : "56px 64px",
  boxSizing: "border-box",
  visibility: "hidden",
  fontSize: `${fontSize}px`,
  lineHeight: "1.9",
  letterSpacing: "0.01em",
}}
        />


        {/* ====================================================
            PAGINATION LOADING
        ==================================================== */}

        {!paginationReady ? (
          <div className="mt-16 text-center text-ink/50">
            Preparing pages...
          </div>
        ) : pages.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-ink/10 bg-white/50 p-6 text-center">

            <p className="font-semibold">
              No readable content found.
            </p>

            <p className="mt-2 text-sm text-ink/60">
              This book was found, but no
              readable content is available.
            </p>

            <Link
              href="/admin/upload"
              className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-parchment"
            >
              Upload another book
            </Link>

          </div>
        ) : (
          <>
            {/* ==================================================
                REAL PAGE
            ================================================== */}

            <div
              className="
                reader-page
                reader-content
              "
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: "1.9",
                letterSpacing: "0.01em",
              }}
            >

              <div
                className="
                  reader-prose

                  [&_p]:mb-6
                  [&_p]:leading-[1.9]

                  [&_h1]:mb-6
                  [&_h1]:mt-8
                  [&_h1]:font-display
                  [&_h1]:text-3xl
                  [&_h1]:font-bold

                  [&_h2]:mb-5
                  [&_h2]:mt-8
                  [&_h2]:font-display
                  [&_h2]:text-2xl
                  [&_h2]:font-bold

                  [&_h3]:mb-4
                  [&_h3]:mt-7
                  [&_h3]:font-display
                  [&_h3]:text-xl
                  [&_h3]:font-bold

                  [&_blockquote]:my-7
                  [&_blockquote]:border-l-4
                  [&_blockquote]:border-gold
                  [&_blockquote]:pl-5
                  [&_blockquote]:italic
                  [&_blockquote]:text-ink/65

                  [&_ul]:my-5
                  [&_ul]:space-y-2

                  [&_ol]:my-5
                  [&_ol]:space-y-2

                  [&_li]:leading-[1.9]

                  [&_img]:mx-auto
                  [&_img]:my-8
                  [&_img]:block
                  [&_img]:h-auto
                  [&_img]:max-w-full
                  [&_img]:rounded-xl
                "
                dangerouslySetInnerHTML={{
                  __html:
                    currentPage,
                }}
              />

            </div>


            {/* ==================================================
                PAGE NAVIGATION
            ================================================== */}

            <div className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-3">

              {/* Previous */}

              <button
                type="button"
                disabled={
                  pageIndex === 0
                }
                onClick={() =>
                  setPageIndex(
                    (index) =>
                      Math.max(
                        0,
                        index - 1
                      )
                  )
                }
                className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
              >
                ← Previous Page
              </button>


              {/* Page number */}

              <span className="whitespace-nowrap text-sm font-semibold text-ink/60">
                Page{" "}
                {pageIndex + 1}{" "}
                /{" "}
                {pages.length}
              </span>


              {/* Next */}

              <button
                type="button"
                disabled={
                  pageIndex ===
                  pages.length - 1
                }
                onClick={() =>
                  setPageIndex(
                    (index) =>
                      Math.min(
                        pages.length - 1,
                        index + 1
                      )
                  )
                }
                className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-parchment transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
              >
                Next Page →
              </button>

            </div>


            {/* ==================================================
                PAGE INFORMATION
            ================================================== */}

            <div className="mt-6 text-center text-xs text-ink/40">

              {pageIndex ===
              pages.length - 1
                ? "You reached the end of the book."
                : `Page ${
                    pageIndex + 1
                  } of ${
                    pages.length
                  }`}

            </div>

          </>
        )}

      </article>
    </main>
  );
}