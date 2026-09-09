const express = require("express");
const chapterController = require("../controllers/chapterController");

const router = express.Router();

// Public reading endpoints: users can read available book content without login.
router.get("/", chapterController.listChapters);
router.get("/:chapterId", chapterController.getChapter);

// Content-management endpoints. Add admin/staff authorization before production use.
router.post("/", chapterController.createChapter);
router.post("/bulk", chapterController.createChapters);
router.patch("/:chapterId", chapterController.updateChapter);
router.delete("/:chapterId", chapterController.deleteChapter);

module.exports = router;
