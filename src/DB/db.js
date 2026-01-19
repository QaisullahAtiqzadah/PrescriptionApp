// src/db.js
import { openDB } from "idb";

const DB_NAME = "ClinicDB";
const DB_VERSION = 2;

// Object store names
const PRESCRIPTION_STORE = "prescriptions";
const NOTES_STORE = "notes";
const ACTIVATION_STORE = "activation";

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
        store.createIndex("rxId", "rxId", { unique: true }); // <--- add rxId index
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
  const id = await store.add(record); // add record
  await tx.done; // <--- ensures the transaction is fully committed
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
  await tx.done; // ensure transaction completes
  return allRecords.filter(r => r.patient.name.toLowerCase().includes(name.toLowerCase()));
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
  const store = db.transaction(NOTES_STORE, "readwrite").objectStore(NOTES_STORE);
  const existing = await store.index("noteText").get(text);
  if (!existing) {
    const id = await store.add({ text });
    return id;
  }
  return null;
};

export const getAllNotes = async () => {
  const db = await initDB();
  const allNotes = await db.getAll(NOTES_STORE);
  return allNotes.map(n => n.text);
};

export const deleteNote = async (id) => {
  const db = await initDB();
  const tx = db.transaction(NOTES_STORE, "readwrite");
  await tx.store.delete(id);
  await tx.done;
};

/* =========================
   Activation Functions
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
