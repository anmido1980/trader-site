export interface Post {
  slug: string;
  title: string;
  url: string | null;
  publishedAt: string;
  image: string;
  summary: string;
  content: string;
  tags: string[];
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function makeSummary(text: string): string {
  return text.replace(/\n+/g, " ").slice(0, 160).trim() + "…";
}

export async function getPosts(): Promise<Post[]> {
  const files = import.meta.glob("/posts/*.json", { eager: true });
  const posts: Post[] = [];

  for (const path in files) {
    const slug =
      path
        .split("/")
        .pop()
        ?.replace(/_post\.json$/, "") ?? "";
    const data = files[path] as any;
    const source = data.source ?? {};
    const imageMeta = data.image ?? {};
    const image = imageMeta.local_path
      ? imageMeta.local_path.replace(/^public/, "")
      : "/images/2026-07-01_trading-humor_hero.webp";
    const content = data.content?.telegram ?? source.title ?? "";

    posts.push({
      slug,
      title: source.title ?? "Без названия",
      url: source.url ?? null,
      publishedAt:
        source.published_at ?? new Date().toISOString().split("T")[0],
      image,
      summary: makeSummary(content),
      content,
      tags: data.tags ?? [],
    });
  }

  return posts.sort(
    (a, b) => +parseDate(b.publishedAt) - +parseDate(a.publishedAt),
  );
}

export function getPostTags(posts: Post[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}
