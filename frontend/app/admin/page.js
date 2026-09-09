"use client";

import { useState } from "react";
import { api } from "../../lib/api";

export default function AdminUploadPage() {
  const [form, setForm] = useState({
    title: "", author: "", category: "Fiction", language: "en",
    publishedYear: "", description: "", isbn: "", rightsStatus: "public_domain",
    isFeatured: false, isPopular: false,
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function update(e) {
    const { name, value, type, checked } = e.target;
    setForm((old) => ({ ...old, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return setStatus("Please choose a PDF, EPUB, or TXT file.");
    setBusy(true); setStatus("Uploading and importing chapters...");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
      data.append("file", file);
      const result = await api.uploadBook(data);
      setStatus(`✓ ${result.message} ${result.book.chaptersCount} chapter(s) imported.`);
      setFile(null);
      e.target.reset();
      setForm((old) => ({ ...old, title:"", author:"", publishedYear:"", description:"", isbn:"" }));
    } catch (err) {
      setStatus(`✕ ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-5 lg:px-8 py-12">
      <p className="text-xs uppercase tracking-[.25em] text-gold font-bold">Admin</p>
      <h1 className="font-display text-4xl font-bold mt-2">Upload a book</h1>
      <p className="mt-2 text-ink/60">Upload the full book and Readify will create its chapters automatically.</p>

      <form onSubmit={submit} className="mt-10 rounded-3xl border border-ink/10 bg-white/60 p-6 sm:p-8 space-y-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block"><span className="text-sm font-semibold">Book title *</span>
            <input name="title" value={form.title} onChange={update} required className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none" placeholder="Pride and Prejudice" />
          </label>
          <label className="block"><span className="text-sm font-semibold">Author</span>
            <input name="author" value={form.author} onChange={update} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none" placeholder="Jane Austen" />
          </label>
          <label className="block"><span className="text-sm font-semibold">Category</span>
            <input name="category" value={form.category} onChange={update} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none" />
          </label>
          <label className="block"><span className="text-sm font-semibold">Language code</span>
            <input name="language" value={form.language} onChange={update} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none" placeholder="en" />
          </label>
          <label className="block"><span className="text-sm font-semibold">Published year</span>
            <input name="publishedYear" type="number" value={form.publishedYear} onChange={update} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none" />
          </label>
          <label className="block"><span className="text-sm font-semibold">ISBN</span>
            <input name="isbn" value={form.isbn} onChange={update} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none" />
          </label>
        </div>

        <label className="block"><span className="text-sm font-semibold">Description</span>
          <textarea name="description" value={form.description} onChange={update} rows={4} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none" />
        </label>

        <label className="block"><span className="text-sm font-semibold">Book file *</span>
          <input type="file" accept=".pdf,.epub,.txt" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2 block w-full rounded-xl border border-dashed border-ink/20 bg-white px-4 py-4" />
          <span className="text-xs text-ink/50 mt-2 block">PDF, EPUB or TXT • maximum 50 MB</span>
        </label>

        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={update} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="isPopular" checked={form.isPopular} onChange={update} /> Popular</label>
        </div>

        <label className="block"><span className="text-sm font-semibold">Rights status</span>
          <select name="rightsStatus" value={form.rightsStatus} onChange={update} className="mt-2 rounded-xl border border-ink/15 bg-white px-4 py-3">
            <option value="public_domain">Public domain</option>
            <option value="licensed">Licensed</option>
            <option value="restricted">Restricted</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <button disabled={busy} className="rounded-full bg-ink text-parchment px-7 py-3 font-bold disabled:opacity-50">
          {busy ? "Uploading..." : "📤 Upload book"}
        </button>

        {status && <div className="rounded-xl bg-ink/5 px-4 py-3 text-sm">{status}</div>}
      </form>
    </main>
  );
}
