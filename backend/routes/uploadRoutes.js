const express = require("express");
const { uploadBookFile } = require("../middleware/uploadMiddleware");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

// Local MVP: upload is open. Protect this route with requireAuth + an admin role
// before deploying to production.
router.post("/book", uploadBookFile, uploadController.upload);

module.exports = router;
