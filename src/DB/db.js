// src/db.js
import { openDB } from "idb";

const DB_NAME = "ClinicDB";
const DB_VERSION = 2;

// Object store names
export const PRESCRIPTION_STORE = "prescriptions";
export const NOTES_STORE = "notes";
export const ACTIVATION_STORE = "activation";

/* =========================
   Initialize IndexedDB
========================= */
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Prescriptions store
      if (!db.objectStoreNames.contains(PRESCRIPTION_STORE)) {
        const store = db.createObjectStore(PRESCRIPTION_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("patientName", "patient.name");
        store.createIndex("createdAt", "createdAt");
        // NOTE: do NOT create rxId as unique to avoid upgrade failure if duplicates exist
        store.createIndex("rxId", "rxId");
      }

      // Notes store
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const store = db.createObjectStore(NOTES_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("noteText", "text", { unique: true });
      }

      // Activation store
      if (!db.objectStoreNames.contains(ACTIVATION_STORE)) {
        db.createObjectStore(ACTIVATION_STORE, { keyPath: "key" });
      }
    },
  });
};

/* =========================
   Prescriptions Functions
========================= */
export const addPrescription = async (patientRecord) => {
  const db = await initDB();
  const record = { ...patientRecord, createdAt: new Date().toISOString() };

  const tx = db.transaction(PRESCRIPTION_STORE, "readwrite");
  const store = tx.store;

  // Check for duplicate rxId first (to avoid add() throwing)
  if (record.rxId) {
    try {
      const existing = await store.index("rxId").get(record.rxId);
      if (existing) {
        // If existing found, return existing id (or update depending on policy)
        // Here we avoid throwing: return existing
        await tx.done;
        return { ...existing };
      }
    } catch (err) {
      // If index lookup fails for any reason, continue to attempt add
      console.warn("rxId index read failed:", err);
    }
  }

  const id = await store.add(record);
  await tx.done;
  return { ...record, id };
};

export const getAllPrescriptions = async () => {
  const db = await initDB();
  return db.getAll(PRESCRIPTION_STORE);
};

export const getPrescriptionById = async (id) => {
  const db = await initDB();
  return db.get(PRESCRIPTION_STORE, id);
};

export const searchPrescriptionsByName = async (name) => {
  if (!name?.trim()) return [];
  const db = await initDB();
  const tx = db.transaction(PRESCRIPTION_STORE, "readonly");
  const index = tx.store.index("patientName");
  const allRecords = await index.getAll();
  await tx.done;
  return allRecords.filter((r) =>
    r.patient?.name?.toLowerCase().includes(name.toLowerCase())
  );
};

export const deletePrescription = async (id) => {
  const db = await initDB();
  const tx = db.transaction(PRESCRIPTION_STORE, "readwrite");
  await tx.store.delete(id);
  await tx.done;
};

/* =========================
   Notes Functions
========================= */
export const addNote = async (text) => {
  if (!text?.trim()) return null;
  const db = await initDB();
  const tx = db.transaction(NOTES_STORE, "readwrite");
  const store = tx.store;
  const existing = await store.index("noteText").get(text);
  if (!existing) {
    const id = await store.add({ text });
    await tx.done;
    return id;
  }
  await tx.done;
  return null;
};

export const getAllNotes = async () => {
  const db = await initDB();
  const allNotes = await db.getAll(NOTES_STORE);
  return allNotes.map((n) => n.text);
};

export const deleteNote = async (id) => {
  const db = await initDB();
  const tx = db.transaction(NOTES_STORE, "readwrite");
  await tx.store.delete(id);
  await tx.done;
};

/* =========================
   Activation Functions
   (names chosen to match other code)
========================= */
export const saveActivationCode = async (code) => {
  const db = await initDB();
  const tx = db.transaction(ACTIVATION_STORE, "readwrite");
  await tx.store.put({ key: "activation", code });
  await tx.done;
};

export const getActivationCode = async () => {
  const db = await initDB();
  const result = await db.get(ACTIVATION_STORE, "activation");
  return result?.code || null;
};
