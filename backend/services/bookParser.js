const fs = require("fs/promises");
const path = require("path");
const AdmZip = require("adm-zip");
const xml2js = require("xml2js");
const { PDFParse } = require("pdf-parse");

function cleanText(value) {
  return String(value || "")
    .replace(/\u0000/g, "")
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
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
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
  const normalized = String(text || "")
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .trim();

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

    const heading = lines[start]
      .replace(/\u0000/g, "")
      .trim();

    const content = lines
      .slice(start + 1, end)
      .join("\n")
      .replace(/\u0000/g, "")
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

/*
 * Convert EPUB HTML while KEEPING images.
 */
function cleanEpubHtml(html, imageMap) {
  let content = String(html || "")
    .replace(/\u0000/g, "");

  /*
   * Remove scripts and styles.
   */
  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  /*
   * Replace image src values with our local image URLs.
   */
  content = content.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*)(["'])([^"']+)(\2)/gi,
    (match, prefix, quote, src) => {
      const cleanSrc = decodeURIComponent(src.split("#")[0]);

      const localSrc = imageMap[cleanSrc];

      if (!localSrc) {
        return match;
      }

      return `${prefix}${quote}${localSrc}${quote}`;
    }
  );

  /*
   * Keep image tags.
   */
  content = content.replace(
    /<img\b([^>]*)>/gi,
    (match, attrs) => {
      const srcMatch = attrs.match(
        /\bsrc\s*=\s*["']([^"']+)["']/i
      );

      if (!srcMatch) {
        return "";
      }

      const src = srcMatch[1];

      return `<img src="${src}" alt="" style="max-width:100%;height:auto;" />`;
    }
  );

  /*
   * Remove all other HTML tags but preserve images.
   */
  const images = [];

  content = content.replace(
    /<img\b[^>]*>/gi,
    (img) => {
      const marker = `___READIFY_IMAGE_${images.length}___`;

      images.push(img);

      return `\n${marker}\n`;
    }
  );

  content = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section|article|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  /*
   * Put images back.
   */
  images.forEach((img, index) => {
    const marker = `___READIFY_IMAGE_${index}___`;

    content = content.replace(
      marker,
      img
    );
  });

  return content;
}

async function parseEpub(filePath) {
  const zip = new AdmZip(filePath);

  const containerEntry = zip.getEntry(
    "META-INF/container.xml"
  );

  if (!containerEntry) {
    throw new Error(
      "Invalid EPUB: META-INF/container.xml is missing."
    );
  }

  const container =
    await xml2js.parseStringPromise(
      containerEntry
        .getData()
        .toString("utf8")
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

  const opf =
    await xml2js.parseStringPromise(
      opfEntry
        .getData()
        .toString("utf8")
    );

  const pkg =
    opf.package ||
    opf["opf:package"];

  if (!pkg) {
    throw new Error(
      "Unsupported EPUB package format."
    );
  }

  /*
   * ==========================
   * MANIFEST
   * ==========================
   */

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

  /*
   * ==========================
   * EPUB IMAGES
   * ==========================
   */

  const bookId =
    path.basename(
      filePath,
      path.extname(filePath)
    ) + "-" + Date.now();

  const uploadRoot = path.join(
    __dirname,
    "..",
    "public",
    "book-images",
    bookId
  );

  await fs.mkdir(uploadRoot, {
    recursive: true,
  });

  const imageMap = {};

  for (const item of Object.values(manifestItems)) {
    if (
      !item.href ||
      !item.mediaType ||
      !item.mediaType.startsWith("image/")
    ) {
      continue;
    }

    const imageHref = decodeURIComponent(
      item.href.split("#")[0]
    );

    const imagePath = path.posix.normalize(
      path.posix.join(
        path.posix.dirname(rootfile),
        imageHref
      )
    );

    const imageEntry =
      zip.getEntry(imagePath);

    if (!imageEntry) {
      continue;
    }

    const extension =
      path.extname(imageHref) ||
      ".jpg";

    const imageName =
      `${Object.keys(imageMap).length + 1}${extension}`;

    const outputPath =
      path.join(uploadRoot, imageName);

    await fs.writeFile(
      outputPath,
      imageEntry.getData()
    );

    /*
     * URL used by frontend.
     */
    const publicUrl =
      `/book-images/${bookId}/${imageName}`;

    /*
     * Save both original href and normalized path.
     */
    imageMap[imageHref] = publicUrl;
    imageMap[
      path.posix.basename(imageHref)
    ] = publicUrl;
  }

  /*
   * ==========================
   * SPINE
   * ==========================
   */

  const spine =
    pkg.spine?.[0]?.itemref ||
    pkg["opf:spine"]?.[0]?.["opf:itemref"] ||
    [];

  const opfDir =
    path.posix.dirname(rootfile);

  const chapters = [];

  for (
    let i = 0;
    i < spine.length;
    i++
  ) {
    const idref =
      spine[i].$?.idref;

    const item =
      manifestItems[idref];

    if (!item || !item.href) {
      continue;
    }

    const href =
      decodeURIComponent(
        item.href.split("#")[0]
      );

    const fullPath =
      path.posix.normalize(
        path.posix.join(
          opfDir,
          href
        )
      );

    const entry =
      zip.getEntry(fullPath);

    if (!entry) {
      continue;
    }

    const html =
      entry
        .getData()
        .toString("utf8");

    /*
     * Get title before cleaning HTML.
     */
    const titleMatch =
      html.match(
        /<title[^>]*>([\s\S]*?)<\/title>/i
      ) ||
      html.match(
        /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i
      );

    const title =
      cleanText(
        titleMatch
          ? titleMatch[1]
          : ""
      ) ||
      makeTitleFromPath(
        href,
        i
      );

    /*
     * Keep images inside content.
     */
    const content =
      cleanEpubHtml(
        html,
        imageMap
      );

    if (content) {
      chapters.push({
        chapterNumber:
          chapters.length + 1,
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
  const ext =
    path.extname(filePath).toLowerCase();

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