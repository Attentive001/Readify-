import Link from "next/link";

const coverClasses = {
  gold: "from-amber-700 via-yellow-600 to-stone-900",
  blue: "from-slate-800 via-blue-700 to-indigo-950",
  purple: "from-violet-800 via-purple-600 to-slate-950",
  green: "from-emerald-800 via-green-600 to-stone-950",
  red: "from-red-800 via-rose-600 to-stone-950",
  navy: "from-cyan-900 via-slate-700 to-blue-950",
  brown: "from-stone-700 via-amber-700 to-stone-950",
  teal: "from-teal-800 via-cyan-600 to-slate-950",
  stone: "from-stone-700 via-stone-500 to-stone-950",
  rose: "from-rose-800 via-pink-600 to-stone-950",
};

export default function BookCard({ book }) {
  const categoryLabel =
    book.category ||
    book.categories?.[0]?.name ||
    "Book";

  const cover =
    coverClasses[book.accent] || coverClasses.gold;

  const hasCover =
    typeof book.cover_url === "string" &&
    book.cover_url.trim().length > 0;

  return (
    <Link
      href={`/books/${book.id}`}
      className="block"
    >
      <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

        {/* ================= COVER ================= */}
        <div
          className={`relative flex h-64 items-end overflow-hidden bg-gradient-to-br ${cover} p-5`}
        >
          {hasCover && (
            <img
              src={book.cover_url}
              alt={`${book.title} cover`}
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          )}

          {/* Dark overlay so text remains readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Cover information */}
          <div className="relative z-10 w-full">

            <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {categoryLabel}
            </span>

            <h3 className="line-clamp-2 text-xl font-bold text-white">
              {book.title}
            </h3>

            {book.author_name && (
              <p className="mt-1 text-sm text-white/80">
                {book.author_name}
              </p>
            )}

          </div>
        </div>

        {/* ================= BOOK INFO ================= */}
        <div className="p-5">

          {book.description && (
            <p className="line-clamp-3 text-sm leading-6 text-stone-600">
              {book.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">

            <span className="text-xs text-stone-500">
              {book.language_name ||
                book.language_code ||
                "Unknown language"}
            </span>

            {book.published_year && (
              <span className="text-xs text-stone-500">
                {book.published_year}
              </span>
            )}

          </div>
        </div>
      </article>
    </Link>
  );
}