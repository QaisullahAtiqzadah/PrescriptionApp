// src/utils/rxId.js

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

const RX_SECRET = "GH-CLINIC-2026";

export function generateRxId(patient) {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const medsKey = (patient.medications || [])
    .filter(m => m.name?.trim())
    .map(m => `${m.name}-${m.doseValue}-${m.doseUnit}`)
    .join("|");

  const baseString = [
    patient.name?.trim().toLowerCase(),
    dateKey,
    medsKey,
    RX_SECRET,
  ].join("::");

  const hash = simpleHash(baseString);

  return `RX-${hash.slice(0, 6)}-${dateKey.replace(/-/g, "")}`;
}
