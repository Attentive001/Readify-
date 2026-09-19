"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

import T from "./T";
export default function SearchBar({ value = "", onChange, onSubmit, large = false }) {
  const { t } = useLanguage();
  const [local, setLocal] = useState(value);
  const current = onChange ? value : local;

  useEffect(() => {
    if (!onChange) setLocal(value);
  }, [value, onChange]);

  return (
    <form
      onSubmit={onSubmit}
      className={`flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/70 p-2 shadow-sm ${large ? "max-w-2xl" : ""}`}
    >
      <span className="pl-3 text-xl text-ink/45">⌕</span>

      <input
        value={current}
        onChange={(e) =>
          onChange ? onChange(e.target.value) : setLocal(e.target.value)
        }
        placeholder={t("searchPlaceholder")}
        className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-ink/40"
      />

      <button
        type="submit"
        className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-parchment hover:opacity-90"
      >
        <T k="search" />
      </button>
    </form>
  );
}
