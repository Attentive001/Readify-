"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1";

export default function ProfilePage() {
  const router = useRouter();

  const [mode, setMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("readify_token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load profile."
          );
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message);

        // Remove invalid token
        localStorage.removeItem("readify_token");
        localStorage.removeItem("readify_user");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    localStorage.removeItem("readify_token");
    localStorage.removeItem("readify_user");

    setUser(null);

    router.push("/login");
  }

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-5 lg:px-8 py-12">
        <p className="text-sm text-ink/55">
          Loading your profile...
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-5 lg:px-8 py-12">
      <p className="text-xs uppercase tracking-[.2em] text-gold font-bold">
        Your account
      </p>

      <h1 className="font-display text-4xl font-bold mt-2">
        Profile & settings
      </h1>

      <div className="mt-9 grid md:grid-cols-[240px_1fr] gap-8">
        {/* PROFILE SIDEBAR */}
        <aside className="rounded-3xl bg-ink text-parchment p-7 h-fit">
          <div className="h-16 w-16 rounded-full bg-parchment text-ink grid place-items-center font-display text-2xl font-bold">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "R"}
          </div>

          <h2 className="font-display text-xl font-bold mt-5">
            {user?.name || "Reader"}
          </h2>

          <p className="text-sm text-parchment/55 mt-1">
            {user?.email || "Sign in to sync your library."}
          </p>

          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full text-center mt-6 rounded-full bg-parchment text-ink px-4 py-3 text-sm font-bold"
            >
              Logout
            </button>
          ) : (
            <a
              href="/login"
              className="block text-center mt-6 rounded-full bg-parchment text-ink px-4 py-3 text-sm font-bold"
            >
              Sign in
            </a>
          )}
        </aside>

        <div className="space-y-4">
          {/* ACCOUNT */}
          <div
            id="signin"
            className="rounded-3xl border border-ink/10 bg-white/45 p-7"
          >
            <h2 className="font-display text-2xl font-bold">
              Account
            </h2>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {user ? (
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/45">
                    Name
                  </p>

                  <p className="mt-1 font-semibold">
                    {user.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/45">
                    Email
                  </p>

                  <p className="mt-1 font-semibold">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/45">
                    Account ID
                  </p>

                  <p className="mt-1 text-sm break-all text-ink/65">
                    {user.id}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-ink/55">
                  You are not signed in.
                </p>

                <a
                  href="/login"
                  className="inline-block mt-4 rounded-full bg-ink text-parchment px-6 py-3 text-sm font-bold"
                >
                  Sign in
                </a>
              </div>
            )}
          </div>

          {/* READING PREFERENCES */}
          <div className="rounded-3xl border border-ink/10 bg-white/45 p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Reading preferences
                </h2>

                <p className="text-sm text-ink/55 mt-1">
                  Choose a comfortable reading appearance.
                </p>
              </div>

              <button
                onClick={() => setMode(!mode)}
                className={`h-8 w-14 rounded-full p-1 transition ${
                  mode ? "bg-ink" : "bg-ink/15"
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-parchment shadow transition ${
                    mode ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <span className="rounded-xl border border-ink/10 px-4 py-3 text-sm">
                Aa &nbsp; Lora
              </span>

              <span className="rounded-xl border border-ink/10 px-4 py-3 text-sm">
                18 px
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}