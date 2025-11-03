import admin from "firebase-admin";

// Initialize Firebase Admin once
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      // Use env variables (for deployment)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      // Best-effort local initialization (dev). If a service account json exists, use it;
      // otherwise fall back to application default credentials.
      try {
        const serviceAccount = require("./serviceAccountKey.json");
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch {
        admin.initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          credential: admin.credential.applicationDefault?.(),
        } as any);
      }
    }
    console.log("🔥 Firebase Admin connected successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
  }
}

// Export handles used by the rest of the server
export const db = admin.firestore();
export const adminAuth = admin.auth();
