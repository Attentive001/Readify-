const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/", categoryController.listCategories);
router.get("/:slug/books", categoryController.getCategoryBooks);

module.exports = router;
