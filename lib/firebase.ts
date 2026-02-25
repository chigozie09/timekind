import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  signInWithCredential,
  OAuthProvider,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { Task } from "./store";

// ============================================================
// Firebase Config
// ============================================================

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ============================================================
// Singleton Initialization
// ============================================================

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

// ============================================================
// Auth Helpers
// ============================================================

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signInWithAppleCredential(identityToken: string): Promise<User> {
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({ idToken: identityToken });
  const result = await signInWithCredential(getFirebaseAuth(), credential);
  return result.user;
}

export async function signInWithGoogleCredential(idToken: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(getFirebaseAuth(), credential);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

// ============================================================
// Firestore Sync
// ============================================================

function tasksCollectionRef(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "tasks");
}

function taskDocRef(uid: string, taskId: string) {
  return doc(getFirebaseDb(), "users", uid, "tasks", taskId);
}

/**
 * Upload a single task to Firestore (upsert)
 */
export async function upsertTaskToCloud(uid: string, task: Task): Promise<void> {
  const data = {
    taskName: task.taskName,
    category: task.category,
    energyLevel: task.energyLevel,
    estimatedMinutes: task.estimatedMinutes,
    actualMinutes: task.actualMinutes,
    accuracyPercent: task.accuracyPercent,
    startTime: task.startTime,
    endTime: task.endTime,
    timeOfDayTag: task.timeOfDayTag,
    reflection: task.reflection,
    updatedAt: task.updatedAt,
    deletedAt: task.deletedAt,
  };
  await setDoc(taskDocRef(uid, task.id), data, { merge: true });
}

/**
 * Fetch all tasks from Firestore for a user
 */
export async function fetchAllCloudTasks(uid: string): Promise<Task[]> {
  const snapshot = await getDocs(tasksCollectionRef(uid));
  const tasks: Task[] = [];
  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    tasks.push({
      id: docSnap.id,
      cloudId: docSnap.id,
      taskName: d.taskName ?? "",
      category: d.category ?? null,
      energyLevel: d.energyLevel ?? "Medium",
      estimatedMinutes: d.estimatedMinutes ?? 0,
      actualMinutes: d.actualMinutes ?? 0,
      accuracyPercent: d.accuracyPercent ?? 0,
      startTime: d.startTime ?? "",
      endTime: d.endTime ?? null,
      timeOfDayTag: d.timeOfDayTag ?? null,
      reflection: d.reflection ?? null,
      updatedAt: d.updatedAt ?? new Date().toISOString(),
      deletedAt: d.deletedAt ?? null,
    });
  });
  return tasks;
}

/**
 * Upload all local tasks to cloud (batch upsert)
 */
export async function uploadAllTasksToCloud(uid: string, tasks: Task[]): Promise<void> {
  const promises = tasks.map((t) => upsertTaskToCloud(uid, t));
  await Promise.all(promises);
}

/**
 * Merge local and cloud tasks by updatedAt.
 * Returns the merged list.
 */
export function mergeTasks(localTasks: Task[], cloudTasks: Task[]): Task[] {
  const taskMap = new Map<string, Task>();

  // Start with local tasks
  for (const t of localTasks) {
    taskMap.set(t.id, t);
  }

  // Merge cloud tasks
  for (const ct of cloudTasks) {
    const existing = taskMap.get(ct.id);
    if (!existing) {
      taskMap.set(ct.id, ct);
    } else {
      // Keep the one with later updatedAt
      if (new Date(ct.updatedAt) > new Date(existing.updatedAt)) {
        taskMap.set(ct.id, ct);
      }
    }
  }

  return Array.from(taskMap.values());
}

/**
 * Full sync: upload local → fetch cloud → merge → return merged list
 */
export async function performFullSync(
  uid: string,
  localTasks: Task[]
): Promise<Task[]> {
  // Step A: Upload all local tasks to cloud
  await uploadAllTasksToCloud(uid, localTasks);

  // Step B: Fetch all cloud tasks
  const cloudTasks = await fetchAllCloudTasks(uid);

  // Step C: Merge
  const merged = mergeTasks(localTasks, cloudTasks);

  // Step D: Upload any new items from cloud back (ensure cloud has full set)
  await uploadAllTasksToCloud(uid, merged);

  return merged;
}
