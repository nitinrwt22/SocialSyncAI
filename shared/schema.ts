import { z } from "zod";

// Firebase Auth User Profile (stored in Firestore)
export const userProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  createdAt: z.number(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Post Schema with AI Analysis
export const postSchema = z.object({
  id: z.string(),
  userId: z.string(),
  content: z.string(),
  hashtags: z.array(z.string()),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  sentimentScore: z.number().min(0).max(1),
  scheduledFor: z.number(),
  status: z.enum(["draft", "scheduled", "posted"]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Post = z.infer<typeof postSchema>;

export const insertPostSchema = postSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;

// AI Analysis Response from Hugging Face
export const aiAnalysisSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  sentimentScore: z.number(),
  suggestedHashtags: z.array(z.string()),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

// Analytics Data
export const analyticsSchema = z.object({
  totalPosts: z.number(),
  positivePosts: z.number(),
  neutralPosts: z.number(),
  negativePosts: z.number(),
  topHashtags: z.array(z.object({
    tag: z.string(),
    count: z.number(),
  })),
  postsPerWeek: z.array(z.object({
    week: z.string(),
    count: z.number(),
  })),
  postingTimes: z.array(z.object({
    hour: z.number(),
    count: z.number(),
  })),
});

export type Analytics = z.infer<typeof analyticsSchema>;
