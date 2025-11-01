import { HfInference } from "@huggingface/inference";
import type { AIAnalysis } from "@shared/schema";

const hf = new HfInference(process.env.VITE_HUGGING_FACE_API_KEY);

export async function analyzeSentiment(text: string): Promise<AIAnalysis> {
  try {
    // Use Hugging Face sentiment analysis model
    const result = await hf.textClassification({
      model: "distilbert-base-uncased-finetuned-sst-2-english",
      inputs: text,
    });

    // Get the sentiment with highest score
    const topSentiment = result[0];
    const label = topSentiment.label.toLowerCase();
    
    // Map to our sentiment types
    let sentiment: "positive" | "neutral" | "negative";
    if (label.includes("positive")) {
      sentiment = "positive";
    } else if (label.includes("negative")) {
      sentiment = "negative";
    } else {
      sentiment = "neutral";
    }

    // Generate hashtags based on content
    const hashtags = generateHashtags(text, sentiment);

    return {
      sentiment,
      sentimentScore: topSentiment.score,
      suggestedHashtags: hashtags,
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    // Fallback to neutral sentiment
    return {
      sentiment: "neutral",
      sentimentScore: 0.5,
      suggestedHashtags: generateHashtags(text, "neutral"),
    };
  }
}

function generateHashtags(text: string, sentiment: string): string[] {
  const hashtags: string[] = [];

  // Add sentiment-based hashtags
  if (sentiment === "positive") {
    hashtags.push("Motivation", "Success", "Inspiration", "Growth");
  } else if (sentiment === "negative") {
    hashtags.push("Challenge", "Learning", "Reflection", "RealTalk");
  } else {
    hashtags.push("Update", "Thoughts", "Community", "Share");
  }

  // Extract keywords from text (simple approach)
  const words = text.toLowerCase().split(/\s+/);
  const commonWords = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "is"
  ]);

  // Add content-specific hashtags
  const keywords = words
    .filter((word) => word.length > 4 && !commonWords.has(word))
    .map((word) => word.replace(/[^a-z0-9]/g, ""))
    .filter((word) => word.length > 3);

  // Add unique keywords as hashtags (capitalized)
  const uniqueKeywords = Array.from(new Set(keywords))
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  hashtags.push(...uniqueKeywords);

  // Add general social media hashtags
  hashtags.push("SocialMedia", "Content", "AI");

  // Return unique hashtags (limit to 8)
  return Array.from(new Set(hashtags)).slice(0, 8);
}
