const express = require("express");

const bookModel = require("../models/bookModel");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const {
      q,
      category,
      language,
      page,
      pageSize,
    } = req.query;

    const result = await bookModel.searchBooks({
      q: q || "",
      categorySlug: category || null,
      languageCode: language || null,
      page: Number(page) || 1,
      pageSize: Math.min(
        Number(pageSize) || 20,
        100
      ),
    });

    res.json({
      query: q || null,
      results: result.books,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;