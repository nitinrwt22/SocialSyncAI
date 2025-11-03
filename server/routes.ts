import type { Express } from "express";
import { createServer, type Server } from "http";
import { db, adminAuth } from "./firestore";
import { z } from "zod";
import { postSchema, insertPostSchema, aiAnalysisSchema, type Post, type Analytics } from "@shared/schema";
import { analyzeSentiment } from "./ai";






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

  // Create a new post
  app.post("/api/posts", authenticateUser, async (req: any, res) => {
    try {
      const userId = req.userId;
      const postData = insertPostSchema.parse(req.body);
      
      const now = Date.now();
      const post = {
        ...postData,
        userId,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection("posts").add(post);
      const newPost: Post = { id: docRef.id, ...post };

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
