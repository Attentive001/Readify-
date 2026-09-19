"use client";

import { useLanguage } from "../context/LanguageContext";

import { useEffect, useRef, useState } from "react";

import T from "./T";
export default function ProfileModal({
  user,
  onClose,
  onLogout,
}) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(user || {});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setProfile(user || {});
    setAvatarPreview(user?.avatar || "");
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

  // =========================
  // HANDLE INPUT
  // =========================

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =========================
  // PROFILE IMAGE
  // =========================

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = reader.result;

      setAvatarPreview(imageUrl);

      setProfile((previous) => ({
        ...previous,
        avatar: imageUrl,
      }));
    };

    reader.readAsDataURL(file);
  }

  // =========================
  // SAVE PROFILE
  // =========================

  function handleSave() {
    try {
      setSaving(true);

      const updatedUser = {
        ...profile,
        displayName:
          profile.displayName?.trim() ||
          "Readify Reader",
      };

      localStorage.setItem(
        "readify_user",
        JSON.stringify(updatedUser)
      );

      window.dispatchEvent(
        new Event("readify-auth-change")
      );

      setProfile(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error(
        "Failed to save profile:",
        error
      );

      alert("Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // CANCEL EDIT
  // =========================

  function handleCancel() {
    setProfile(user || {});
    setAvatarPreview(user?.avatar || "");
    setEditing(false);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-4 backdrop-blur-sm sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/* ==================================================
          MODAL
      ================================================== */}

      <div
        className="relative flex max-h-[calc(100vh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl sm:max-h-[calc(100vh-48px)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-gray-600 shadow-md backdrop-blur transition hover:bg-white hover:text-black"
          aria-label="Close profile"
        >
          ×
        </button>

        {/* ==================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

          {/* COVER */}

          <div className="h-32 bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-700 sm:h-40" />

          {/* PROFILE CONTENT */}

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">

            {/* ==================================================
                AVATAR + EDIT BUTTON
            ================================================== */}

            <div className="-mt-14 flex items-end justify-between sm:-mt-16">

              {/* AVATAR */}

              <div className="relative">

                <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-900 text-3xl font-bold text-white shadow-xl sm:h-32 sm:w-32">

                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}

                </div>

                {/* CAMERA BUTTON */}

                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-slate-900 text-lg text-white shadow-lg transition hover:scale-105"
                      aria-label="Change profile picture"
                    >
                      📷
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* EDIT / SAVE */}

              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mb-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <T k="editProfile" />
                </button>
              ) : (
                <div className="mb-2 flex gap-2">

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    <T k="cancel" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                </div>
              )}
            </div>

            {/* ==================================================
                PROFILE INFORMATION
            ================================================== */}

            {!editing ? (
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
            ) : (
              <div className="mt-5 space-y-4">

                {/* NAME */}

                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    <T k="fullName" />
                  </label>

                  <input
                    id="profile-name"
                    name="displayName"
                    type="text"
                    value={profile.displayName || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    <T k="email" />
                  </label>

                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    <T k="emailCannot" />
                  </p>
                </div>

                {/* BIO */}

                <div>
                  <label
                    htmlFor="profile-bio"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    <T k="bio" />
                  </label>

                  <textarea
                    id="profile-bio"
                    name="bio"
                    rows={3}
                    value={profile.bio || ""}
                    onChange={handleChange}
                    placeholder={t("tellReaders")}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>
            )}

            {/* ==================================================
                ABOUT
            ================================================== */}

            <div className="mt-6 rounded-2xl bg-gray-50 p-5">

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                <T k="about" />
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {profile.bio ||
                  "Discover books, build your personal library, continue reading, and keep track of your reading journey with Readify."}
              </p>

            </div>

            {/* ==================================================
                STATS
            ================================================== */}

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

            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              {/* LIBRARY */}

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

              {/* BOOKMARKS */}

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

              {/* PROGRESS */}

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

              {/* LOGOUT */}

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
    </div>
  );
}