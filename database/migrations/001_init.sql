-- Readify core schema (Phase 1 MVP)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  display_name    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE languages (
  id      SERIAL PRIMARY KEY,
  code    TEXT UNIQUE NOT NULL,   -- e.g. 'en', 'fr'
  name    TEXT NOT NULL
);

CREATE TABLE authors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  call_prefix TEXT
);

CREATE TABLE books (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  author_id       UUID REFERENCES authors(id) ON DELETE SET NULL,
  language_id     INTEGER REFERENCES languages(id),
  published_year  INTEGER,
  isbn            TEXT,
  cover_url       TEXT,
  source_url      TEXT,             -- pointer to object storage / external source
  rights_status   TEXT NOT NULL DEFAULT 'unknown', -- public_domain | licensed | restricted
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_popular      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_vector   tsvector
);

CREATE TABLE book_categories (
  book_id     UUID REFERENCES books(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

CREATE TABLE book_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     UUID REFERENCES books(id) ON DELETE CASCADE,
  format      TEXT NOT NULL,        -- pdf | epub | txt
  file_url    TEXT NOT NULL,
  size_bytes  BIGINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audiobooks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id      UUID REFERENCES books(id) ON DELETE CASCADE,
  audio_url    TEXT NOT NULL,
  duration_sec INTEGER,
  provider     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id     UUID REFERENCES books(id) ON DELETE CASCADE,
  location    TEXT,                 -- chapter id / page / cfi, format-dependent
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id, location)
);

CREATE TABLE reading_progress (
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id       UUID REFERENCES books(id) ON DELETE CASCADE,
  percent       NUMERIC(5,2) NOT NULL DEFAULT 0,
  location      TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE reading_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id     UUID REFERENCES books(id) ON DELETE CASCADE,
  opened_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE favorites (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id     UUID REFERENCES books(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

-- Indexes for scale (title/author/isbn lookups, pagination, filters)
CREATE INDEX idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
CREATE INDEX idx_books_search_vector ON books USING gin (search_vector);
CREATE INDEX idx_books_language ON books (language_id);
CREATE INDEX idx_books_published_year ON books (published_year);
CREATE INDEX idx_book_categories_category ON book_categories (category_id);
CREATE INDEX idx_reading_progress_user ON reading_progress (user_id);
CREATE INDEX idx_reading_history_user_opened ON reading_history (user_id, opened_at DESC);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Keep search_vector in sync
CREATE OR REPLACE FUNCTION books_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.isbn, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_search_vector_trigger
BEFORE INSERT OR UPDATE ON books
FOR EACH ROW EXECUTE FUNCTION books_search_vector_update();
