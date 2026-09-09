const express = require("express");
const libraryController = require("../controllers/libraryController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireAuth);

router.get("/", libraryController.getLibrary);
router.post("/:bookId", libraryController.addToLibrary);
router.delete("/:bookId", libraryController.removeFromLibrary);

module.exports = router;
