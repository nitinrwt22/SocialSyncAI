import { useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sentiment?: string; hashtags?: string[] }>({});

  const handlePost = async () => {
    if (!text.trim()) return alert("⚠️ Please write something before posting!");
    setLoading(true);

    try {
      // 🔐 Get Firebase Auth Token
      const user = getAuth().currentUser;
      const token = user ? await user.getIdToken() : null;

      // 🧠 Step 1: Analyze post with Hugging Face via backend
      const analysisRes = await axios.post("/api/analyze", { text });
      const { sentiment, hashtags } = analysisRes.data;

      // ☁️ Step 2: Save post in Firestore via backend route
      await axios.post(
        "/api/posts",
        {
          text,
          sentiment,
          hashtags,
          scheduledFor: Date.now(),
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "Bearer dev-user", // fallback for local dev
          },
        }
      );

      setResult({ sentiment, hashtags });
      setText("");
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

      <textarea
        className="w-full text-black rounded-lg p-3 resize-none focus:outline-none"
        rows={5}
        placeholder="Write your post here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

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
