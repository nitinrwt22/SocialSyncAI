import { db } from "./firestore";

export async function runScheduledTasks() {
  console.log("⏰ Checking for posts to auto-publish...");

  try {
    const now = Date.now();

    const snapshot = await db
      .collection("posts")
      .where("status", "==", "scheduled")
      .where("scheduledFor", "<=", now)
      .get();

    if (snapshot.empty) {
      console.log("No posts to publish.");
      return;
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      const postRef = db.collection("posts").doc(doc.id);
      batch.update(postRef, {
        status: "posted",
        updatedAt: now,
      });
    });

    await batch.commit();
    console.log(`🚀 Published ${snapshot.size} scheduled post(s)!`);
    return { count: snapshot.size };
  } catch (error) {
    console.error("❌ Scheduler error:", error);
    throw error;
  }
}
