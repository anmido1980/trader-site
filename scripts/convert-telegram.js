import fs from "node:fs";
import path from "node:path";

const EXPORT_DIR = path.resolve("telegram-export");
const RESULT_JSON = path.join(EXPORT_DIR, "result.json");
const PHOTOS_DIR = path.join(EXPORT_DIR, "photos");
const POSTS_DIR = path.resolve("posts");
const IMAGES_DIR = path.resolve("public/images");

const KEYWORDS = {
  акции: "акции",
  облигации: "облигации",
  фьючерсы: "фьючерсы",
  опционы: "опционы",
  портфель: "портфель",
  дивиденды: "дивиденды",
  купоны: "купоны",
  кризис: "кризис",
  страхование: "страхование",
  недвижимость: "недвижимость",
  инфляция: "инфляция",
  доллар: "валюта",
  евро: "валюта",
  золото: "золото",
  пиф: "фонды",
  etf: "фонды",
  брокер: "брокер",
  иис: "брокер",
  налог: "налоги",
  ндфл: "налоги",
  торговля: "трейдинг",
  робот: "алготрейдинг",
  moex: "биржа",
  мосбиржа: "биржа",
  сбер: "сбер",
  газпром: "газпром",
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/-+/g, "-")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50)
    .replace(/-$/, "");
}

function parseTelegramDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().split("T")[0];
}

function extractText(msg) {
  if (Array.isArray(msg.text_entities) && msg.text_entities.length > 0) {
    return msg.text_entities.map((e) => e.text ?? "").join("");
  }
  if (typeof msg.text === "string") return msg.text;
  if (Array.isArray(msg.text)) {
    return msg.text
      .map((part) => (typeof part === "string" ? part : (part?.text ?? "")))
      .join("");
  }
  return "";
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

const GREETINGS =
  /^(всем\s+привет|привет|доброе\s+утро|добрый\s+день|добрый\s+вечер|доброго\s+времени\s+суток|хорошего\s+понедельника|друзья|дорогие\s+друзья|уважаемые|и\s+так|итак|ну\s+что|сегодня|вчера|напомню|кстати|всем\s+доброго)/i;

const WEAK_OPENERS =
  /^(поэтому|в\s+продолжении|в\s+общем|чуть\s+попозже|смотрите\s+какая|меня\s+уже|я\s+принял\s+решение|обращаю\s+ваше|да\s+забыл|не\s+все\s+знают|на\s+всякий\s+случай|конечно\s+сначала|но\s+теория|я\s+прошел|мне\s+в\s+свое|акциями\s+я|следующий\s+шаг)/i;

function isWeakTitle(line) {
  const trimmed = line.trim();
  return GREETINGS.test(trimmed) || WEAK_OPENERS.test(trimmed);
}

function normalizeLine(line) {
  return line.replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, "").trim();
}

function findTitle(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates = lines
    .map((l) => ({ raw: l, clean: normalizeLine(l) }))
    .filter((l) => l.clean.length >= 20 && l.clean.length <= 120)
    .filter((l) => !isWeakTitle(l.clean));

  if (candidates.length > 0) {
    return candidates[0].clean.slice(0, 100);
  }

  const longCandidates = lines
    .map((l) => normalizeLine(l))
    .filter((l) => l.length >= 10 && !isWeakTitle(l))
    .sort((a, b) => b.length - a.length);

  if (longCandidates.length > 0) {
    return longCandidates[0].slice(0, 100);
  }

  return (lines[0] || "").slice(0, 100);
}

function findPhoto(messages, msg) {
  if (msg.photo) return msg.photo;
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

function inferTags(text) {
  const lower = text.toLowerCase();
  const tags = new Set();
  for (const [keyword, tag] of Object.entries(KEYWORDS)) {
    if (lower.includes(keyword)) tags.add(tag);
  }
  return Array.from(tags);
}

function groupMessages(messages) {
  // Группируем сообщения, отправленные в один день с интервалом менее 30 минут,
  // если они не содержат фото/видео/документов и начинаются не с новой темы.
  const sorted = messages
    .filter((m) => m.type === "message")
    .sort((a, b) => Number(a.date_unixtime) - Number(b.date_unixtime));

  const groups = [];
  let current = null;

  for (const msg of sorted) {
    const text = cleanText(extractText(msg));
    if (text.length < 30) continue;

    if (!current) {
      current = { messages: [msg], text, start: Number(msg.date_unixtime) };
      continue;
    }

    const last = current.messages[current.messages.length - 1];
    const gap = Number(msg.date_unixtime) - Number(last.date_unixtime);
    const isContinuation =
      gap < 30 * 60 &&
      !msg.photo &&
      !last.photo &&
      !text.match(
        /^(И так|Итак|Ну что|Привет|Всем привет|Сегодня|Вчера|Недавно|Кстати|Напомню)/i,
      );

    if (isContinuation) {
      current.messages.push(msg);
      current.text += "\n\n" + text;
    } else {
      groups.push(current);
      current = { messages: [msg], text, start: Number(msg.date_unixtime) };
    }
  }

  if (current) groups.push(current);
  return groups;
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

  // Очищаем ранее сгенерированные посты Telegram (с пустыми или короткими slug)
  if (fs.existsSync(POSTS_DIR)) {
    const existing = fs.readdirSync(POSTS_DIR);
    for (const file of existing) {
      if (file.endsWith("_post.json")) {
        fs.unlinkSync(path.join(POSTS_DIR, file));
      }
    }
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });

  const groups = groupMessages(messages).filter(
    (g) =>
      g.text.length >= 400 &&
      !g.text.match(/anonymous\s+poll|голосование|опрос\s*:/i),
  );

  let created = 0;
  let skipped = 0;

  for (const group of groups) {
    const first = group.messages[0];
    const date = parseTelegramDate(first.date_unixtime || first.date);
    const title = findTitle(group.text);
    const slug = slugify(title) || `post-${first.id}`;
    const fileName = `${date}_${slug}_post.json`;
    const filePath = path.join(POSTS_DIR, fileName);

    // Если slug пустой или слишком короткий — пропускаем
    if (!slug || slug.length < 3) {
      skipped++;
      continue;
    }

    const photo = findPhoto(messages, first);
    const image = photo ? copyHeroImage(photo, slug, date) : null;

    const links = extractLinks(group.text);
    const sourceUrl = links[0] || null;

    const post = {
      schema_version: "social-content/v1",
      source: {
        title,
        url: sourceUrl,
        published_at: date,
      },
      content: {
        telegram: group.text,
      },
      image: image
        ? {
            local_path: image,
            generated_at: date,
            format: path.extname(image).slice(1),
          }
        : null,
      tags: inferTags(group.text),
    };

    fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
    created++;
  }

  console.log(`Created ${created} posts, skipped ${skipped}.`);
}

try {
  run();
} catch (err) {
  console.error(err);
  process.exit(1);
}
