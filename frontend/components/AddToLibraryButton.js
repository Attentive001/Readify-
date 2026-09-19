"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import T from "./T";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

export default function AddToLibraryButton({ bookId }) {
  const router = useRouter();

  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  function getToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      localStorage.getItem("readify_token") ||
      localStorage.getItem("token")
    );
  }

  useEffect(() => {
    async function checkLibrary() {
      const token = getToken();

      if (!token || !bookId) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/library`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setChecking(false);
          return;
        }

        const data = await response.json();

        const books = Array.isArray(data.books)
          ? data.books
          : [];

        const exists = books.some(
          (book) =>
            String(book.id) === String(bookId)
        );

        setAdded(exists);
      } catch (err) {
        console.error(
          "Failed to check library:",
          err
        );
      } finally {
        setChecking(false);
      }
    }

    checkLibrary();
  }, [bookId]);

  async function handleAddToLibrary() {
    const token = getToken();

    if (!token) {
      setError("Please sign in first.");
      return;
    }

    if (!bookId) {
      setError("Book ID is missing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/library/${bookId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to add book to library."
        );
      }

      setAdded(true);

      // Refresh the current page so the
      // library state is immediately updated.
      router.refresh();
    } catch (err) {
      console.error(
        "Add to library error:",
        err
      );

      setError(
        err.message ||
          "Failed to add book to library."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold opacity-50"
      >
        ...
      </button>
    );
  }

  if (added) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-ink"
      >
        ✓ <T k="added" />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAddToLibrary}
        disabled={loading}
        className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold transition hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          "Adding..."
        ) : (
          <>
            + <T k="addToLibrary" />
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}