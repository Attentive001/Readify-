const express = require("express");
const authorController = require("../controllers/authorController");

const router = express.Router();

router.get("/", authorController.listAuthors);
router.get("/:id", authorController.getAuthor);
router.get("/:id/books", authorController.getAuthorBooks);

module.exports = router;
