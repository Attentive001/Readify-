import Link from "next/link";
import { api } from "../../../lib/api";
import BookCard from "../../../components/BookCard";
import AddToLibraryButton from "../../../components/AddToLibraryButton";

import T from "../../../components/T";
export default async function BookPage({ params }) {
  let book = null;

try {
  const data = await api.getBook(params.id);

  if (data?.book) {
    book = data.book;
  }
} catch (error) {
  console.error("Failed to load book:", error);
}

  if (!book) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="font-display text-3xl font-bold"><T k="bookNotFound" /></h1>
        <Link href="/search" className="mt-5 inline-block underline">
          <T k="backToSearch" />
        </Link>
      </main>
    );
  }

  const category =
    book.category || book.categories?.[0]?.name || "Book";
  const language =
    book.language_name || book.language_code || "English";
  const year = book.published_year ?? book.year ?? "—";

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <Link href="/" className="text-sm text-ink/55 hover:text-ink">
        <T k="backDiscover" />
      </Link>

      <section className="mt-8 grid items-start gap-10 md:grid-cols-[280px_1fr]">
        <div className="mx-auto w-64">
          <BookCard book={book} />
        </div>

        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
            {category}
          </p>

          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            {book.title}
          </h1>

          <p className="mt-2 text-lg text-ink/60">
            by {book.author_name || "Unknown author"}
          </p>

          <p className="mt-7 max-w-2xl leading-7 text-ink/70">
            {book.description ||
              "Explore this book on Readify and continue your reading journey."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-ink/5 px-3 py-1.5">
              {year}
            </span>
            <span className="rounded-full bg-ink/5 px-3 py-1.5">
              {language}
            </span>
            {book.isbn && (
              <span className="rounded-full bg-ink/5 px-3 py-1.5">
                ISBN: {book.isbn}
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/reader/${book.id}`}
              className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-parchment"
            >
              <T k="readNow" />
            </Link>

            <AddToLibraryButton bookId={book.id} />

            <button className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold hover:bg-white/50">
              ▶ <T k="listen" />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-ink/10 pt-10">
        <h2 className="font-display text-2xl font-bold">
          <T k="aboutBook" />
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">
          {book.description ||
            "Book information is stored in Readify and its reading content is loaded from the chapter API."}
        </p>

        {book.categories?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {book.categories.map((item) => (
              <span
                key={item.id || item.slug || item.name}
                className="rounded-full bg-ink/5 px-3 py-1.5 text-xs"
              >
                {item.name}
              </span>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
