import fs from "node:fs";
import path from "node:path";

const EXPORT_DIR = path.resolve("telegram-export");
const RESULT_JSON = path.join(EXPORT_DIR, "result.json");
const PHOTOS_DIR = path.join(EXPORT_DIR, "photos");
const POSTS_DIR = path.resolve("posts");
const IMAGES_DIR = path.resolve("public/images");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function parseTelegramDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().split("T")[0];
}

function findPhoto(messages, msg) {
  if (msg.photo) return msg.photo;
  // Если в посте несколько сообщений подряд, ищем фото в соседних
  if (msg.grouped_id) {
    const sibling = messages.find(
      (m) => m.grouped_id === msg.grouped_id && m.photo && m.id !== msg.id,
    );
    if (sibling) return sibling.photo;
  }
  return null;
}

function copyHeroImage(photo, slug, date) {
  if (!photo) return null;
  const srcName = path.basename(photo);
  const srcPath = path.join(PHOTOS_DIR, srcName);
  if (!fs.existsSync(srcPath)) return null;

  const ext = path.extname(srcName) || ".jpg";
  const destName = `${date}_${slug}_hero${ext}`;
  const destPath = path.join(IMAGES_DIR, destName);

  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  return `/images/${destName}`;
}

function extractLinks(text) {
  const urlRegex = /https?:\/\/[^\s)<>]+/g;
  return text.match(urlRegex) || [];
}

function run() {
  if (!fs.existsSync(RESULT_JSON)) {
    console.error(`Telegram export not found: ${RESULT_JSON}`);
    console.error(
      "See docs/2026-07-02_telegram-export-guide.md for export instructions.",
    );
    process.exit(1);
  }

  const exportData = JSON.parse(fs.readFileSync(RESULT_JSON, "utf-8"));
  const messages = exportData.messages || [];

  const textMessages = messages.filter(
    (m) => m.type === "message" && m.text && String(m.text).trim().length > 50,
  );

  fs.mkdirSync(POSTS_DIR, { recursive: true });

  let created = 0;
  let skipped = 0;

  for (const msg of textMessages) {
    const rawText =
      typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text);
    const cleanText = rawText.replace(/\n{3,}/g, "\n\n").trim();
    if (cleanText.length < 100) {
      skipped++;
      continue;
    }

    const date = parseTelegramDate(msg.date_unixtime || msg.date);
    const title = cleanText.split("\n")[0].slice(0, 100);
    const slug = slugify(title);
    const fileName = `${date}_${slug}_post.json`;
    const filePath = path.join(POSTS_DIR, fileName);

    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    const photo = findPhoto(messages, msg);
    const image = photo ? copyHeroImage(photo, slug, date) : null;

    const links = extractLinks(cleanText);
    const sourceUrl = links[0] || null;

    const post = {
      schema_version: "social-content/v1",
      source: {
        title,
        url: sourceUrl,
        published_at: date,
      },
      content: {
        telegram: cleanText,
      },
      image: image
        ? {
            local_path: image,
            generated_at: date,
            format: path.extname(image).slice(1),
          }
        : null,
      tags: [],
    };

    fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
    created++;
  }

  console.log(`Created ${created} posts, skipped ${skipped}.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
