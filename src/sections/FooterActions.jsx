import { useState, useEffect, useRef, useMemo } from "react";
import "../App.css";
import logo from "../assets/logo.svg"; // local logo
import { generateRxId } from "../utils/rxId.js";
import QRcode from "qrcode";
import { getNextAppointmentDate } from "../utils/date";
import { FaSearch } from "react-icons/fa";
import { addPrescription } from "../DB/db.js"; // <-- ensure this path matches your project (src/db.js)

function FooterActions({
  patient,
  onClear,
  patientInfoValid,
  symptomsValid,
  diagnosisValid,
  pastPrescriptions,
  loadPastPrescription,
  deletePrescription,
}) {
  const [showPast, setShowPast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // QR generation
  const generateQRCode = async (text, size = 100) => {
    try {
      return await QRcode.toDataURL(text, { width: size, margin: 0 });
    } catch (err) {
      console.error("QR Code generation error:", err);
      return "";
    }
  };

  // filtered past prescriptions
  const filteredPastPrescriptions = useMemo(() => {
    if (!searchTerm.trim()) return pastPrescriptions || [];

    const term = searchTerm.toLowerCase();
    return (pastPrescriptions || [])
      .filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(term);
        const rxMatch = p.rxId?.toLowerCase().includes(term);
        const dateMatch = new Date(p.createdAt || p.savedAt)
          .toLocaleDateString()
          .toLowerCase()
          .includes(term);
        const diagnosisMatch = (p.diagnosis || [])
          .join(" ")
          .toLowerCase()
          .includes(term);

        return nameMatch || rxMatch || dateMatch || diagnosisMatch;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.savedAt) - new Date(a.createdAt || a.savedAt)
      );
  }, [pastPrescriptions, searchTerm]);

  const getAgeWithSuffix = () => {
    const ageNum = parseFloat(patient.age);
    if (isNaN(ageNum) || ageNum <= 0) return patient.age;
    if (ageNum < 1) {
      const months = patient.age.split(".")[1] || "0";
      return `${patient.age} ${Number(months) === 1 ? "Month" : "Months"}`;
    }
    return `${patient.age} ${ageNum === 1 ? "Year" : "Years"}`;
  };

  const getDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes} ${ampm}` };
  };

  // printPrescription now accepts opened window and rxId
  const printPrescription = async (win, rxId) => {
    const { date, time } = getDateTime();
    const nextVisitDate = patient.nextVisit ? getNextAppointmentDate(patient.nextVisit) : "-";

    const qrText = `
