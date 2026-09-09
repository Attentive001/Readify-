const chapterModel = require("../models/chapterModel");

function parseChapterNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function validateChapterInput(body) {
  const chapterNumber = parseChapterNumber(body.chapterNumber);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!chapterNumber || !title || !content) {
    return { error: "chapterNumber must be a positive integer, and title and content are required." };
  }

  return { value: { chapterNumber, title, content } };
}

async function listChapters(req, res, next) {
  try {
    const chapters = await chapterModel.getChaptersByBookId(req.params.id);
    res.json({ chapters, total: chapters.length });
  } catch (err) {
    next(err);
  }
}

async function getChapter(req, res, next) {
  try {
    const chapter = await chapterModel.getChapterById(req.params.id, req.params.chapterId);
    if (!chapter) return res.status(404).json({ error: "Chapter not found." });
    res.json({ chapter });
  } catch (err) {
    next(err);
  }
}

async function createChapter(req, res, next) {
  try {
    const result = validateChapterInput(req.body);
    if (result.error) return res.status(400).json({ error: result.error });

    const chapter = await chapterModel.createChapter(req.params.id, result.value);
    res.status(201).json({ chapter });
  } catch (err) {
    next(err);
  }
}

async function createChapters(req, res, next) {
  try {
    if (!Array.isArray(req.body.chapters) || req.body.chapters.length === 0) {
      return res.status(400).json({ error: "chapters must be a non-empty array." });
    }

    const chapters = [];
    for (const chapter of req.body.chapters) {
      const result = validateChapterInput(chapter || {});
      if (result.error) return res.status(400).json({ error: result.error });
      chapters.push(result.value);
    }

    const numbers = chapters.map((chapter) => chapter.chapterNumber);
    if (new Set(numbers).size !== numbers.length) {
      return res.status(400).json({ error: "chapterNumber values must be unique." });
    }

    const created = await chapterModel.createChapters(req.params.id, chapters);
    res.status(201).json({ chapters: created, total: created.length });
  } catch (err) {
    next(err);
  }
}

async function updateChapter(req, res, next) {
  try {
    const body = req.body || {};
    const chapterNumber = body.chapterNumber === undefined ? undefined : parseChapterNumber(body.chapterNumber);
    const title = body.title === undefined ? undefined : (typeof body.title === "string" ? body.title.trim() : "");
    const content = body.content === undefined ? undefined : (typeof body.content === "string" ? body.content.trim() : "");

    if (chapterNumber === null || title === "" || content === "") {
      return res.status(400).json({ error: "Invalid chapterNumber, title, or content." });
    }

    if (chapterNumber === undefined && title === undefined && content === undefined) {
      return res.status(400).json({ error: "Provide at least one field to update." });
    }

    const chapter = await chapterModel.updateChapter(req.params.id, req.params.chapterId, {
      chapterNumber,
      title,
      content,
    });

    if (!chapter) return res.status(404).json({ error: "Chapter not found." });
    res.json({ chapter });
  } catch (err) {
    next(err);
  }
}

async function deleteChapter(req, res, next) {
  try {
    const deleted = await chapterModel.deleteChapter(req.params.id, req.params.chapterId);
    if (!deleted) return res.status(404).json({ error: "Chapter not found." });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listChapters,
  getChapter,
  createChapter,
  createChapters,
  updateChapter,
  deleteChapter,
};
