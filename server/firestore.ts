import admin from "firebase-admin";

// Initialize Firebase Admin once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("🔥 Firebase Admin connected successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
  }
}

export const db = admin.firestore();
export const adminAuth = admin.auth();
