const { uploadBook } = require("../services/uploadService");

async function upload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Book file is required. Use PDF, EPUB, or TXT." });
    }
    if (!req.body.title?.trim()) {
      return res.status(400).json({ error: "Book title is required." });
    }

    const result = await uploadBook({
      metadata: req.body,
      file: req.file,
    });

    res.status(201).json({
      message: "Book uploaded successfully. Original file was saved unchanged.",
      book: result,
    });
  } catch (err) {
    if (req.file) {
      const fs = require("fs");
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

module.exports = { upload };
