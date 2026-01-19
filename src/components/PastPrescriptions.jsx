// import { useState } from "react";
// import "../App.css";
// import "../App2.css";
// import "../App2.css";
// import "../App2.css";
// import logo from "../assets/logo.svg"; // local logo
// import { openDB } from "../db"; // make sure your db.js has openDB exported
// const STORE_NAME = "prescriptions";

// function FooterActions({
//   patient,
//   onClear,
//   patientInfoValid,
//   symptomsValid,
//   diagnosisValid,
//   pastPrescriptions,
//   loadPastPrescription,
//   savePrescription,
//   deletePrescription,
//   loadPastPrescriptions,
// }) {
//   const [showPast, setShowPast] = useState(false);
//   const [saving, setSaving] = useState(false);

//   /* ---------- AGE WITH SUFFIX ---------- */
//   const getAgeWithSuffix = () => {
//     const ageNum = parseFloat(patient.age);
//     if (isNaN(ageNum) || ageNum <= 0) return patient.age;
//     if (ageNum < 1) {
//       const months = patient.age.split(".")[1] || "0";
//       return `${patient.age} ${Number(months) === 1 ? "Month" : "Months"}`;
//     }
//     return `${patient.age} ${ageNum === 1 ? "Year" : "Years"}`;
//   };

//   /* ---------- DATE & TIME ---------- */
//   const getDateTime = () => {
//     const now = new Date();
//     const day = String(now.getDate()).padStart(2, "0");
//     const month = String(now.getMonth() + 1).padStart(2, "0");
//     const year = now.getFullYear();
//     let hours = now.getHours();
//     const minutes = String(now.getMinutes()).padStart(2, "0");
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12;
//     return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes} ${ampm}` };
//   };

//   /* ---------- HTML GENERATOR ---------- */
//   const generateHTML = (patientData, date, time) => `
// <!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <title>Prescription</title>
// <style>
// @page { size: A4; margin: 0; }
// body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #000; }
// .page { box-sizing: border-box; border: 1px solid #000; padding: 10px; width: 210mm; height: 297mm; display: flex; flex-direction: column; }
// .header { height: 10%; display: flex; align-items: center; border-bottom: 1px solid #000; padding: 0 10px; }
// .logo { flex: 0 0 15%; }
// .logo img { max-height: 80px; }
// .clinic-info { flex: 1; text-align: center; }
// .clinic-info h1 { margin: 0; font-size: 22px; }
// .clinic-info p { margin: 2px 0; font-size: 14px; }
// .patient-info { padding: 5px 10px; font-size: 14px; display: flex; flex-wrap: wrap; justify-content: space-between; border-bottom: 1px solid #000; }
// .body { display: flex; flex: 1; border-bottom: 1px solid #000; }
// .left { flex: 0 0 30%; border-right: 1px solid #000; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; }
// .right { flex: 0 0 70%; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
// h2 { font-size: 16px; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 3px; }
// ul { padding-left: 18px; margin-top: 5px; flex: 1; overflow-y: auto; }
// li { margin-bottom: 3px; }
// .medications-box { width: 80%; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
// .medications-box div { font-size: 14px; }
// .signature { text-align: center; margin-top: auto; font-size: 14px; }
// .footer { height: 10%; padding: 10px; box-sizing: border-box; font-size: 14px; }
// </style>
// </head>
// <body>
// <div class="page">
//   <div class="header">
//     <div class="logo"><img src="${logo}" alt="Clinic Logo" /></div>
//     <div class="clinic-info">
//       <h1>Good Health Clinic</h1>
//       <p>Dr. John Doe, MBBS, MD</p>
//       <p>123 Main Street | Phone: +123456789 | Email: clinic@example.com</p>
//     </div>
//   </div>

//   <div class="patient-info">
//     <div><strong>Name:</strong> ${patientData.name}</div>
//     <div><strong>Age:</strong> ${getAgeWithSuffix()}</div>
//     <div><strong>Gender:</strong> ${patientData.gender}</div>
//     <div><strong>Weight:</strong> ${patientData.weight ? patientData.weight + " kg" : "-"}</div>
//     <div><strong>Disability:</strong> ${patientData.disability}</div>
//     ${patientData.gender === "Female" ? `
//       <div><strong>Married:</strong> ${patientData.married ? "Yes" : "No"}</div>
//       <div><strong>Pregnant:</strong> ${patientData.pregnant ? "Yes" : "No"}</div>
//       <div><strong>Lactating:</strong> ${patientData.lactating ? "Yes" : "No"}</div>
//     ` : ""}
//   </div>

//   <div class="body">
//     <div class="left">
//       <div><strong>Date:</strong> ${date}</div>
//       <div><strong>Time:</strong> ${time}</div>

//       ${patientData.vitalSigns ? `
//         <h2>Vital Signs</h2>
//         <ul>
//           ${patientData.vitalSigns.bp ? `<li>BP: ${patientData.vitalSigns.bp} mmHg</li>` : ""}
//           ${patientData.vitalSigns.pr ? `<li>PR: ${patientData.vitalSigns.pr} /min</li>` : ""}
//           ${patientData.vitalSigns.rr ? `<li>RR: ${patientData.vitalSigns.rr} /min</li>` : ""}
//           ${patientData.vitalSigns.temp ? `<li>Temp: ${patientData.vitalSigns.temp} °C</li>` : ""}
//         </ul>
//       ` : ""}

