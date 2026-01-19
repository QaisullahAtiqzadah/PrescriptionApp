// src/utils/activation.js
import { getActivationHash, saveActivationHash } from "../DB/authDB.js";
import { MASTER_CODE } from "../assets/config.js";
import { getDeviceFingerprint } from "../auth/fingerprint.js";

const STATIC_SALT = "GH-CLINIC-2026";

// Generate hash from master code + fingerprint + salt
export async function generateActivationHash(code) {
  const fingerprint = getDeviceFingerprint; // or replace with static string
  const msg = code + "::" + fingerprint + "::" + STATIC_SALT;
  const buffer = new TextEncoder().encode(msg);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Check if already activated
export async function isActivated() {
  const stored = await getActivationHash();
console.log("Stored activation hash:", stored);

  if (!stored) return false;

  const expectedHash = await generateActivationHash(MASTER_CODE);
  console.log("Expected activation hash:", expectedHash);
  return stored === expectedHash;
}

// Check user input code and save if valid
export async function checkActivation(code) {
  if (code !== MASTER_CODE) return false;

  const hash = await generateActivationHash(code);
  const stored = await getActivationHash();

await saveActivationHash(hash);
  return true;
}
