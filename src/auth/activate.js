// import { getDeviceFingerprint } from "./fingerprint.js";
// import { saveActivationHash, getActivationHash } from "./authDB.js";

// // STATIC SALT: هرچند ساده ولی کمی امنیت اضافه می‌کند
// const STATIC_SALT = "GH-CLINIC-2026";

// export function generateActivationHash(code) {
//   const fingerprint = getDeviceFingerprint();
//   // ساده ترین هش با btoa
//   return btoa(code + fingerprint + STATIC_SALT);
// }

// export async function checkActivation(code) {
//   const currentHash = generateActivationHash(code);
//   const storedHash = await getActivationHash();

//   if (!storedHash) {
//     // اگر هنوز فعال نشده → ذخیره و فعال کن
//     await saveActivationHash(currentHash);
//     return true;
//   }

//   // اگر hash ذخیره شده با hash فعلی match کرد → اجازه بده
//   return storedHash === currentHash;
// }

// export async function isAlreadyActivated() {
//   const storedHash = await getActivationHash();
//   if (!storedHash) return false;
//   // فقط بررسی fingerprint سیستم فعلی
//   const fingerprint = getDeviceFingerprint();
//   return storedHash === btoa("DUMMY_CODE" + fingerprint + STATIC_SALT);
// }
