import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db, adminAuth } from "./firestore";
import { z } from "zod";
import { postSchema, insertPostSchema, aiAnalysisSchema, type Post, type Analytics } from "@shared/schema";
import { analyzeSentiment } from "./ai";
import { fetchTrendingTopics } from "./trends";
import { HfInference } from "@huggingface/inference";

// Hugging Face client for caption generation
const HF_TOKEN_CAPTION =
  process.env.VITE_HUGGING_FACE_API_KEY || process.env.HUGGING_FACE_API_KEY;
const hfCaption = new HfInference(HF_TOKEN_CAPTION);

// Middleware to verify Firebase ID token and extract user ID
async function authenticateUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // For development, allow x-user-id header as fallback
      const userId = req.headers["x-user-id"] as string;
      if (userId && process.env.NODE_ENV === "development") {
        req.userId = userId;
        return next();
      }
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      req.userId = decodedToken.uid;
      next();
    } catch (tokenError) {
      // Fallback to x-user-id in development for easier testing
      const userId = req.headers["x-user-id"] as string;
      if (userId && process.env.NODE_ENV === "development") {
        req.userId = userId;
        return next();
      }
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // 🗞 Trending Topics Endpoint
  app.get("/api/trending", async (_req: Request, res: Response) => {
    try {
      const topics = await fetchTrendingTopics();
      // Avoid aggressive caching so the client doesn't get 304 + empty body
      res.set("Cache-Control", "no-store");
      res.json(topics);
    } catch (error) {
      console.error("Trending fetch error:", error);
      res.status(500).json({ error: "Failed to fetch trending topics" });
    }
  });

  // 🧠 Generate AI Caption for a given topic
  app.post("/api/generate-caption", async (req: Request, res: Response) => {
    try {
      const { topic } = req.body as { topic?: string };
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const prompt = `Write a short, catchy social media caption about ${topic}.\nMake it engaging and include relevant hashtags.`;

      if (!HF_TOKEN_CAPTION) {
        // Return a local fallback caption when no HF key is set
        const fallback = `Thinking about ${topic}? Here's your chance to share something amazing today! #${topic
          .replace(/\s+/g, "")
          .slice(0, 20)} #content`;
        return res.json({ caption: fallback });
      }

      let data: any;
      try {
        data = await hfCaption.textGeneration({
          model: "gpt2",
          inputs: prompt,
          parameters: {
            max_new_tokens: 60,
            temperature: 0.8,
            top_p: 0.95,
            do_sample: true,
          },
        });
        console.log("🔍 HF response for caption:", JSON.stringify(data));
      } catch (hfError: any) {
        console.error("HF SDK error:", hfError?.message || hfError);
        // Fall back to a simple caption when HF fails
        const fallback = `Thinking about ${topic}? Here's your chance to share something amazing today! #${topic
          .replace(/\s+/g, "")
          .slice(0, 20)} #content`;
        return res.json({ caption: fallback });
      }

      let caption: string | undefined;
      if (Array.isArray(data)) {
        caption = data[0]?.generated_text;
      } else if (data && typeof data === "object") {
        caption = (data as any).generated_text;
      }

      if (!caption) {
        // If HF returns an error object, surface it
        if (data && typeof data === "object" && (data.error || data.message)) {
          console.error("HF caption error payload:", data);
          const fallback = `Thinking about ${topic}? Here's your chance to share something amazing today! #${topic
            .replace(/\s+/g, "")
            .slice(0, 20)} #content`;
          return res.json({ caption: fallback });
        } else {
          const fallback = `Thinking about ${topic}? Here's your chance to share something amazing today! #${topic
            .replace(/\s+/g, "")
            .slice(0, 20)} #content`;
          return res.json({ caption: fallback });
        }
      }

      res.json({ caption });
    } catch (error: any) {
      console.error("AI caption error (outer):", error?.message || error);
      const { topic } = req.body as { topic?: string };
      const fallback = topic
        ? `Thinking about ${topic}? Here's your chance to share something amazing today! #${topic
            .replace(/\s+/g, "")
            .slice(0, 20)} #content`
        : "Something went wrong, but here's a caption for you anyway! #content";
      res.status(500).json({ caption: fallback });
    }
  });

  // AI Analysis endpoint (no auth required for analysis)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const analysis = await analyzeSentiment(text);
      // Validate and ensure correct shape
      const parsed = aiAnalysisSchema.safeParse(analysis);
      if (!parsed.success) {
        return res.status(502).json({ error: "Invalid AI analysis response" });
      }
      res.json(parsed.data);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze text" });
    }
  });

  // Get all posts for current user
  app.get("/api/posts", authenticateUser, async (req: any, res) => {
    try {
      const userId = req.userId;

      // Avoid excluding docs that may not have `scheduledFor` and avoid composite index requirement
      const postsSnapshot = await db
        .collection("posts")
        .where("userId", "==", userId)
        .get();

      const posts: Post[] = [];
      postsSnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
      });

      // Sort newest first using scheduledFor, then createdAt
      posts.sort((a, b) => {
        const aKey = (a as any).scheduledFor ?? (a as any).createdAt ?? 0;
        const bKey = (b as any).scheduledFor ?? (b as any).createdAt ?? 0;
        return bKey - aKey;
      });

      res.json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

 app.post("/api/posts", authenticateUser, async (req: any, res) => {
  try {
    const userId = req.userId;
    const postData = insertPostSchema.parse(req.body);
    const now = Date.now();

    const scheduledFor = Number(postData.scheduledFor) || now;
    const status: "scheduled" | "posted" = scheduledFor > now ? "scheduled" : "posted";

    const newPost: Post = {
      id: "",
      userId,
      content: postData.content || "",
      hashtags: postData.hashtags || [],
      sentiment: postData.sentiment || "neutral",
      sentimentScore: postData.sentimentScore || 0.5,
      scheduledFor,
      status,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("posts").add(newPost);
    newPost.id = docRef.id;

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create post error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid post data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create post" });
  }
});


  // Delete a post
  app.delete("/api/posts/:id", authenticateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const docRef = db.collection("posts").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }

      const postData = doc.data();
      if (postData?.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await docRef.delete();
      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Get analytics
  app.get("/api/analytics", authenticateUser, async (req: any, res) => {
    try {
      const userId = req.userId;

      const postsSnapshot = await db
        .collection("posts")
        .where("userId", "==", userId)
        .get();

      const posts: Post[] = [];
      postsSnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
      });

      // Calculate analytics
      const totalPosts = posts.length;
      const positivePosts = posts.filter((p) => p.sentiment === "positive").length;
      const neutralPosts = posts.filter((p) => p.sentiment === "neutral").length;
      const negativePosts = posts.filter((p) => p.sentiment === "negative").length;

      // Top hashtags
      const hashtagCount = new Map<string, number>();
      posts.forEach((post) => {
        post.hashtags.forEach((tag) => {
          hashtagCount.set(tag, (hashtagCount.get(tag) || 0) + 1);
        });
      });
      const topHashtags = Array.from(hashtagCount.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Posts per week (last 8 weeks)
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const postsPerWeek = Array.from({ length: 8 }, (_, i) => {
        const weekStart = now - (7 - i) * oneWeek;
        const weekEnd = weekStart + oneWeek;
        const count = posts.filter(
          (p) => p.scheduledFor >= weekStart && p.scheduledFor < weekEnd
        ).length;
        const weekDate = new Date(weekStart);
        return {
          week: `${weekDate.getMonth() + 1}/${weekDate.getDate()}`,
          count,
        };
      });

      // Posting times (by hour)
      const postingTimes = Array.from({ length: 24 }, (_, hour) => {
        const count = posts.filter((p) => {
          const postHour = new Date(p.scheduledFor).getHours();
          return postHour === hour;
        }).length;
        return { hour, count };
      }).filter((item) => item.count > 0);

      const analytics: Analytics = {
        totalPosts,
        positivePosts,
        neutralPosts,
        negativePosts,
        topHashtags,
        postsPerWeek,
        postingTimes,
      };

      res.json(analytics);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
