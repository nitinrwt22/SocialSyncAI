import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin with Application Default Credentials
// In production, this uses service account or Workload Identity
// For development/Replit, we'll use the emulator or rely on the project ID
if (getApps().length === 0) {
  try {
    // Try to initialize with default credentials
    initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // Continue anyway - Firestore client will handle auth
  }
}

export const db = getFirestore();
export const adminAuth = getAuth();
