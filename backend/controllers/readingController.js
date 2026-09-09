const progressModel = require("../models/progressModel");
const bookmarkModel = require("../models/bookmarkModel");

async function getProgress(req, res, next) {
  try {
    const progress = await progressModel.getProgress(req.user.id, req.params.id);
    res.json({ progress });
  } catch (err) {
    next(err);
  }
}

async function updateProgress(req, res, next) {
  try {
    const { percent, location } = req.body;
    const progress = await progressModel.upsertProgress(req.user.id, req.params.id, { percent, location });
    await progressModel.recordHistory(req.user.id, req.params.id);
    res.json({ progress });
  } catch (err) {
    next(err);
  }
}

async function listBookmarks(req, res, next) {
  try {
    res.json({ bookmarks: await bookmarkModel.listBookmarks(req.user.id, req.params.id) });
  } catch (err) {
    next(err);
  }
}

async function addBookmark(req, res, next) {
  try {
    const bookmark = await bookmarkModel.addBookmark(req.user.id, req.params.id, req.body);
    res.status(201).json({ bookmark });
  } catch (err) {
    next(err);
  }
}

async function removeBookmark(req, res, next) {
  try {
    await bookmarkModel.removeBookmark(req.user.id, req.params.id, req.body.location);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProgress, updateProgress, listBookmarks, addBookmark, removeBookmark };
