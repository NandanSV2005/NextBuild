import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForDevelopmentOnlyNextBuild",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nextbuild-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nextbuild-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nextbuild-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef123456",
};

// Initialize Firebase once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export interface SavedPlanRecord {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  overallScore: number;
  githubScore: number;
  resumeAtsScore: number;
  verdict: string;
  createdAt: string;
  data: any;
}

// Firestore Helper Functions
export async function saveBuildPlanToCloud(userId: string, planData: Omit<SavedPlanRecord, 'id' | 'userId' | 'createdAt'>) {
  try {
    const planId = `plan-${Date.now()}`;
    const planRef = doc(db, 'users', userId, 'buildPlans', planId);
    const payload: SavedPlanRecord = {
      id: planId,
      userId,
      ...planData,
      createdAt: new Date().toISOString(),
    };
    await setDoc(planRef, payload);
    return payload;
  } catch (err) {
    console.warn('Firestore save plan fallback:', err);
    // LocalStorage fallback
    const key = `nextbuild_plans_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const localPayload = {
      id: `plan-${Date.now()}`,
      userId,
      ...planData,
      createdAt: new Date().toISOString(),
    };
    existing.unshift(localPayload);
    localStorage.setItem(key, JSON.stringify(existing));
    return localPayload;
  }
}

export async function fetchSavedBuildPlans(userId: string): Promise<SavedPlanRecord[]> {
  try {
    const plansRef = collection(db, 'users', userId, 'buildPlans');
    const q = query(plansRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const plans: SavedPlanRecord[] = [];
    snapshot.forEach((doc) => {
      plans.push(doc.data() as SavedPlanRecord);
    });

    if (plans.length > 0) return plans;

    // Check localStorage fallback
    const key = `nextbuild_plans_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (err) {
    console.warn('Firestore fetch plans fallback:', err);
    const key = `nextbuild_plans_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
}

export async function deleteSavedBuildPlan(userId: string, planId: string): Promise<boolean> {
  try {
    const planRef = doc(db, 'users', userId, 'buildPlans', planId);
    await deleteDoc(planRef);

    const key = `nextbuild_plans_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.filter((p: any) => p.id !== planId);
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.warn('Firestore delete plan fallback:', err);
    const key = `nextbuild_plans_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.filter((p: any) => p.id !== planId);
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};
