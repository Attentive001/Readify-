"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import T from "../../../components/T";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

import { api } from "../../../lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

const BACKEND_URL = API_URL.replace(/\/api\/v1\/?$/, "");

export default function ReaderPage() {
  const params = useParams();
  const bookId = params?.id;

  const [book, setBook] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  const [inputPage, setInputPage] = useState("1");

  // =========================================================
  // BOOKMARK STATE
  // =========================================================
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState("");

  const currentLocation = `page:${pageNumber}`;

  const currentBookmark = useMemo(() => {
    return bookmarks.find(
      (bookmark) => bookmark.location === currentLocation
    );
  }, [bookmarks, currentLocation]);

  const isBookmarked = Boolean(currentBookmark);

  // =========================================================
  // LOAD BOOK
  // =========================================================
  useEffect(() => {
    if (!bookId) return;

    let cancelled = false;

    async function loadBook() {
      try {
        setLoading(true);
        setError("");

        const response = await api.getBook(bookId);

        if (!cancelled) {
          setBook(response?.book || response || null);
        }
      } catch (err) {
        console.error("Reader loading error:", err);

        if (!cancelled) {
          setError(
            err?.message || "Failed to load this book."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // =========================================================
  // LOAD BOOKMARKS
  // =========================================================
  useEffect(() => {
    if (!bookId) return;

    let cancelled = false;

    async function loadBookmarks() {
      try {
        setBookmarkError("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("readify_token") ||
              localStorage.getItem("token")
            : null;

        if (!token) {
          setBookmarks([]);
          return;
        }

        const response = await fetch(
          `${API_URL}/books/${bookId}/bookmarks`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load bookmarks."
          );
        }

        if (!cancelled) {
          setBookmarks(
            Array.isArray(data.bookmarks)
              ? data.bookmarks
              : []
          );
        }
      } catch (err) {
        console.error("Load bookmarks error:", err);

        if (!cancelled) {
          setBookmarkError(
            err?.message || "Failed to load bookmarks."
          );
        }
      }
    }

    loadBookmarks();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // =========================================================
  // ADD / REMOVE BOOKMARK
  // =========================================================
  async function toggleBookmark() {
    if (!bookId) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("readify_token") ||
          localStorage.getItem("token")
        : null;

    if (!token) {
      setBookmarkError("Please sign in first to use bookmarks.");
      return;
    }

    setBookmarkLoading(true);
    setBookmarkError("");

    try {
      if (isBookmarked) {
        const response = await fetch(
          `${API_URL}/books/${bookId}/bookmarks?location=${encodeURIComponent(
            currentLocation
          )}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to remove bookmark."
          );
        }

        setBookmarks((current) =>
          current.filter(
            (bookmark) =>
              bookmark.location !== currentLocation
          )
        );
      } else {
        const response = await fetch(
          `${API_URL}/books/${bookId}/bookmarks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              location: currentLocation,
              note: `Page ${pageNumber}`,
            }),
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to save bookmark."
          );
        }

        if (data.bookmark) {
          setBookmarks((current) => {
            const withoutDuplicate = current.filter(
              (bookmark) =>
                bookmark.location !== currentLocation
            );

            return [
              data.bookmark,
              ...withoutDuplicate,
            ];
          });
        }
      }
    } catch (err) {
      console.error("Bookmark error:", err);

      setBookmarkError(
        err?.message || "Bookmark operation failed."
      );
    } finally {
      setBookmarkLoading(false);
    }
  }

  // =========================================================
  // PDF URL
  // =========================================================
  const absoluteFileUrl = useMemo(() => {
    if (!book?.file_url) return "";

    if (book.file_url.startsWith("http")) {
      return book.file_url;
    }

    return `${BACKEND_URL}${book.file_url}`;
  }, [book]);

  // =========================================================
  // PDF LOAD
  // =========================================================
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setInputPage("1");
  }

  // =========================================================
  // PAGE NAVIGATION
  // =========================================================
  function goToPage(page) {
    if (!numPages) return;

    const target = Math.max(
      1,
      Math.min(numPages, Number(page))
    );

    setPageNumber(target);
    setInputPage(String(target));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousPage() {
    if (pageNumber > 1) {
      goToPage(pageNumber - 1);
    }
  }

  function nextPage() {
    if (pageNumber < numPages) {
      goToPage(pageNumber + 1);
    }
  }

  function handlePageInput(event) {
    setInputPage(event.target.value);
  }

  function handlePageSubmit(event) {
    event.preventDefault();

    const value = Number(inputPage);

    if (!Number.isFinite(value)) {
      setInputPage(String(pageNumber));
      return;
    }

    goToPage(value);
  }

  // =========================================================
  // ZOOM
  // =========================================================
  function zoomOut() {
    setScale((current) =>
      Math.max(
        0.7,
        Number((current - 0.1).toFixed(1))
      )
    );
  }

  function zoomIn() {
    setScale((current) =>
      Math.min(
        2,
        Number((current + 0.1).toFixed(1))
      )
    );
  }

  function resetZoom() {
    setScale(1);
  }

  // =========================================================
  // KEYBOARD CONTROLS
  // =========================================================
  useEffect(() => {
    function handleKeyboard(event) {
      if (event.key === "ArrowLeft") {
        previousPage();
      }

      if (event.key === "ArrowRight") {
        nextPage();
      }

      if (event.key === "Home") {
        goToPage(1);
      }

      if (event.key === "End" && numPages) {
        goToPage(numPages);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [pageNumber, numPages]);

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <main className="reader-loading">
        <div className="reader-loading-card">
          <div className="reader-spinner" />

          <p>
            <T k="loadingBook" />
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error || !book) {
    return (
      <main className="reader-error">
        <div className="reader-error-card">
          <h1>
            <T k="unableOpenBook" />
          </h1>

          <p>
            {error || <T k="bookNotFound" />}
          </p>

          <Link
            href="/books"
            className="reader-back-button"
          >
            <T k="backBooks" />
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // NO FILE
  // =========================================================
  if (!absoluteFileUrl) {
    return (
      <main className="reader-error">
        <div className="reader-error-card">
          <h1>
            <T k="noOriginalFile" />
          </h1>

          <p>
            This book exists in the database, but no
            original file is attached to it yet.
          </p>

          <Link
            href={`/books/${book.id}`}
            className="reader-back-button"
          >
            <T k="backBook" />
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // READER
  // =========================================================
  return (
    <main className="reader-shell">

      {/* HEADER */}
      <header className="reader-header">

        <div className="reader-header-left">

          <Link
            href={`/books/${book.id}`}
            className="reader-back"
          >
            <T k="back" />
          </Link>

          <div className="reader-book-info">
            <h1>{book.title}</h1>

            {book.author_name && (
              <p>{book.author_name}</p>
            )}
          </div>

        </div>

        <div className="reader-status">
          <span>
            <T k="page" />
          </span>

          <strong>
            {pageNumber}
          </strong>

          <span>
            / {numPages || "..."}
          </span>
        </div>

      </header>


      {/* CONTROLS */}
      <div className="reader-toolbar">

        <div className="reader-navigation">

          <button
            type="button"
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="reader-control-button"
          >
            <T k="previous" />
          </button>

          <form
            onSubmit={handlePageSubmit}
            className="reader-page-form"
          >
            <input
              type="number"
              min="1"
              max={numPages || undefined}
              value={inputPage}
              onChange={handlePageInput}
              aria-label="Page number"
            />

            <span>
              / {numPages || "..."}
            </span>

            <button
              type="submit"
              className="reader-go-button"
            >
              <T k="go" />
            </button>
          </form>

          <button
            type="button"
            onClick={nextPage}
            disabled={
              !numPages ||
              pageNumber >= numPages
            }
            className="reader-control-button"
          >
            <T k="next" />
          </button>

        </div>


        {/* =====================================================
            BOOKMARK BUTTON
            ===================================================== */}
        <div className="reader-bookmark">

          <button
            type="button"
            onClick={toggleBookmark}
            disabled={bookmarkLoading}
            className={`reader-control-button ${
              isBookmarked
                ? "reader-bookmark-active"
                : ""
            }`}
            aria-label={
              isBookmarked
                ? "Remove bookmark"
                : "Bookmark this page"
            }
            title={
              isBookmarked
                ? "Remove bookmark"
                : "Bookmark this page"
            }
          >
            {bookmarkLoading
              ? "..."
              : isBookmarked
              ? "🔖 Bookmarked"
              : "🔖 Bookmark"}
          </button>

        </div>


        <div className="reader-zoom">

          <button
            type="button"
            onClick={zoomOut}
            className="reader-zoom-button"
            aria-label="Zoom out"
          >
            −
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="reader-zoom-value"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            className="reader-zoom-button"
            aria-label="Zoom in"
          >
            +
          </button>

        </div>

      </div>


      {/* BOOKMARK ERROR */}
      {bookmarkError && (
        <div
          className="mx-auto mt-3 max-w-5xl px-4"
          role="alert"
        >
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {bookmarkError}
          </p>
        </div>
      )}


      {/* BOOK */}
      <section className="reader-book-area">

        <Document
          file={absoluteFileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error(
              "PDF loading error:",
              err
            );

            setError(
              "The PDF could not be loaded."
            );
          }}
          loading={
            <div className="reader-pdf-loading">
              <T k="loadingPdf" />
            </div>
          }
          error={
            <div className="reader-pdf-error">
              <T k="unablePdf" />
            </div>
          }
        >

          <div className="reader-page-container">

            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="reader-pdf-page"
            />

          </div>

        </Document>

      </section>


      {/* BOTTOM NAVIGATION */}
      {numPages > 0 && (
        <footer className="reader-bottom-controls">

          <button
            type="button"
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="reader-bottom-button"
          >
            <T k="previousPage" />
          </button>

          <div className="reader-page-counter">
            <T k="page" />{" "}
            <strong>{pageNumber}</strong> /{" "}
            <strong>{numPages}</strong>
          </div>

          <button
            type="button"
            onClick={nextPage}
            disabled={
              pageNumber >= numPages
            }
            className="reader-bottom-button"
          >
            <T k="nextPage" />
          </button>

        </footer>
      )}

    </main>
  );
}