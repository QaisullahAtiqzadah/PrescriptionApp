// src/utils/activation.js
import { getActivationCode, saveActivationCode } from "../DB/db.js";
import { MASTER_CODE } from "../assets/config.js";
import { getDeviceFingerprint } from "../auth/fingerprint.js";

const STATIC_SALT = "GH-CLINIC-2026";

// Helper: safe fingerprint resolution
async function resolveFingerprint() {
  try {
    if (typeof getDeviceFingerprint === "function") {
      const fp = getDeviceFingerprint();
      // handle promise or sync return
      return fp instanceof Promise ? await fp : fp;
    }
  } catch (err) {
    console.warn("Fingerprint generation failed, falling back to UA:", err);
  }
  // fallback
  return navigator?.userAgent || "unknown-fp";
}

// Generate hash from master code + fingerprint + salt
export async function generateActivationHash(code) {
  const fingerprint = await resolveFingerprint();
  const msg = `${code}::${fingerprint}::${STATIC_SALT}`;
  const buffer = new TextEncoder().encode(msg);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Check if already activated
export async function isActivated() {
  const stored = await getActivationCode();
  // console.log left as debug if needed
  // console.log("Stored activation hash:", stored);
  if (!stored) return false;

  const expectedHash = await generateActivationHash(MASTER_CODE);
  // console.log("Expected activation hash:", expectedHash);
  return stored === expectedHash;
}

// Check user input code and save if valid
export async function checkActivation(code) {
  if (code !== MASTER_CODE) return false;

  const hash = await generateActivationHash(code);
  await saveActivationCode(hash);
  return true;
}
