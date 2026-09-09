const fs = require("fs/promises");
const path = require("path");
const AdmZip = require("adm-zip");
const xml2js = require("xml2js");
const { PDFParse } = require("pdf-parse");

function cleanText(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section|article|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeTitleFromPath(filePath, index) {
  const base = path
    .basename(filePath, path.extname(filePath))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return base || `Chapter ${index + 1}`;
}

function splitTextIntoChapters(text) {
  const normalized = String(text || "").replace(/\r/g, "").trim();

  if (!normalized) {
    throw new Error("The uploaded file contains no readable text.");
  }

  const lines = normalized.split("\n");

  const chapterRegex =
    /^\s*(chapter|chap\.|part)\s+([ivxlcdm]+|\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b[.: -]*(.*)$/i;

  const starts = [];

  lines.forEach((line, index) => {
    if (chapterRegex.test(line)) {
      starts.push(index);
    }
  });

  if (starts.length === 0) {
    return [
      {
        chapterNumber: 1,
        title: "Full text",
        content: normalized,
      },
    ];
  }

  const chapters = [];

  starts.forEach((start, i) => {
    const end = starts[i + 1] ?? lines.length;

    const heading = lines[start].trim();

    const content = lines
      .slice(start + 1, end)
      .join("\n")
      .trim();

    if (content) {
      chapters.push({
        chapterNumber: i + 1,
        title: heading,
        content,
      });
    }
  });

  if (!chapters.length) {
    return [
      {
        chapterNumber: 1,
        title: "Full text",
        content: normalized,
      },
    ];
  }

  return chapters;
}

async function parseTxt(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  return splitTextIntoChapters(text);
}

async function parsePdf(filePath) {
  const buffer = await fs.readFile(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    return splitTextIntoChapters(result.text);
  } finally {
    await parser.destroy();
  }
}

async function parseEpub(filePath) {
  const zip = new AdmZip(filePath);

  const containerEntry = zip.getEntry("META-INF/container.xml");

  if (!containerEntry) {
    throw new Error(
      "Invalid EPUB: META-INF/container.xml is missing."
    );
  }

  const container = await xml2js.parseStringPromise(
    containerEntry.getData().toString("utf8")
  );

  const rootfile =
    container?.container?.rootfiles?.[0]?.rootfile?.[0]?.$?.[
      "full-path"
    ];

  if (!rootfile) {
    throw new Error(
      "Invalid EPUB: OPF package file was not found."
    );
  }

  const opfEntry = zip.getEntry(rootfile);

  if (!opfEntry) {
    throw new Error(
      "Invalid EPUB: OPF package file is missing."
    );
  }

  const opf = await xml2js.parseStringPromise(
    opfEntry.getData().toString("utf8")
  );

  const pkg = opf.package || opf["opf:package"];

  if (!pkg) {
    throw new Error(
      "Unsupported EPUB package format."
    );
  }

  const manifestItems = {};

  const manifest =
    pkg.manifest?.[0]?.item ||
    pkg["opf:manifest"]?.[0]?.["opf:item"] ||
    [];

  for (const item of manifest) {
    const attrs = item.$ || {};

    manifestItems[attrs.id] = {
      href: attrs.href,
      mediaType: attrs["media-type"],
      properties: attrs.properties || "",
    };
  }

  const spine =
    pkg.spine?.[0]?.itemref ||
    pkg["opf:spine"]?.[0]?.["opf:itemref"] ||
    [];

  const opfDir = path.posix.dirname(rootfile);

  const chapters = [];

  for (let i = 0; i < spine.length; i++) {
    const idref = spine[i].$?.idref;

    const item = manifestItems[idref];

    if (!item || !item.href) continue;

    const href = decodeURIComponent(
      item.href.split("#")[0]
    );

    const fullPath = path.posix.normalize(
      path.posix.join(opfDir, href)
    );

    const entry = zip.getEntry(fullPath);

    if (!entry) continue;

    const html = entry.getData().toString("utf8");

    const titleMatch =
      html.match(
        /<title[^>]*>([\s\S]*?)<\/title>/i
      ) ||
      html.match(
        /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i
      );

    const title =
      cleanText(
        titleMatch ? titleMatch[1] : ""
      ) || makeTitleFromPath(href, i);

    const content = cleanText(html);

    if (content) {
      chapters.push({
        chapterNumber: chapters.length + 1,
        title,
        content,
      });
    }
  }

  if (!chapters.length) {
    throw new Error(
      "No readable chapters were found in this EPUB."
    );
  }

  return chapters;
}

async function parseBook(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt") {
    return parseTxt(filePath);
  }

  if (ext === ".pdf") {
    return parsePdf(filePath);
  }

  if (ext === ".epub") {
    return parseEpub(filePath);
  }

  throw new Error(
    "Unsupported book format. Use PDF, EPUB, or TXT."
  );
}

module.exports = {
  parseBook,
};