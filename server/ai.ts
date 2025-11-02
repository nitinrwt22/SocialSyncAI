import { HfInference } from "@huggingface/inference";
import type { AIAnalysis } from "@shared/schema";

// Allow both server-only and Vite-style env names
const HF_TOKEN = process.env.VITE_HUGGING_FACE_API_KEY || process.env.HUGGING_FACE_API_KEY;
const hf = new HfInference(HF_TOKEN);

if (!HF_TOKEN) {
  console.warn(
    "Hugging Face API key is missing (set VITE_HUGGING_FACE_API_KEY or HUGGING_FACE_API_KEY). Sentiment will default to neutral on failure."
  );
}

export async function analyzeSentiment(text: string): Promise<AIAnalysis> {
  try {
    // 🧠 Use Hugging Face sentiment analysis model
    const result = await hf.textClassification({
      model: "cardiffnlp/twitter-roberta-base-sentiment-latest",
      inputs: text
    });

    console.log("HuggingFace raw result:", JSON.stringify(result, null, 2));

    // Normalise outputs to a flat array
    const candidates = Array.isArray(result[0]) ? (result[0] as any[]) : (result as any[]);

    // Debug: log model outputs in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        "HF candidates:",
        candidates.map((c: any) => ({ label: c?.label, score: c?.score }))
      );
    }

    // Find the highest confidence label from the model
    const best = candidates.reduce((acc: any, cur: any) =>
      (cur?.score ?? -1) > (acc?.score ?? -1) ? cur : acc,
    candidates[0]);
    
    const rawLabel: string = String(best?.label ?? "").toLowerCase();
    const bestScore: number = typeof best?.score === "number" ? best.score : 0.5;

    let sentiment: "positive" | "neutral" | "negative" = "neutral";
    let score = bestScore;

    if (rawLabel.includes("positive")) {
      sentiment = "positive";
    } else if (rawLabel.includes("negative")) {
      sentiment = "negative";
    } else if (rawLabel.includes("neutral")) {
      sentiment = "neutral";
    } else {
      // Fallback for label_0, label_1, label_2 format
      if (rawLabel === "label_2" || rawLabel === "2") {
        sentiment = "positive";
      } else if (rawLabel === "label_0" || rawLabel === "0") {
        sentiment = "negative";
      } else {
        sentiment = "neutral";
      }
    }

    const hashtags = generateHashtags(text, sentiment);

    if (process.env.NODE_ENV === "development") {
      console.log("HF best:", { mapped: sentiment, score });
    }

    return {
      sentiment,
      sentimentScore: Number((score > 1 ? score / 100 : score).toFixed(4)),


      suggestedHashtags: hashtags,
    };
  } catch (error) {
    console.error("⚠️ Sentiment analysis error (SDK):", error);
    // REST fallback (handles cold starts and shape differences)
    try {
      const resp = await fetch(
        "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english?wait_for_model=true",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN ?? ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
        }
      );
      const json: any = await resp.json();
      const arr = Array.isArray(json[0]) ? json[0] : json;
      const norm = (arr as any[]).map((c: any) => ({
        label: String(c?.label ?? "").toLowerCase(),
        score: typeof c?.score === "number" ? c.score : NaN,
      }));
      const isPos = (l: string) => l.includes("positive") || l === "label_1" || l === "1";
      const isNeg = (l: string) => l.includes("negative") || l === "label_0" || l === "0";

      const posBest = norm.filter((c) => isPos(c.label)).sort((a, b) => b.score - a.score)[0];
      const negBest = norm.filter((c) => isNeg(c.label)).sort((a, b) => b.score - a.score)[0];

      let sentiment: "positive" | "neutral" | "negative" = "neutral";
      let score = 0.5;
      if (posBest && (!negBest || posBest.score >= (negBest?.score ?? -1))) {
        sentiment = "positive";
        score = posBest.score;
      } else if (negBest) {
        sentiment = "negative";
        score = negBest.score;
      }

      return {
        sentiment,
        sentimentScore: Number((score > 1 ? score / 100 : score).toFixed(4)),
 

        suggestedHashtags: generateHashtags(text, sentiment),
      };
    } catch (restErr) {
      console.error("⚠️ Sentiment analysis error (REST fallback):", restErr);
      return {
        sentiment: "neutral",
        sentimentScore: 0.5,
        suggestedHashtags: generateHashtags(text, "neutral"),
      };
    }
  }
}

// ✨ Generate hashtags based on text + sentiment
function generateHashtags(text: string, sentiment: string): string[] {
  const hashtags: string[] = [];

  // Sentiment-based tags
  if (sentiment === "positive") {
    hashtags.push("Motivation", "Success", "Inspiration", "Growth");
  } else if (sentiment === "negative") {
    hashtags.push("Challenge", "Learning", "Reflection", "RealTalk");
  } else {
    hashtags.push("Update", "Thoughts", "Community", "Share");
  }

  // Extract keywords from text
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    "the","be","to","of","and","a","in","that","have","i",
    "it","for","not","on","with","he","as","you","do","at",
    "this","but","his","by","from","they","we","say","her","she",
    "or","an","will","my","one","all","would","there","their","is"
  ]);

  const keywords = words
    .filter(w => w.length > 4 && !stopWords.has(w))
    .map(w => w.replace(/[^a-z0-9]/g, ""))
    .filter(w => w.length > 3);

  const uniqueKeywords = Array.from(new Set(keywords))
    .slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1));

  hashtags.push(...uniqueKeywords);
  hashtags.push("SocialMedia", "AI", "Cloud");

  return Array.from(new Set(hashtags)).slice(0, 8);
}
