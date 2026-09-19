"use client";

import { useEffect, useState } from "react";

import T from "../../components/T";
export default function ProfileModal({
  user,
  onClose,
  onLogout,
}) {
  const [profile, setProfile] = useState(user || {});

  useEffect(() => {
    setProfile(user || {});
  }, [user]);

  if (!user) return null;

  const name =
    profile.displayName ||
    profile.name ||
    "Readify Reader";

  const email = profile.email || "";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-xl text-gray-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-black"
          aria-label="Close profile"
        >
          ×
        </button>

        {/* COVER */}
        <div className="h-36 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-700" />

        {/* PROFILE CONTENT */}
        <div className="px-6 pb-7 sm:px-8">

          {/* AVATAR */}
          <div className="-mt-14 flex items-end justify-between">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-900 text-3xl font-bold text-white shadow-xl">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <button
              type="button"
              className="mb-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <T k="editProfile" />
            </button>
          </div>

          {/* NAME */}
          <div className="mt-4">
            <h2
              id="profile-title"
              className="text-2xl font-bold tracking-tight text-gray-900"
            >
              {name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {email}
            </p>

            <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <T k="readifyMember" />
            </div>
          </div>

          {/* BIO */}
          <div className="mt-6 rounded-2xl bg-gray-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
              <T k="about" />
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Discover books, build your personal library,
              continue reading, and keep track of your
              reading journey with Readify.
            </p>
          </div>

          {/* STATS */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                0
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <T k="books" />
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                0
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <T k="bookmarks" />
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                0%
              </p>
              <p className="mt-1 text-xs text-gray-500">
                <T k="progress" />
              </p>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            <a
              href="/library"
              onClick={onClose}
              className="group rounded-2xl border border-gray-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-lg">
                  📚
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    <T k="myLibrary" />
                  </p>

                  <p className="text-xs text-gray-500">
                    <T k="savedBooks" />
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/bookmarks"
              onClick={onClose}
              className="group rounded-2xl border border-gray-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-lg">
                  🔖
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    <T k="bookmarks" />
                  </p>

                  <p className="text-xs text-gray-500">
                    <T k="savedBooks" />
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/reading-progress"
              onClick={onClose}
              className="group rounded-2xl border border-gray-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-lg">
                  📖
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    <T k="readingProgress" />
                  </p>

                  <p className="text-xs text-gray-500">
                    <T k="continueReading" />
                  </p>
                </div>
              </div>
            </a>

            <button
              type="button"
              onClick={onLogout}
              className="group rounded-2xl border border-red-100 p-4 text-left transition hover:bg-red-50"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-lg">
                  ↪
                </div>

                <div>
                  <p className="font-semibold text-red-700">
                    <T k="signOut" />
                  </p>

                  <p className="text-xs text-gray-500">
                    <T k="signOutReadify" />
                  </p>
                </div>
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}