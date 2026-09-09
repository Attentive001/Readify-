require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const authorRoutes = require("./routes/authorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const searchRoutes = require("./routes/searchRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const readingRoutes = require("./routes/readingRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

const v1 = express.Router();
v1.use("/auth", authRoutes);
v1.use("/books", bookRoutes);
v1.use("/books/:id/chapters", chapterRoutes);
v1.use("/authors", authorRoutes);
v1.use("/categories", categoryRoutes);
v1.use("/search", searchRoutes);
v1.use("/library", libraryRoutes);
v1.use("/books", readingRoutes); // adds /:id/progress and /:id/bookmarks under /books
app.use("/api/v1", v1);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Readify API listening on http://localhost:${port}`);
});
