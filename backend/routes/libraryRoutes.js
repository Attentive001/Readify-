const express = require("express");

const {
  getLibrary,
  addToLibrary,
  removeFromLibrary,
} = require("../controllers/libraryController");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, getLibrary);

router.post("/:bookId", requireAuth, addToLibrary);

router.delete("/:bookId", requireAuth, removeFromLibrary);

module.exports = router;