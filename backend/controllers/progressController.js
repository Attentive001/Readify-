const progressModel = require("../models/progressModel");
const bookModel = require("../models/bookModel");

async function getProgress(req, res, next) {
  try {
    const { id: bookId } = req.params;
    const userId = req.user.id;

    const book = await bookModel.findBookById(bookId);

    if (!book) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    const progress = await progressModel.getProgress(
      userId,
      bookId
    );

    res.json({
      progress: progress || {
        percent: 0,
        location: null,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function saveProgress(req, res, next) {
  try {
    const { id: bookId } = req.params;
    const userId = req.user.id;

    const { percent, location } = req.body;

    if (
      typeof percent !== "number" ||
      percent < 0 ||
      percent > 100
    ) {
      return res.status(400).json({
        error: "Percent must be a number between 0 and 100.",
      });
    }

    const book = await bookModel.findBookById(bookId);

    if (!book) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    const progress = await progressModel.upsertProgress(
      userId,
      bookId,
      {
        percent,
        location: location || null,
      }
    );

    res.json({
      message: "Reading progress saved.",
      progress,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProgress,
  saveProgress,
};