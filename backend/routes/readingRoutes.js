const express = require("express");
const readingController = require("../controllers/readingController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireAuth);

router.get("/:id/progress", readingController.getProgress);
router.patch("/:id/progress", readingController.updateProgress);
router.get("/:id/bookmarks", readingController.listBookmarks);
router.post("/:id/bookmarks", readingController.addBookmark);
router.delete("/:id/bookmarks", readingController.removeBookmark);

module.exports = router;
