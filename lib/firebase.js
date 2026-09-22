// lib/firebase.js - Next.js Realtime Database Modular Client
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set, update, remove, get } from 'firebase/database';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCms3x55auGLmcBuZ__RUc_YLhV2REhsnY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "techhyatri.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://techhyatri-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "techhyatri",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "techhyatri.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "292527503236",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:292527503236:web:ca09fd33a486ef477c0fd1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MNDKK0HD3T"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const rtdb = typeof window !== 'undefined' ? getDatabase(app) : null;

// Helper to remove undefined fields because Firebase Realtime Database rejects undefined
export function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = sanitizeData(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// RTDB Real-time collection listener
export function subscribeCollection(collectionName, onData, onError) {
  if (!rtdb) return () => {};
  const dbRef = ref(rtdb, collectionName);
  
  const unsubscribe = onValue(dbRef, (snapshot) => {
    const items = [];
    snapshot.forEach((child) => {
      items.push({
        id: child.key,
        ...child.val()
      });
    });
    onData(items);
  }, (err) => {
    console.warn(`[RTDB] Error in collection "${collectionName}":`, err);
    if (onError) onError(err);
  });

  return unsubscribe;
}

// RTDB Add item
export async function addItem(collectionName, data) {
  if (!rtdb) throw new Error("Firebase not initialized in client");
  const clean = sanitizeData({
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  const dbRef = ref(rtdb, collectionName);
  const newRef = push(dbRef);
  await set(newRef, clean);
  return newRef.key;
}

// RTDB Update item
export async function updateItem(collectionName, id, data) {
  if (!rtdb) throw new Error("Firebase not initialized in client");
  const clean = sanitizeData({
    ...data,
    updatedAt: Date.now()
  });
  const itemRef = ref(rtdb, `${collectionName}/${id}`);
  await update(itemRef, clean);
  return id;
}

// RTDB Delete item
export async function deleteItem(collectionName, id) {
  if (!rtdb) throw new Error("Firebase not initialized in client");
  const itemRef = ref(rtdb, `${collectionName}/${id}`);
  await remove(itemRef);
  return id;
}

// RTDB Get single fetch
export async function getCollection(collectionName) {
  if (!rtdb) return [];
  const dbRef = ref(rtdb, collectionName);
  const snap = await get(dbRef);
  const items = [];
  snap.forEach((child) => {
    items.push({
      id: child.key,
      ...child.val()
    });
  });
  return items;
}
