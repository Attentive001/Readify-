const fs = require("fs/promises");
const bookModel = require("../models/bookModel");
const chapterModel = require("../models/chapterModel");
const { parseBook } = require("../services/bookParser");

async function listBooks(req, res, next) {
  try {
    const { q, category, language, page, pageSize } = req.query;

    const books = await bookModel.searchBooks({
      q,
      categorySlug: category,
      languageCode: language,
      page: Number(page) || 1,
      pageSize: Math.min(Number(pageSize) || 20, 100),
    });

    res.json({
      books,
      page: Number(page) || 1,
    });
  } catch (err) {
    next(err);
  }
}

async function getBook(req, res, next) {
  try {
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