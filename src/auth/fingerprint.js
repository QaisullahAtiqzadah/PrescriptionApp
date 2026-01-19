export function getDeviceFingerprint() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID(); // generate once
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}
