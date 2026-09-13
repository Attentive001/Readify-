"use client";

import { useState } from "react";

export default function AddToLibraryButton({ bookId }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function addToLibrary() {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please sign in first.");
        return;
      }

      const response = await fetch(
        `http://localhost:4000/api/v1/library/${bookId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add book to library."
        );
      }

      setShowConfirm(false);
      setMessage("✓ Added to your library.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold hover:bg-white/50"
      >
        ♡ Add to library
      </button>

      {message && (
        <p className="mt-3 text-sm font-semibold text-green-700">
          {message}
        </p>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-ink">
              Add to Library?
            </h2>

            <p className="mt-3 text-sm leading-6 text-ink/60">
              Do you want to add this book to your personal library?
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 rounded-full border border-ink/15 px-5 py-3 text-sm font-bold"
              >
                No
              </button>

              <button
                type="button"
                onClick={addToLibrary}
                disabled={loading}
                className="flex-1 rounded-full bg-ink px-5 py-3 text-sm font-bold text-parchment disabled:opacity-50"
              >
                {loading ? "Adding..." : "Yes, Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}