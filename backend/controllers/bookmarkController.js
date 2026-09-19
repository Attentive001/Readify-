const bookmarkModel = require("../models/bookmarkModel");
const bookModel = require("../models/bookModel");

async function getBookmarks(req, res, next) {
  try {
    const userId = req.user.id;
    const bookId = req.params.id;

    const book = await bookModel.findBookById(bookId);

    if (!book) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    const bookmarks =
      await bookmarkModel.listBookmarks(
        userId,
        bookId
      );

    res.json({
      bookmarks,
    });
  } catch (error) {
    next(error);
  }
}

async function createBookmark(req, res, next) {
  try {
    const userId = req.user.id;
    const bookId = req.params.id;

    const {
      location,
      note,
    } = req.body;

    if (
      !location ||
      typeof location !== "string"
    ) {
      return res.status(400).json({
        error: "Bookmark location is required.",
      });
    }

    const book = await bookModel.findBookById(bookId);

    if (!book) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    const bookmark =
      await bookmarkModel.addBookmark(
        userId,
        bookId,
        {
          location: location.trim(),
          note,
        }
      );

    res.status(201).json({
      message: "Bookmark saved.",
      bookmark,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteBookmark(req, res, next) {
  try {
    const userId = req.user.id;
    const bookId = req.params.id;

    const location =
      req.body?.location ||
      req.query?.location;

    if (!location) {
      return res.status(400).json({
        error: "Bookmark location is required.",
      });
    }

    const book = await bookModel.findBookById(bookId);

    if (!book) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    await bookmarkModel.removeBookmark(
      userId,
      bookId,
      location
    );

    res.json({
      message: "Bookmark removed.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBookmarks,
  createBookmark,
  deleteBookmark,
};