RX-ID:${rxId}
دوکتورس زهرا سامع
معالج امراض نسایی ولادی و التراسوند
آدرس کلینیک: چهاراهی دوغ آباد, کلنیک رحمت
شماره های تماس
+93700561034
+93749847103
نام مریض:${patient.name}
ملاقات بعدی:${nextVisitDate}
`;

    let qrDataUrl = "";
    try {
      qrDataUrl = await generateQRCode(qrText, 100);
    } catch (err) {
      console.error("QR generation failed:", err);
      qrDataUrl = "";
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Prescription</title>
<style>
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; font-family: Arial, Tahoma, "Segoe UI", sans-serif; color: #000; }
  .page { box-sizing: border-box; padding: 10px; width: 210mm; height: 297mm; display:flex; flex-direction:column; }
  .header{display:flex;align-items:center;border-bottom:1px solid #000;padding:0 10px}
  .logo{flex:0 0 15%}.clinic-info{flex:1;text-align:center}
  .patient-info{padding:5px 10px;font-size:14px;display:flex;flex-wrap:wrap;justify-content:space-between;border-bottom:1px solid #000}
  .body{display:flex;flex:1;border-bottom:1px solid #000}
  .left{flex:0 0 30%;border-right:1px solid #000;padding:10px;box-sizing:border-box;display:flex;flex-direction:column}
  .right{flex:0 0 70%;padding:10px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:space-between}
  h2{font-size:16px;margin-bottom:5px;border-bottom:1px solid #000;padding-bottom:3px}
  ul{padding-left:18px;margin-top:5px;flex:1;overflow-y:auto} li{margin-bottom:3px}
  .drug-box{width:80%;margin:0 auto;text-align:left;padding:10px}
  .doctor-sign{margin-top:auto;text-align:center;font-size:14px}
  .footer{height:10%;padding:10px;box-sizing:border-box;font-size:14px}
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo"><img src="${logo}" alt="Logo" style="max-height:80px" /></div>
      <div class="clinic-info">
        <h1>Dr. Zahra Saami</h1>
        <p>دوکتورس زهرا سامع</p>
        <p>معالج امراض نسایی، ولادی و التراسوند</p>
      </div>
    </div>

    <div class="patient-info">
      <div><strong>Name:</strong> ${patient.name}</div>
      <div><strong>Age:</strong> ${getAgeWithSuffix()}</div>
      <div><strong>Gender:</strong> ${patient.gender}</div>
      <div><strong>RX-ID:</strong> ${rxId}</div>
      <div><strong>Date:</strong> ${date}</div>
      <div><strong>Time:</strong> ${time}</div>
    </div>

    <div class="body">
      <div class="left">
        ${
          patient.vitalSigns && (patient.vitalSigns.bp || patient.vitalSigns.pr || patient.vitalSigns.rr || patient.vitalSigns.temp)
            ? `<h2>Vital Signs</h2><ul>
                ${patient.vitalSigns.bp ? `<li>BP: ${patient.vitalSigns.bp} mmHg</li>` : ""}
                ${patient.vitalSigns.pr ? `<li>PR: ${patient.vitalSigns.pr} /min</li>` : ""}
                ${patient.vitalSigns.rr ? `<li>RR: ${patient.vitalSigns.rr} /min</li>` : ""}
                ${patient.vitalSigns.temp ? `<li>Temp: ${patient.vitalSigns.temp} °C</li>` : ""}
               </ul>`
            : ""
        }

        ${
          patient.labResults && patient.labResults.some(r => (r.test||"").trim() || (r.value||"").trim())
            ? `<h2>Lab Results</h2><ul>` +
              patient.labResults.filter(r => (r.test||"").trim() || (r.value||"").trim()).map(r => `<li>${r.test}: ${r.value}</li>`).join("") +
              `</ul>`
            : ""
        }

        <h2>Diagnosis</h2>
        <ul>${(patient.diagnosis || []).filter(d => d.trim()).map(d => `<li>${d}</li>`).join("")}</ul>

        <div style="margin-top:12px;text-align:center;">
          ${qrDataUrl ? `<img src="${qrDataUrl}" style="width:120px;height:120px;object-fit:contain;" alt="QR"/>` : `<p>QR Code not available</p>`}
          <p style="font-size:13px;margin:6px 0 0 0;">QR Code</p>
        </div>
      </div>

      <div class="right">
        <div class="drug-box">
          <h2>Rx</h2>
          ${
            (patient.medications || []).filter(m => (m.name||"").trim()).map(m => `
              <div class="drug-item">
                <strong>${m.form || "Tab"} ${m.name}</strong> ${m.doseValue || ""} ${m.doseUnit || ""}<br/>
                ${m.frequency || ""} | ${m.duration || ""} days | ${m.usage || ""}<br/>
                Notes: ${m.notes || "-"}
              </div>
            `).join("")
          }
        </div>
        <div class="doctor-sign"><p>Doctor's Signature</p></div>
      </div>
    </div>

    <div class="footer">
      <strong>Doctor Advice:</strong> ${patient.advice || "-"}
      <p style="direction: rtl; text-align: right; margin:0; line-height:1.4;">آدرس: چهاراهی دوغ آباد, کلنیک رحمت | تماس: +93700561034</p>
    </div>
  </div>
</body>
</html>
`;

    try {
      // write content into opened window
      win.document.open();
      win.document.write(htmlContent);
      win.document.close();
    } catch (err) {
      console.error("Unable to write to print window:", err);
      return;
    }

    // focus and trigger print after tiny delay so rendering completes
    try {
      win.focus();
      setTimeout(() => {
        try {
          win.print();
        } catch (e) {
          console.error("Print failed:", e);
        }
      }, 250);
    } catch (err) {
      console.error("Error focusing/printing:", err);
    }
  };

  /* ---------- PRINT & SAVE WITH DUPLICATE CHECK ---------- */
  const handlePrintAndSave = async () => {
    if (!patientInfoValid || !symptomsValid || !diagnosisValid) {
      alert("Please fill all required fields before saving/printing.");
      return;
    }

    // OPEN POPUP SYNCHRONOUSLY — must be done before any await to avoid popup blocking
    const win = window.open("about:blank", "_blank");
    if (!win) {
      alert("Popup blocked. Please allow popups for this site to print.");
      return;
    }

    setSaving(true);

    // generate RX once here
    const rxId = generateRxId(patient);

    try {
      // check duplicate using rxId
      const isDuplicate = (pastPrescriptions || []).some((p) => p.rxId === rxId);

      if (!isDuplicate) {
        const newRecord = { ...patient, rxId, createdAt: new Date().toISOString() };
        // use addPrescription imported from DB to ensure tx completion
        await addPrescription(newRecord);
        // parent currently reloads list on mount; if you have a function to refresh list, call it here.
      }

      // print using the same rxId and the already-opened window
      await printPrescription(win, rxId);
    } catch (error) {
      console.error("Error in Save & Print:", error);
      alert("An error occurred while saving or printing the prescription.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    const ok = window.confirm("Are you sure you want to clear the form?");
    if (ok) onClear();
  };

  return (
    <section className="section">
      {/* Footer buttons container */}
      <div className="footer-actions">
        <button className={`btn primary ${saving ? "saving" : ""}`} onClick={handlePrintAndSave}>
          {saving ? "Saving..." : "Save & Print Prescription"}
        </button>

        <button className="btn secondary" onClick={() => setShowPast(!showPast)}>
          {showPast ? "Close Past Prescriptions" : "Show Past Prescriptions"}
        </button>

        <button className="btn danger" onClick={handleClear}>
          Clear Form
        </button>
      </div>

      {/* Past Prescriptions Panel */}
      {showPast && (
        <div className="past-prescriptions-panel">
          <h3>Past Prescriptions</h3>

          {/* Search Input with Icon */}
          <div className="past-search-wrapper" ref={searchRef}>
            <div className="past-search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="past-search-input"
                placeholder="Search by Name, RX-ID, Date, Diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (!filteredPastPrescriptions.length) return;

                  if (e.key === "ArrowDown") {
                    setHighlightedIndex((prev) => (prev < filteredPastPrescriptions.length - 1 ? prev + 1 : prev));
                  } else if (e.key === "ArrowUp") {
                    setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                  } else if (e.key === "Enter") {
                    if (highlightedIndex >= 0) {
                      loadPastPrescription(filteredPastPrescriptions[highlightedIndex]);
                      setSearchTerm("");
                    }
                  }
                }}
              />

              {filteredPastPrescriptions.length > 0 && searchTerm && (
                <ul className="autocomplete active">
                  {filteredPastPrescriptions.map((p, index) => (
                    <li
                      key={p.id}
                      className={highlightedIndex === index ? "highlighted" : ""}
                      onClick={() => {
                        loadPastPrescription(p);
                        setSearchTerm("");
                      }}
                    >
                      {p.name || "Unnamed"} | {p.diagnosis?.filter((d) => d.trim()).join(", ") || "-"} | {new Date(p.createdAt || p.savedAt).toLocaleDateString()} | {p.rxId}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Prescription List */}
          {filteredPastPrescriptions.length === 0 && searchTerm ? (
            <p>No matching prescriptions</p>
          ) : (
            <ul>
              {filteredPastPrescriptions.map((p) => (
                <li key={p.id} className="past-item">
                  <button
                    className="past-btn"
                    onClick={() => {
                      loadPastPrescription(p);
                      setShowPast(false);
                    }}
                  >
                    {p.name || "Unnamed"} | {p.diagnosis?.filter((d) => d.trim()).join(", ") || "-"} | {new Date(p.createdAt || p.savedAt).toLocaleDateString()} | {p.rxId}
                  </button>
                  <button className="btn danger small" onClick={() => deletePrescription(p.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default FooterActions;
