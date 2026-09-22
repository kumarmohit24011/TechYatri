// firebase-config.js - Centralized Firebase Realtime Database Configuration for TechYatri
// Replace the values below with your Firebase Project Configuration from the Firebase Console!

var firebaseConfig = {
  apiKey: "AIzaSyCms3x55auGLmcBuZ__RUc_YLhV2REhsnY",
  authDomain: "techhyatri.firebaseapp.com",
  databaseURL: "https://techhyatri-default-rtdb.firebaseio.com",
  projectId: "techhyatri",
  storageBucket: "techhyatri.firebasestorage.app",
  messagingSenderId: "292527503236",
  appId: "1:292527503236:web:ca09fd33a486ef477c0fd1",
  measurementId: "G-MNDKK0HD3T"
};

window.firebaseConfig = firebaseConfig;

// Initialize Firebase App
if (typeof firebase !== 'undefined') {
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

// Realtime Database instance
const rtdb = (typeof firebase !== 'undefined' && firebase.database) ? firebase.database() : null;
window.rtdb = rtdb;

// Helper to remove undefined fields because Firebase Realtime Database rejects undefined
function sanitizeData(data) {
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

// RTDB Collection Wrapper for transparent real-time syncing across the app
class RTDBCollection {
    constructor(collectionName) {
        this.name = collectionName;
    }

    get ref() {
        return firebase.database().ref(this.name);
    }

    onSnapshot(callback, errCallback) {
        const handler = (snapshot) => {
            const docs = [];
            snapshot.forEach((child) => {
                docs.push({
                    id: child.key,
                    data: () => child.val() || {}
                });
            });
            callback({
                empty: docs.length === 0,
                docs: docs,
                forEach: (fn) => docs.forEach(fn),
                size: docs.length
            });
        };

        this.ref.on('value', handler, (err) => {
            console.warn(`[RTDB] Error listening to "${this.name}":`, err);
            if (errCallback) errCallback(err);
        });

        return () => this.ref.off('value', handler);
    }

    async get() {
        const snapshot = await this.ref.once('value');
        const docs = [];
        snapshot.forEach((child) => {
            docs.push({
                id: child.key,
                data: () => child.val() || {}
            });
        });
        return {
            empty: docs.length === 0,
            docs: docs,
            forEach: (fn) => docs.forEach(fn),
            size: docs.length
        };
    }

    async add(data) {
        const clean = sanitizeData(data);
        const newRef = this.ref.push();
        await newRef.set(clean);
        return { id: newRef.key };
    }

    doc(id) {
        const childRef = this.ref.child(id);
        return {
            update: async (data) => {
                return childRef.update(sanitizeData(data));
            },
            set: async (data, options) => {
                const clean = sanitizeData(data);
                if (options && options.merge) {
                    return childRef.update(clean);
                }
                return childRef.set(clean);
            },
            delete: async () => {
                return childRef.remove();
            },
            get: async () => {
                const snap = await childRef.once('value');
                return {
                    id: snap.key,
                    exists: snap.exists(),
                    data: () => snap.val() || {}
                };
            }
        };
    }
}

// Polyfill server timestamp so existing calls work with RTDB
if (typeof firebase !== 'undefined') {
    if (!firebase.firestore) {
        firebase.firestore = {
            FieldValue: {
                serverTimestamp: () => {
                    return (firebase.database && firebase.database.ServerValue)
                        ? firebase.database.ServerValue.TIMESTAMP
                        : Date.now();
                }
            }
        };
    }
}

// Global db instance targeting Firebase Realtime Database
window.db = {
    collection: (name) => new RTDBCollection(name),
    ref: (path) => (firebase.database ? firebase.database().ref(path) : null)
};

// Connection listener
if (rtdb) {
    rtdb.ref('.info/connected').on('value', (snap) => {
        const connected = snap.val() === true;
        console.log(`📡 [Firebase Realtime Database] Connection Status: ${connected ? 'ONLINE' : 'CONNECTING/OFFLINE'}`);
        const statusEl = document.getElementById('rtdbConnectionStatus');
        if (statusEl) {
            statusEl.textContent = connected ? '● Online (Connected)' : '○ Connecting / Offline';
            statusEl.style.color = connected ? '#10b981' : '#f59e0b';
        }
    });
}
