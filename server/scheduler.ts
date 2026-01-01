import cron from "node-cron";
import { db } from "./firestore";

export function startScheduler() {
  console.log("🕒 Scheduler initialized...");

  // Runs every minute
  cron.schedule("* * * * *", async () => {
    const now = Date.now();
    console.log("⏰ Checking for posts to auto-publish...");

    try {
      const snapshot = await db
        .collection("posts")
        .where("status", "==", "scheduled")
      .where("scheduledFor", "<=", now)
        .get();

      if (snapshot.empty) return;

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
    } catch (error) {
      console.error("❌ Scheduler error:", error);
    }
  });
}
