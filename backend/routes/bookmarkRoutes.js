const express = require("express");

const {
  getBookmarks,
  createBookmark,
  deleteBookmark,
} = require("../controllers/bookmarkController");

const {
  requireAuth,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/:id/bookmarks",
  requireAuth,
  getBookmarks
);

router.post(
  "/:id/bookmarks",
  requireAuth,
  createBookmark
);

router.delete(
  "/:id/bookmarks",
  requireAuth,
  deleteBookmark
);

module.exports = router;