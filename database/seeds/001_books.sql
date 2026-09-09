-- Minimal seed data to get the catalog running locally.

INSERT INTO languages (code, name) VALUES
  ('en', 'English'), ('fr', 'French'), ('es', 'Spanish')
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, slug, call_prefix) VALUES
  ('Fiction', 'fiction', 'FIC'),
  ('Classic Literature', 'classic-literature', '813'),
  ('Science', 'science', '500'),
  ('Philosophy', 'philosophy', '100'),
  ('History', 'history', '900'),
  ('Self-Development', 'self-development', '158'),
  ('Children''s Books', 'childrens-books', 'J'),
  ('Biography', 'biography', '921')
ON CONFLICT DO NOTHING;

WITH a1 AS (
  INSERT INTO authors (name) VALUES ('Jane Austen') RETURNING id
), a2 AS (
  INSERT INTO authors (name) VALUES ('Mary Shelley') RETURNING id
), lang AS (
  SELECT id FROM languages WHERE code = 'en'
)
INSERT INTO books (title, description, author_id, language_id, published_year, isbn, rights_status, is_featured)
SELECT 'Pride and Prejudice',
       'Elizabeth Bennet navigates courtship, class, and first impressions in Regency England.',
       a1.id, lang.id, 1813, '9781403528804', 'public_domain', true
FROM a1, lang
UNION ALL
SELECT 'Frankenstein',
       'Victor Frankenstein creates a being he cannot love, and cannot escape.',
       a2.id, lang.id, 1818, '9780141439472', 'public_domain', true
FROM a2, lang;

-- Attach categories
INSERT INTO book_categories (book_id, category_id)
SELECT b.id, c.id FROM books b, categories c
WHERE b.title = 'Pride and Prejudice' AND c.slug IN ('fiction', 'classic-literature');

INSERT INTO book_categories (book_id, category_id)
SELECT b.id, c.id FROM books b, categories c
WHERE b.title = 'Frankenstein' AND c.slug IN ('fiction', 'classic-literature', 'science');
