export interface Post {
  slug: string;
  title: string;
  url: string;
  publishedAt: string;
  image: string;
  summary: string;
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
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
    const image =
      data.image?.local_path?.replace(/^public/, "") ??
      "/images/2026-07-01_trading-humor_hero.webp";
    const telegram = data.platforms?.telegram?.content ?? "";
    const summary =
      telegram.split("\n\n").slice(0, 2).join(" ").slice(0, 160) + "…";

    posts.push({
      slug,
      title: source.title ?? "Без названия",
      url: source.url ?? "#",
      publishedAt:
        source.published_at ?? new Date().toISOString().split("T")[0],
      image,
      summary,
    });
  }

  return posts.sort(
    (a, b) => +parseDate(b.publishedAt) - +parseDate(a.publishedAt),
  );
}
