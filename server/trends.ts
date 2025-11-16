import fetch from "node-fetch";

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function fetchTrendingTopics() {
  try {
    if (!NEWS_API_KEY) {
      console.warn("⚠️ NEWS_API_KEY is not set. Using fallback demo topics.");
      return [
        {
          title: "AI-generated content strategies that actually work",
          source: "SocialSync Demo",
          url: "https://example.com/ai-strategies",
          description:
            "Learn how creators are using AI to brainstorm, draft, and schedule content.",
          image: null,
        },
        {
          title: "Best times to post on social media in 2025",
          source: "SocialSync Demo",
          url: "https://example.com/best-times",
          description:
            "Fresh engagement data on when your audience is most active across platforms.",
          image: null,
        },
        {
          title: "How to repurpose one post into a full content calendar",
          source: "SocialSync Demo",
          url: "https://example.com/repurpose",
          description:
            "Turn a single idea into a week of content with smart repurposing workflows.",
          image: null,
        },
      ];
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&language=en&category=technology&apiKey=${NEWS_API_KEY}`
    );

    const data = await response.json();
    console.log("🔍 NewsAPI response status:", data.status, "totalResults:", data.totalResults);

    if (data.status !== "ok" || !data.articles || data.articles.length === 0) {
      console.warn("⚠️ NewsAPI did not return articles:", data);
      return [];
    }

    // Extract top 10 topics from real articles
    return data.articles.slice(0, 10).map((article: any) => ({
      title: article.title,
      source: article.source?.name,
      url: article.url,
      description: article.description,
      image: article.urlToImage,
    }));
  } catch (error) {
    console.error("❌ Error fetching trending topics:", error);
    return [];
  }
}
