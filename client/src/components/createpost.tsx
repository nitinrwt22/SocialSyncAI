import { useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [scheduledFor, setScheduledFor] = useState(""); // new state for scheduling
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sentiment?: string; hashtags?: string[] }>({});

  const handlePost = async () => {
    if (!text.trim()) return alert("⚠️ Please write something before posting!");
    setLoading(true);

    try {
      // 🔐 Get Firebase Auth Token
      const user = getAuth().currentUser;
      const token = user ? await user.getIdToken() : null;

      // 🧠 Step 1: Analyze sentiment via backend (HuggingFace)
      const analysisRes = await axios.post("/api/analyze", { text });
      const { sentiment, suggestedHashtags } = analysisRes.data;

      // 🕒 Step 2: Save post in Firestore through backend route
      await axios.post(
        "/api/posts",
        {
          content: text,
          sentiment,
          sentimentScore: 0.5, // can update if you store it
          hashtags: suggestedHashtags,
          scheduledFor: scheduledFor
            ? new Date(scheduledFor).getTime()
            : Date.now(), // default: now
          status: scheduledFor ? "scheduled" : "posted", // 👈 mark as scheduled
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "Bearer dev-user",
          },
        }
      );

      setResult({ sentiment, hashtags: suggestedHashtags });
      setText("");
      setScheduledFor("");
      alert("✅ Post created successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create post. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-4 text-center">
        ✨ Create AI-Enhanced Post
      </h2>

      {/* ✍️ Post Text */}
      <textarea
        className="w-full text-black rounded-lg p-3 resize-none focus:outline-none"
        rows={5}
        placeholder="Write your post here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* 🗓️ Schedule Input */}
      <div className="mt-4">
        <label className="block text-sm mb-2">Schedule for (optional):</label>
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          className="w-full p-2 rounded-lg text-black"
        />
      </div>

      <button
        onClick={handlePost}
        disabled={loading}
        className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-400 hover:bg-green-500"
        }`}
      >
        {loading ? "Analyzing..." : "🚀 Post"}
      </button>

      {result.sentiment && (
        <div className="mt-6 bg-white/20 p-4 rounded-lg">
          <p className="text-lg">
            🧠 Sentiment: <strong>{result.sentiment}</strong>
          </p>
          <p className="mt-2 text-sm">
            🏷️ Hashtags: {result.hashtags?.join(" ")}
          </p>
        </div>
      )}
    </div>
  );
}
