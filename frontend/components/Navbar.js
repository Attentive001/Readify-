"use client";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/categories", label: "Categories" },
    { href: "/library", label: "My Library" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-parchment/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-parchment font-display font-bold text-lg">R</span>
          <span className="font-display text-2xl font-bold tracking-tight">Readify</span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {links.map((l) => <a key={l.href} href={l.href} className="text-ink/70 hover:text-ink transition">{l.label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/search" aria-label="Search" className="h-10 w-10 grid place-items-center rounded-full hover:bg-ink/5">⌕</a>
          <a href="/profile" className="hidden sm:flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-parchment transition">Sign in</a>
          <button onClick={() => setOpen(!open)} className="md:hidden h-10 w-10 rounded-full border border-ink/15" aria-label="Open menu">☰</button>
        </div>
      </div>
      {open && <nav className="md:hidden border-t border-ink/10 px-5 py-4 space-y-3 bg-parchment">{links.map((l) => <a onClick={() => setOpen(false)} key={l.href} href={l.href} className="block py-2 text-sm font-medium">{l.label}</a>)}<a href="/profile" className="block py-2 text-sm font-medium">Profile</a></nav>}
    </header>
  );
}
