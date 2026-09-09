# Readify Backend

Corrected backend for the Readify reading platform.

## What was added

- `GET /api/v1/books/:id/chapters` — returns all chapters in chapter order.
- `GET /api/v1/books/:id/chapters/:chapterId` — returns one chapter.
- `POST /api/v1/books/:id/chapters` — creates one chapter.
- `POST /api/v1/books/:id/chapters/bulk` — creates many chapters in one transaction.
- `PATCH /api/v1/books/:id/chapters/:chapterId` — updates a chapter.
- `DELETE /api/v1/books/:id/chapters/:chapterId` — deletes a chapter.

The API uses the existing PostgreSQL database and the existing `book_chapters` table. No database is created or replaced by this backend package.

## Important

Before using the chapter endpoints, make sure this table exists in PostgreSQL:

```sql
CREATE TABLE IF NOT EXISTS book_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (book_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id
ON book_chapters(book_id, chapter_number);
```

## Run locally

Create `backend/.env` with your existing PostgreSQL connection string, for example:

```env
PORT=4000
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/readify
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=change-this-in-development
```

Then:

```powershell
cd D:\readify-app\backend
npm install
npm start
```

Health check:

`http://localhost:4000/health`

Expected response:

```json
{"ok":true}
```
