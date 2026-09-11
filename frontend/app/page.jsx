import { api } from "../lib/api";
import { mockBooks, categories } from "../lib/mockData";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";

async function getBooks(fn, fallback = []) {
  try {
    const data = await fn();
    return Array.isArray(data?.books) ? data.books : fallback;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [featured, popular, recent] = await Promise.all([
    getBooks(api.getFeatured),
    getBooks(api.getPopular),
    getBooks(api.getRecent),
  ]);

  /*
   * Get every book from the database.
   *
   * Since /books/recent returns all books ordered by created_at,
   * we use it as the complete catalog.
   */
  const allBooks = recent;

  return (
    <main>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">

          <div>
            <p className="text-xs uppercase tracking-[.25em] font-bold text-gold mb-5">
              Your digital bookshelf
            </p>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[.95] tracking-tight">
              Discover.
              <br />
              <span className="text-gold">Read.</span> Learn.
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-7 text-ink/65">
              Find your next great book, build your personal library,
              and keep your reading journey moving wherever you go.
            </p>

            <div className="mt-8">
              <SearchBar large onSubmit={undefined} />
            </div>

            <div className="mt-5 flex gap-5 text-xs text-ink/55">
              <span>✓ 1M+ catalog ready</span>
              <span>✓ Read anywhere</span>
              <span>✓ Personal library</span>
            </div>
          </div>

          <div className="hidden lg:block relative h-[430px]">

            <div className="absolute right-8 top-0 w-64 h-80 rounded-[2rem] bg-gradient-to-br from-amber-700 via-yellow-600 to-stone-900 rotate-6 shadow-2xl p-7 flex flex-col justify-between text-white">
              <span className="text-xs uppercase tracking-[.25em] text-white/60">
                Readify
              </span>

              <div>
                <div className="h-px w-12 bg-white/50 mb-4" />

                <h2 className="font-display text-3xl font-bold">
                  Atomic
                  <br />
                  Habits
                </h2>

                <p className="mt-3 text-sm text-white/65">
                  James Clear
                </p>
              </div>
            </div>

            <div className="absolute left-10 top-20 w-56 h-72 rounded-[2rem] bg-gradient-to-br from-slate-800 via-blue-700 to-indigo-950 -rotate-8 shadow-xl p-6 flex flex-col justify-between text-white">

              <span className="text-xs uppercase tracking-[.25em] text-white/60">
                Readify
              </span>

              <div>
                <h2 className="font-display text-2xl font-bold">
                  Deep
                  <br />
                  Work
                </h2>

                <p className="mt-3 text-sm text-white/65">
                  Cal Newport
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ALL BOOKS */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8">

        <div className="flex items-end justify-between mb-5">

          <div>
            <p className="text-xs uppercase tracking-[.2em] text-gold font-bold">
              Readify Library
            </p>

            <h2 className="font-display text-3xl font-bold mt-1">
              All books
            </h2>
          </div>

          <span className="text-sm text-ink/50">
            {allBooks.length} books
          </span>

        </div>

        {allBooks.length > 0 ? (

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-5">

            {allBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}

          </div>

        ) : (

          <div className="rounded-2xl border border-ink/10 bg-white/50 p-8 text-center">
            <p className="font-semibold">
              No books found.
            </p>

            <p className="mt-2 text-sm text-ink/60">
              Upload a book from the admin panel.
            </p>
          </div>

        )}

      </section>


      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 lg:px-8 mt-20">

          <div className="flex items-end justify-between mb-5">

            <div>
              <p className="text-xs uppercase tracking-[.2em] text-gold font-bold">
                Curated for you
              </p>

              <h2 className="font-display text-3xl font-bold mt-1">
                Featured books
              </h2>
            </div>

            <a
              href="/search"
              className="text-sm font-semibold hover:underline"
            >
              View all →
            </a>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">

            {featured.map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}

          </div>

        </section>
      )}


      {/* POPULAR */}
      {popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 lg:px-8 mt-20">

          <div className="flex items-end justify-between mb-5">

            <div>
              <p className="text-xs uppercase tracking-[.2em] text-gold font-bold">
                Readers are choosing
              </p>

              <h2 className="font-display text-3xl font-bold mt-1">
                Popular right now
              </h2>
            </div>

            <a
              href="/search"
              className="text-sm font-semibold hover:underline"
            >
              Explore →
            </a>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">

            {popular.map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}

          </div>

        </section>
      )}


      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 mt-20">

        <div className="mb-5">

          <p className="text-xs uppercase tracking-[.2em] text-gold font-bold">
            Browse by interest
          </p>

          <h2 className="font-display text-3xl font-bold mt-1">
            Explore categories
          </h2>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {categories.map(([name, desc, icon]) => (
            <a
              key={name}
              href={`/categories?category=${encodeURIComponent(name)}`}
              className="rounded-2xl border border-ink/10 bg-white/45 p-5 hover:-translate-y-0.5 hover:bg-white/70 transition"
            >

              <div className="text-2xl">
                {icon}
              </div>

              <h3 className="font-display font-bold mt-4">
                {name}
              </h3>

              <p className="text-xs text-ink/55 mt-1 leading-5">
                {desc}
              </p>

            </a>
          ))}

        </div>

      </section>


      {/* LIBRARY CTA */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 mt-20">

        <div className="rounded-[2rem] bg-ink text-parchment p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          <div>

            <p className="text-xs uppercase tracking-[.2em] text-amber-300 font-bold">
              Keep your journey
            </p>

            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
              Your next chapter starts here.
            </h2>

            <p className="mt-3 text-sm text-parchment/65 max-w-lg">
              Save books to your library and return to your reading progress whenever you want.
            </p>

          </div>

          <a
            href="/library"
            className="shrink-0 rounded-full bg-parchment text-ink px-6 py-3 text-sm font-bold"
          >
            Open my library
          </a>

        </div>

      </section>

    </main>
  );
}