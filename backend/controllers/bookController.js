const { pool } = require("../config/database");
const fs = require("fs/promises");
const path = require("path");
const bookModel = require("../models/bookModel");

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


// ======================================================
// LIST BOOKS
// ======================================================

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


// ======================================================
// GET ONE BOOK
// ======================================================

async function getBook(req, res, next) {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({
        error: "Invalid book id.",
      });
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


// ======================================================
// FEATURED BOOKS
// ======================================================

async function getFeatured(req, res, next) {
  try {
    res.json({
      books: await bookModel.listFeatured(),
    });
  } catch (err) {
    next(err);
  }
}


// ======================================================
// POPULAR BOOKS
// ======================================================

async function getPopular(req, res, next) {
  try {
    res.json({
      books: await bookModel.listPopular(),
    });
  } catch (err) {
    next(err);
  }
}


// ======================================================
// RECENT BOOKS
// ======================================================

async function getRecent(req, res, next) {
  try {
    res.json({
      books: await bookModel.listRecentlyAdded(),
    });
  } catch (err) {
    next(err);
  }
}


// ======================================================
// CREATE BOOK
// ======================================================

async function createBook(req, res, next) {
  try {
    // NOTE: Add an admin-only auth check here before production.
    const book = await bookModel.createBook(req.body);
    res.status(201).json({ book });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// UPLOAD COMPLETE BOOK
// IMPORTANT: the uploaded PDF / EPUB / TXT is NOT parsed,
// split, rewritten, or converted. The original file is kept.
// ======================================================

async function uploadBook(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a book file.",
      });
    }

    const book = await bookModel.createBookWithFile(
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
      {
        fileUrl: `/uploads/books/${req.file.filename}`,
        format: req.file.mimetype === "application/pdf"
          ? "pdf"
          : path.extname(req.file.originalname).toLowerCase().replace(".", ""),
        sizeBytes: req.file.size,
      }
    );

    res.status(201).json({
      message: "Book uploaded successfully. Original file was saved unchanged.",
      book,
      file: {
        url: `/uploads/books/${req.file.filename}`,
        format: req.file.mimetype === "application/pdf"
          ? "pdf"
          : path.extname(req.file.originalname).toLowerCase().replace(".", ""),
        sizeBytes: req.file.size,
      },
    });
  } catch (err) {
    console.error("UPLOAD BOOK ERROR:", err);

    // If database saving failed, remove the uploaded file.
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (fileError) {
        console.error(
          "Could not remove failed upload:",
          fileError.message
        );
      }
    }

    next(err);
  }
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  listBooks,
  getBook,
  getFeatured,
  getPopular,
  getRecent,
  createBook,
  uploadBook,

};