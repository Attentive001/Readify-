const express = require("express");
const bookModel = require("../models/bookModel");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { q, category, language, page, pageSize } = req.query;
    const books = await bookModel.searchBooks({
      q,
      categorySlug: category,
      languageCode: language,
      page: Number(page) || 1,
      pageSize: Math.min(Number(pageSize) || 20, 100),
    });
    res.json({ query: q || null, results: books });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
