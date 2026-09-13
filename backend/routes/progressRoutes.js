const express = require("express");

const {
  getProgress,
  saveProgress,
} = require("../controllers/progressController");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/:id/progress",
  requireAuth,
  getProgress
);

router.post(
  "/:id/progress",
  requireAuth,
  saveProgress
);

module.exports = router;