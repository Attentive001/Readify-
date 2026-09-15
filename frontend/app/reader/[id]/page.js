"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

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

  const absoluteFileUrl = useMemo(() => {
    if (!book?.file_url) return "";

    if (book.file_url.startsWith("http")) {
      return book.file_url;
    }

    return `${BACKEND_URL}${book.file_url}`;
  }, [book]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setInputPage("1");
  }

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

  function zoomOut() {
    setScale((current) =>
      Math.max(0.7, Number((current - 0.1).toFixed(1)))
    );
  }

  function zoomIn() {
    setScale((current) =>
      Math.min(2, Number((current + 0.1).toFixed(1)))
    );
  }

  function resetZoom() {
    setScale(1);
  }

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

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [pageNumber, numPages]);

  if (loading) {
    return (
      <main className="reader-loading">
        <div className="reader-loading-card">
          <div className="reader-spinner" />
          <p>Loading book...</p>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="reader-error">
        <div className="reader-error-card">
          <h1>Unable to open this book</h1>

          <p>
            {error || "Book not found."}
          </p>

          <Link
            href="/books"
            className="reader-back-button"
          >
            ← Back to books
          </Link>
        </div>
      </main>
    );
  }

  if (!absoluteFileUrl) {
    return (
      <main className="reader-error">
        <div className="reader-error-card">
          <h1>No original file</h1>

          <p>
            This book exists in the database, but no
            original file is attached to it yet.
          </p>

          <Link
            href={`/books/${book.id}`}
            className="reader-back-button"
          >
            ← Back to book
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="reader-shell">

      {/* HEADER */}
      <header className="reader-header">

        <div className="reader-header-left">

          <Link
            href={`/books/${book.id}`}
            className="reader-back"
          >
            ← Back
          </Link>

          <div className="reader-book-info">
            <h1>{book.title}</h1>

            {book.author_name && (
              <p>{book.author_name}</p>
            )}
          </div>

        </div>

        <div className="reader-status">
          <span>Page</span>

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
            ← Previous
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
              Go
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
            Next →
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


      {/* BOOK */}
      <section className="reader-book-area">

        <Document
          file={absoluteFileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error("PDF loading error:", err);
            setError(
              "The PDF could not be loaded."
            );
          }}
          loading={
            <div className="reader-pdf-loading">
              Loading PDF...
            </div>
          }
          error={
            <div className="reader-pdf-error">
              Unable to display this PDF.
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
            ← Previous Page
          </button>

          <div className="reader-page-counter">
            Page <strong>{pageNumber}</strong> of{" "}
            <strong>{numPages}</strong>
          </div>

          <button
            type="button"
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="reader-bottom-button"
          >
            Next Page →
          </button>

        </footer>
      )}

    </main>
  );
}