//       ${patientData.labResults && patientData.labResults.length > 0 ? `
//         <h2>Lab Results</h2>
//         <ul>
//           ${patientData.labResults.filter(r => r.test || r.value).map(r => `<li>${r.test}: ${r.value}</li>`).join("")}
//         </ul>
//       ` : ""}

//       <h2>Diagnosis</h2>
//       <ul>${patientData.diagnosis.filter(d => d.trim()).map(d => `<li>${d}</li>`).join("")}</ul>
//     </div>

//     <div class="right">
//       <h2 style="text-align:center;">Medications</h2>
//       <div class="medications-box">
//         ${patientData.medications.filter(m => m.name.trim()).map(m => `
//           <div>
//             <strong>${m.type || ""} ${m.name}</strong> ${m.doseValue} ${m.doseUnit} <br>
//             ${m.frequency} x ${m.duration} days <br>
//             ${m.usage || ""}
//           </div>
//         `).join("")}
//       </div>

//       <div class="signature">
//         <p>______________________</p>
//         <p>Doctor Signature</p>
//       </div>
//     </div>
//   </div>

//   <div class="footer">
//     <strong>Doctor Advice:</strong> ${patientData.advice || "-"}
//   </div>
// </div>
// </body>
// </html>
// `;

//   /* ---------- SAVE & PRINT WITH DUPLICATE CHECK ---------- */
//   const handlePrintAndSave = async () => {
//     if (!patientInfoValid || !symptomsValid || !diagnosisValid) {
//       alert("Please fill all required fields before saving/printing.");
//       return;
//     }

//     setSaving(true);

//     const db = await openDB();
//     const tx = db.transaction(STORE_NAME, "readonly");
//     const store = tx.objectStore(STORE_NAME);
//     const req = store.getAll();

//     req.onsuccess = async () => {
//       const allRecords = req.result || [];

//       const compareArrayObjects = (a, b, keys) => {
//         if (a.length !== b.length) return false;
//         for (let i = 0; i < a.length; i++) {
//           for (let key of keys) {
//             if ((a[i][key] || "") !== (b[i][key] || "")) return false;
//           }
//         }
//         return true;
//       };

//       const duplicate = allRecords.find((rec) => {
//         return (
//           rec.name === patient.name &&
//           compareArrayObjects(rec.medications, patient.medications, ["name","doseValue","doseUnit","frequency","duration","usage"]) &&
//           compareArrayObjects(rec.labResults, patient.labResults, ["test","value"])
//         );
//       });

//       const { date, time } = getDateTime();

//       const printPrescription = () => {
//         const html = generateHTML(patient, date, time);
//         const win = window.open("", "_blank");
//         win.document.open();
//         win.document.write(html);
//         win.document.close();
//         win.onload = () => {
//           win.focus();
//           win.print();
//           setSaving(false);
//         };
//       };

//       if (duplicate) {
//         // Only print
//         printPrescription();
//       } else {
//         // Save then print
//         const tx2 = db.transaction(STORE_NAME, "readwrite");
//         tx2.objectStore(STORE_NAME).add({ ...patient, createdAt: new Date().toISOString() });
//         tx2.oncomplete = () => {
//           loadPastPrescriptions();
//           printPrescription();
//         };
//         tx2.onerror = () => setSaving(false);
//       }
//     };

//     req.onerror = () => setSaving(false);
//   };

//   const handleClear = () => {
//     if (window.confirm("Are you sure you want to clear the form?")) onClear();
//   };

// const handleDeletePrescription = (id) => {
//   if (window.confirm("Are you sure you want to delete this prescription?")) {
//     deletePrescription(id);
//   }
// };


//   return (
//     <section className="section">
//       <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
//         <button
//           className="btn primary"
//           onClick={handlePrintAndSave}
//           disabled={saving}
//           style={{ opacity: saving ? 0.5 : 1 }}
//         >
//           {saving ? "Saving..." : "Save & Print Prescription"}
//         </button>

//         <button
//           className="btn secondary"
//           onClick={() => setShowPast(!showPast)}
//         >
//           {showPast ? "Close Past Prescriptions" : "Show Past Prescriptions"}
//         </button>

//         <button className="btn danger" onClick={handleClear}>
//           Clear Form
//         </button>
//       </div>

//       {showPast && (
//         <div className="past-prescriptions-panel">
//           <h3>Past Prescriptions</h3>
//           {pastPrescriptions.length === 0 ? (
//             <p>No past prescriptions</p>
//           ) : (
//             <ul style={{ listStyle: "none", padding: 0 }}>
//               {pastPrescriptions.map((p) => (
//                 <li
//                   key={p.id}
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     borderBottom: "1px dotted var(--input-border)",
//                     marginBottom: "5px",
//                     padding: "5px",
//                   }}
//                 >
//                   <button
//                     className="past-btn"
//                     style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}
//                     onClick={() => {
//                       loadPastPrescription(p);
//                       setShowPast(false);
//                     }}
//                   >
//                     {p.name || "Unnamed"} | {p.diagnosis?.filter(d => d.trim()).join(", ")} |{" "}
//                     {new Date(p.createdAt).toLocaleDateString()}
//                   </button>
//                  <button
//   type="button"
//   className="btn danger small"
//   onClick={(e) => {
//     e.stopPropagation(); // stop event from reaching the parent button
//     handleDeletePrescription(p.id);
//   }}
// >
//   Delete
// </button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}
//     </section>
//   );
// }

// export default FooterActions;
