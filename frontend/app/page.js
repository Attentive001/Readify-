import { api } from "../lib/api";
import BookCard from "../components/BookCard";

export const dynamic = "force-dynamic";

async function getBooks(fn) {
  try {
    const data = await fn();

    if (Array.isArray(data?.books)) return data.books;
    if (Array.isArray(data?.books?.books)) return data.books.books;
    return [];
  } catch (error) {
    console.error("Failed to load books:", error);
    return [];
  }
}

export default async function HomePage() {
  /*
   * Get ALL books directly from PostgreSQL
   */
  const allBooks = await getBooks(() =>
    api.getBooks({
      page: 1,
      pageSize: 100,
    })
  );

  /*
   * Featured and Popular
   */
  const [featured, popular] = await Promise.all([
    getBooks(api.getFeatured),
    getBooks(api.getPopular),
  ]);

  /*
   * Create category sections from books
   *
   * Example:
   * THE BOOK OF ENOCH
   * -> History
   */
  const categoryMap = new Map();

  allBooks.forEach((book) => {
    if (!Array.isArray(book.categories)) return;

    book.categories.forEach((category) => {
      if (!category?.slug) return;

      if (!categoryMap.has(category.slug)) {
        categoryMap.set(category.slug, {
          id: category.id,
          name: category.name,
          slug: category.slug,
          books: [],
        });
      }

      categoryMap.get(category.slug).books.push(book);
    });
  });

  const categorySections = Array.from(categoryMap.values());

  return (
    <main>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-2 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-8 lg:pt-2">

          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[.25em] text-gold">
              Your digital bookshelf
            </p>

            <h1 className="font-display text-5xl font-bold leading-[.95] tracking-tight sm:text-6xl lg:text-7xl">
              Discover.
              <br />
              <span className="text-gold">Read.</span> Learn.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">
              Find your next great book, build your personal
              library, and keep your reading journey moving
              wherever you go.
            </p>
          </div>
{/* Decorative books */}
<div className="relative hidden min-h-[420px] lg:block">
  {allBooks.slice(0, 3).map((book, index) => {
    const cover =
      book.cover_url ||
      book.coverUrl ||
      book.thumbnail ||
      book.image_url ||
      "";

    return (
      <div
        key={book.id || `${book.title}-${index}`}
        className={`absolute w-[190px] overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:-translate-y-2 ${
          index === 0
            ? "right-8 top-4 rotate-6"
            : index === 1
            ? "right-40 top-32 -rotate-6"
            : "right-0 top-64 rotate-3"
        }`}
      >
        <div className="aspect-[2/3] bg-ink/10">
          {cover ? (
            <img
              src={cover}
              alt={book.title || "Book cover"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-5 text-center">
              <span className="font-display text-lg font-bold text-white">
                {book.title || "Readify"}
              </span>
            </div>
          )}
        </div>

        <div className="bg-black/30 p-3 text-white">
          <p className="truncate text-sm font-semibold">
            {book.title}
          </p>

          {book.author_name && (
            <p className="mt-1 truncate text-xs text-white/60">
              {book.author_name}
            </p>
          )}
        </div>
      </div>
    );
  })}

  {/* Readify label */}
  <div className="absolute bottom-4 left-4">
    <span className="text-xs uppercase tracking-[.25em] text-white/60">
      Readify
    </span>
  </div>
</div>
                
            </div>
      </section>

      {/* ================= ALL BOOKS ================= */}
      <section className="mx-auto max-w-7xl px-5 lg:px-3">

        <div className="mb-5 flex items-end justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
              Readify Library
            </p>

            <h2 className="mt-1 font-display text-3xl font-bold">
              All books
            </h2>
          </div>

          <span className="text-sm text-ink/55">
            {allBooks.length} books
          </span>

        </div>

        {allBooks.length === 0 ? (

          <div className="rounded-2xl border border-ink/10 bg-white/50 p-10 text-center">

            <h3 className="font-display text-xl font-bold">
              No books found
            </h3>

            <p className="mt-2 text-sm text-ink/55">
              Upload a book from the admin page to add it
              to the Readify library.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">

            {allBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}

          </div>

        )}

      </section>


      {/* ================= FEATURED ================= */}
      {featured.length > 0 && (

        <section className="mx-auto mt-20 max-w-7xl px-5 lg:px-8">

          <div className="mb-5 flex items-end justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
                Curated for you
              </p>

              <h2 className="mt-1 font-display text-3xl font-bold">
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

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">

            {featured.map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}

          </div>

        </section>

      )}


      {/* ================= POPULAR ================= */}
      {popular.length > 0 && (

        <section className="mx-auto mt-20 max-w-7xl px-5 lg:px-8">

          <div className="mb-5 flex items-end justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
                Readers are choosing
              </p>

              <h2 className="mt-1 font-display text-3xl font-bold">
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

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">

            {popular.map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}

          </div>

        </section>

      )}


      {/* ================= CATEGORIES ================= */}
      {categorySections.length > 0 && (

        <section className="mx-auto mt-20 max-w-7xl px-5 lg:px-8">

          <div className="mb-10">

            <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
              Browse by interest
            </p>

            <h2 className="mt-1 font-display text-3xl font-bold">
              Explore categories
            </h2>

          </div>


          <div className="space-y-16">

            {categorySections.map((category) => (

              <section key={category.slug}>

                <div className="mb-5 flex items-end justify-between">

                  <div>

                    <h3 className="font-display text-2xl font-bold">
                      {category.name}
                    </h3>

                  </div>

                  <a
                    href={`/categories/${category.slug}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    View all →
                  </a>

                </div>


                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">

                  {category.books.map((book) => (

                    <BookCard
                      key={book.id}
                      book={book}
                    />

                  ))}

                </div>

              </section>

            ))}

          </div>

        </section>

      )}


      {/* ================= EMPTY STATE ================= */}
      {allBooks.length === 0 && (

        <section className="mx-auto mt-20 max-w-3xl px-5 pb-20 text-center">

          <div className="rounded-2xl border border-ink/10 bg-white/50 p-10">

            <h2 className="font-display text-2xl font-bold">
              No books available yet
            </h2>

            <p className="mt-3 text-sm leading-6 text-ink/60">
              Upload a book from the Readify Admin page
              and assign it to a category.
            </p>

          </div>

        </section>

      )}


      {/* ================= LIBRARY CTA ================= */}
      <section className="mx-auto mt-20 max-w-7xl px-5 pb-16 lg:px-8">

        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-ink p-8 text-parchment sm:p-12 md:flex-row md:items-center">

          <div>

            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              Keep your journey
            </p>

            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Your next chapter starts here.
            </h2>

            <p className="mt-3 max-w-lg text-sm text-parchment/65">
              Save books to your library and return to your
              reading progress whenever you want.
            </p>

          </div>

          <a
            href="/library"
            className="shrink-0 rounded-full bg-parchment px-6 py-3 text-sm font-bold text-ink"
          >
            Open my library
          </a>

        </div>

      </section>

    </main>
  );
}