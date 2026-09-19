"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

import T from "./T";
const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "rw", label: "Kinyarwanda", flag: "🇷🇼" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

const categories = [
  "Fiction",
  "Business",
  "Self Development",
  "Literature",
  "Biography",
  "History",
  "Education",
  "Technology",
  "Religion",
  "Romance",
  "Children's Books",
  "Science",
];

export default function Sidebar() {
  const { language, setLanguage, t } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  // =========================
  // SIDEBAR EVENTS
  // =========================

  useEffect(() => {
    function handleSidebarToggle() {
      setMobileOpen((current) => !current);
    }

    function handleSidebarClose() {
      setMobileOpen(false);
    }

    window.addEventListener(
      "readify-sidebar-toggle",
      handleSidebarToggle
    );

    window.addEventListener(
      "readify-sidebar-close",
      handleSidebarClose
    );

    return () => {
      window.removeEventListener(
        "readify-sidebar-toggle",
        handleSidebarToggle
      );

      window.removeEventListener(
        "readify-sidebar-close",
        handleSidebarClose
      );
    };
  }, []);

  // =========================
  // LOCK BODY WHEN MOBILE SIDEBAR IS OPEN
  // =========================

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // =========================
  // CLOSE MOBILE SIDEBAR
  // =========================

  function closeMobileSidebar() {
    setMobileOpen(false);

    window.dispatchEvent(
      new Event("readify-sidebar-closed")
    );
  }

  // =========================
  // CHANGE LANGUAGE
  // =========================

  function handleLanguageChange(code) {
    setLanguage(code);
    setLanguageOpen(false);
  }

  // =========================
  // SELECTED LANGUAGE
  // =========================

  const selectedLanguage =
    languages.find(
      (item) => item.code === language
    ) || languages[0];

  return (
    <>
      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`
          fixed left-0 top-[60px] z-[60]
          flex h-[calc(100vh-60px)]
          w-[280px] flex-col
          border-r border-ink/10
          bg-parchment
          shadow-2xl
          transition-transform duration-300 ease-out
          lg:top-[60px]
          lg:z-40
          lg:w-[260px]
          lg:shadow-none
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >
        {/* ==================================================
            MOBILE HEADER
        ================================================== */}

        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 lg:hidden">
          <div>
            <p className="font-display text-xl font-bold">
              Readify
            </p>

            <p className="text-xs text-ink/50">
              {t("browseBooks")}
            </p>
          </div>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-lg transition hover:bg-ink/5"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* ==================================================
            DESKTOP HEADER
        ================================================== */}

        <div className="hidden border-b border-ink/10 px-5 py-5 lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">
            {t("discover")}
          </p>

          <p className="mt-1 text-sm text-ink/60">
            {t("discoverBooks")}
          </p>
        </div>

        {/* ==================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">

          {/* ==================================================
              MAIN
          ================================================== */}

          <div>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
              {t("main")}
            </p>

            {/* HOME */}

            <a
              href="/"
              onClick={closeMobileSidebar}
              className="flex items-center gap-3 rounded-xl bg-ink px-3 py-2.5 text-sm font-semibold text-parchment"
            >
              <span>⌂</span>
              <span>{t("home")}</span>
            </a>

            {/* SEARCH */}

            <a
              href="/search"
              onClick={closeMobileSidebar}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
            >
              <span>⌕</span>
              <span>{t("search")}</span>
            </a>

            {/* CATEGORIES */}

            <a
              href="/categories"
              onClick={closeMobileSidebar}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
            >
              <span>▦</span>
              <span>{t("categories")}</span>
            </a>
          </div>

          {/* ==================================================
              LANGUAGE
          ================================================== */}

          <div className="mt-6">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
              {t("language")}
            </p>

            <button
              type="button"
              onClick={() =>
                setLanguageOpen((current) => !current)
              }
              className="flex w-full items-center justify-between rounded-xl border border-ink/10 px-3 py-2.5 text-sm font-medium transition hover:bg-ink/5"
            >
              <span className="flex items-center gap-3">
                <span>
                  {selectedLanguage.flag}
                </span>

                <span>
                  {selectedLanguage.label}
                </span>
              </span>

              <span
                className={`text-xs transition ${
                  languageOpen
                    ? "rotate-180"
                    : ""
                }`}
              >
                ▾
              </span>
            </button>

            {languageOpen && (
              <div className="mt-1 rounded-xl border border-ink/10 bg-white p-1 shadow-sm">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() =>
                      handleLanguageChange(item.code)
                    }
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                      language === item.code
                        ? "bg-ink text-parchment"
                        : "text-ink/70 hover:bg-ink/5"
                    }`}
                  >
                    <span>{item.flag}</span>

                    <span>{item.label}</span>

                    {language === item.code && (
                      <span className="ml-auto">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================================================
              CATEGORIES
          ================================================== */}

          <div className="mt-6">
            <button
              type="button"
              onClick={() =>
                setCategoriesOpen((current) => !current)
              }
              className="flex w-full items-center justify-between px-3 pb-2"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
                {t("categories")}
              </span>

              <span
                className={`text-xs text-ink/40 transition ${
                  categoriesOpen
                    ? "rotate-180"
                    : ""
                }`}
              >
                ▾
              </span>
            </button>

            {categoriesOpen && (
              <div className="space-y-0.5">
                <a
                  href="/categories"
                  onClick={closeMobileSidebar}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                >
                  {t("browseBooks")}
                </a>

                {categories.map((category) => (
                  <a
                    key={category}
                    href={`/categories?category=${encodeURIComponent(
                      category
                    )}`}
                    onClick={closeMobileSidebar}
                    className="block rounded-xl px-3 py-2 text-sm text-ink/60 transition hover:bg-ink/5 hover:text-ink"
                  >
                    {category}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ==================================================
              LIBRARY
          ================================================== */}

          <div className="mt-6">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
              {t("library")}
            </p>

            <a
              href="/library"
              onClick={closeMobileSidebar}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
            >
              <span>▤</span>
              <span><T k="myLibrary" /></span>
            </a>

            <a
              href="/bookmarks"
              onClick={closeMobileSidebar}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
            >
              <span>🔖</span>
              <span><T k="bookmarks" /></span>
            </a>

            <a
              href="/reading-progress"
              onClick={closeMobileSidebar}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
            >
              <span>◔</span>
              <span><T k="readingProgress" /></span>
            </a>
          </div>

          {/* ==================================================
              ACCOUNT
          ================================================== */}

          <div className="mt-6 pb-5">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
              {t("account")}
            </p>

            <a
              href="/settings"
              onClick={closeMobileSidebar}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
            >
              <span>⚙</span>
              <span><T k="settings" /></span>
            </a>
          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="border-t border-ink/10 p-4">
          <div className="rounded-2xl bg-ink px-4 py-4 text-parchment">
            <p className="text-sm font-semibold">
              {t("read")}. {t("learn")}. Grow.
            </p>

            <p className="mt-1 text-xs leading-5 text-parchment/60">
              {t("discoverBooks")}
            </p>

            <a
              href="/categories"
              onClick={closeMobileSidebar}
              className="mt-3 inline-flex text-xs font-semibold underline underline-offset-4"
            >
              {t("browseBooks")} →
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}