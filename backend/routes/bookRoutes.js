const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bookController = require("../controllers/bookController");

const router = express.Router();

// Make sure the uploads/books directory exists
const uploadDir = path.join(__dirname, "../uploads/books");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Store uploaded books on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, "-");

    const uniqueName = `${Date.now()}-${safeName}`;

    cb(null, uniqueName);
  },
});

// Upload configuration
const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".epub", ".txt"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowed.includes(extension)) {
      return cb(
        new Error("Only PDF, EPUB, and TXT files are allowed.")
      );
    }

    cb(null, true);
  },
});

// Public book endpoints
router.get("/featured", bookController.getFeatured);
router.get("/popular", bookController.getPopular);
router.get("/recent", bookController.getRecent);
router.get("/:id/chapters", bookController.getChapters);
router.get("/", bookController.listBooks);

// IMPORTANT: upload must come before /:id
router.post(
  "/upload",
  upload.single("book"),
  bookController.uploadBook
);

router.post("/", bookController.createBook);

router.get("/:id", bookController.getBook);

module.exports = router;