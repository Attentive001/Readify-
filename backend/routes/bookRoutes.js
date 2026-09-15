const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bookController = require("../controllers/bookController");

const router = express.Router();

// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDir = path.join(__dirname, "../uploads/books");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// ======================================================
// MULTER STORAGE
// ======================================================

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


// ======================================================
// UPLOAD CONFIGURATION
// ======================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".epub", ".txt"];

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    if (!allowed.includes(extension)) {
      return cb(
        new Error(
          "Only PDF, EPUB, and TXT files are allowed."
        )
      );
    }

    cb(null, true);
  },
});


// ======================================================
// PUBLIC BOOK ENDPOINTS
// ======================================================

router.get(
  "/featured",
  bookController.getFeatured
);

router.get(
  "/popular",
  bookController.getPopular
);

router.get(
  "/recent",
  bookController.getRecent
);


// ======================================================
// LIST BOOKS
// ======================================================

router.get(
  "/",
  bookController.listBooks
);


// ======================================================
// UPLOAD COMPLETE BOOK
// IMPORTANT: /upload must be before /:id
// ======================================================

router.post(
  "/upload",
  upload.single("book"),
  bookController.uploadBook
);


// ======================================================
// CREATE BOOK
// ======================================================

router.post(
  "/",
  bookController.createBook
);


// ======================================================
// GET ONE BOOK
// IMPORTANT: keep this LAST
// ======================================================

router.get(
  "/:id",
  bookController.getBook
);


module.exports = router;