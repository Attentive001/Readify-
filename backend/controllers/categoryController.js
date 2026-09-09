const categoryModel = require("../models/categoryModel");
const bookModel = require("../models/bookModel");

async function listCategories(req, res, next) {
  try {
    res.json({ categories: await categoryModel.listCategories() });
  } catch (err) {
    next(err);
  }
}

async function getCategoryBooks(req, res, next) {
  try {
    const category = await categoryModel.findCategoryBySlug(req.params.slug || req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found." });

    const books = await bookModel.searchBooks({
      categorySlug: category.slug,
      page: Number(req.query.page) || 1,
      pageSize: Math.min(Number(req.query.pageSize) || 20, 100),
    });
    res.json({ category, books });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, getCategoryBooks };
