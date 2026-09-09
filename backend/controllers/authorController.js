const authorModel = require("../models/authorModel");

async function listAuthors(req, res, next) {
  try {
    res.json({ authors: await authorModel.listAuthors(req.query) });
  } catch (err) {
    next(err);
  }
}

async function getAuthor(req, res, next) {
  try {
    const author = await authorModel.findAuthorById(req.params.id);
    if (!author) return res.status(404).json({ error: "Author not found." });
    res.json({ author });
  } catch (err) {
    next(err);
  }
}

async function getAuthorBooks(req, res, next) {
  try {
    res.json({ books: await authorModel.listBooksByAuthor(req.params.id) });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuthors, getAuthor, getAuthorBooks };
