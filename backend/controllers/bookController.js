const fs = require("fs/promises");
const { pool } = require("../config/database");
const bookModel = require("../models/bookModel");
const chapterModel = require("../models/chapterModel");
const { parseBook } = require("../services/bookParser");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function listBooks(req, res, next) {
  try {
    const { q, category, language, year, page, pageSize } = req.query;

    const dbInfo = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_schema() AS schema_name,
        (SELECT COUNT(*) FROM books) AS books_count
    `);

    console.log("========== READIFY DATABASE CHECK ==========");
    console.log(dbInfo.rows[0]);
    console.log("============================================");

    const result = await bookModel.searchBooks({
      q,
      categorySlug: category,
      languageCode: language,
      year,
      page: Number(page) || 1,
      pageSize: Math.min(Number(pageSize) || 20, 100),
    });

    res.json({
      books: result.books,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}
async function getBook(req, res, next) {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ error: "Invalid book id." });
    }

    const book = await bookModel.findBookById(req.params.id);

    if (!book) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    res.json({ book });
  } catch (err) {
    next(err);
  }
}

async function getFeatured(req, res, next) {
  try {
    res.json({
      books: await bookModel.listFeatured(),
    });
  } catch (err) {
    next(err);
  }
}

async function getPopular(req, res, next) {
  try {
    res.json({
      books: await bookModel.listPopular(),
    });
  } catch (err) {
    next(err);
  }
}

async function getRecent(req, res, next) {
  try {
    res.json({
      books: await bookModel.listRecentlyAdded(),
    });
  } catch (err) {
    next(err);
  }
}

async function createBook(req, res, next) {
  try {
    // NOTE: add an admin-only auth check here before exposing this in production.
    const book = await bookModel.createBook(req.body);

    res.status(201).json({ book });
  } catch (err) {
    next(err);
  }
}

/**
 * Upload a complete book and save all chapters.
 *
 * Expected multipart/form-data:
 *
 * book          -> PDF / EPUB / TXT
 * title         -> Book title
 *authorName description   -> Description
 *       -> Author UUID
 * languageId    -> Language UUID
 * publishedYear -> Published year
 * isbn          -> ISBN
 * coverUrl      -> Optional cover URL
 * sourceUrl     -> Optional source URL
 * rightsStatus  -> public_domain / licensed / unknown
 */
async function uploadBook(req, res, next) {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a book file.",
      });
    }

    uploadedFilePath = req.file.path;

    // Parse PDF / EPUB / TXT
    const chapters = await parseBook(uploadedFilePath);

    if (!chapters || chapters.length === 0) {
      return res.status(400).json({
        error: "No readable chapters were found in the uploaded book.",
      });
    }

    // IMPORTANT:
    // authorName and languageCode come from the upload form.
    // The model will resolve them to UUIDs.
   const book = await bookModel.createBookWithChapters(
  {
    title: req.body.title || req.file.originalname,
    description: req.body.description || null,

    authorName: req.body.authorName || null,

    languageCode: req.body.languageCode || null,
    languageName: req.body.languageName || null,

    publishedYear: req.body.publishedYear
      ? Number(req.body.publishedYear)
      : null,

    isbn: req.body.isbn || null,
    coverUrl: req.body.coverUrl || null,
    sourceUrl: req.body.sourceUrl || null,
    rightsStatus: req.body.rightsStatus || "unknown",

    categories: req.body.categories || "",
  },
  chapters
);

    res.status(201).json({
      message: "Book uploaded successfully.",
      book,
      chapters: {
        total: chapters.length,
        items: chapters.map((chapter) => ({
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
        })),
      },
    });
  } catch (err) {
    console.error("UPLOAD BOOK ERROR:", err);
    next(err);
  } finally {
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (fileError) {
        console.error(
          "Could not remove uploaded file:",
          fileError.message
        );
      }
    }
  }
}
async function getChapters(req, res, next) {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ error: "Invalid book id." });
    }

    const book = await bookModel.findBookById(req.params.id);

    if (!book) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    const chapters = await chapterModel.getChaptersByBookId(req.params.id);

    res.json({
      chapters,
      total: chapters.length,
    });
  } catch (err) {
    console.error("Get chapters error:", err);

    next(err);
  }
}

module.exports = {
  listBooks,
  getBook,
  getFeatured,
  getPopular,
  getRecent,
  createBook,
  uploadBook,
  getChapters,
};