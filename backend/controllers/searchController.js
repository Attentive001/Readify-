const bookModel = require("../models/bookModel");

async function search(req, res, next) {
  try {
    const {
      q = "",
      category,
      language,
      year,
      page = 1,
      pageSize = 20,
    } = req.query;

    const result =
      await bookModel.searchBooks({
        q,
        categorySlug: category || null,
        language: language || null,
        year: year || null,
        page: Math.max(
          1,
          Number(page) || 1
        ),
        pageSize: Math.min(
          100,
          Math.max(
            1,
            Number(pageSize) || 20
          )
        ),
      });

    res.json({
      results: result.books,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  search,
};