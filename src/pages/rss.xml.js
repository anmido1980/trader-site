import rss from "@astrojs/rss";
import { getPosts } from "../utils/posts";

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: "Портфельный инвестор",
    description: "Канал о портфельных инвестициях: обзоры, стратегии, разборы.",
    site: context.site,
    items: posts.map((post) => ({
      link: `/posts/${post.slug}/`,
      title: post.title,
      pubDate: new Date(post.publishedAt),
      description: post.summary,
    })),
  });
}
