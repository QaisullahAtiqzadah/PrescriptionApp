import { useState, useEffect, useRef, useMemo } from "react";
import "../App.css";
import logo from "../assets/logo.svg"; // local logo
import { generateRxId } from "../utils/rxId.js";
import QRcode from "qrcode";
import { getNextAppointmentDate } from "../utils/date";
import { FaSearch } from "react-icons/fa";
import { generateFooterActionHtml } from "../components/HTMLhelper.js";

function FooterActions({
  patient,
  onClear,
  patientInfoValid,
  symptomsValid,
  diagnosisValid,
  pastPrescriptions,
  loadPastPrescription,
  savePrescription,
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

  const generateQRCode = async (text, size = 100) => {
    try {
      return await QRcode.toDataURL(text, { width: size, margin: 0 });
    } catch (err) {
      console.error("QR Code generation error:", err);
      return "";
    }
  };

  const filteredPastPrescriptions = useMemo(() => {
    if (!searchTerm.trim()) return pastPrescriptions;
    const term = searchTerm.toLowerCase();
    return pastPrescriptions
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

  const printPrescription = async () => {
    const { date, time } = getDateTime();
    const rxId = generateRxId(patient);
    const nextVisitDate = patient.nextVisit
      ? getNextAppointmentDate(patient.nextVisit)
      : "-";

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
    }

    const htmlContent = generateFooterActionHtml({
      patient,
      logo,
      rxId,
      date,
      time,
      qrDataUrl,
    });

    const win = window.open("", "_blank");
    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
      setSaving(false);
    };
  };

  const handlePrintAndSave = async () => {
    if (!patientInfoValid || !symptomsValid || !diagnosisValid) {
      alert("Please fill all required fields before saving/printing.");
      return;
    }

    setSaving(true);
    try {
      const rxId = generateRxId(patient);
      const isDuplicate = pastPrescriptions.some((p) => p.rxId === rxId);

      if (!isDuplicate) {
        const newRecord = { ...patient, rxId, createdAt: new Date().toISOString() };
        await savePrescription(newRecord);
      }

      await printPrescription();
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving or printing the prescription.");
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the form?")) onClear();
  };

  return (
    <section className="section">
      <div className="footer-actions">
        <button
          className={`btn primary ${saving ? "saving" : ""}`}
          onClick={handlePrintAndSave}
        >
          {saving ? "Saving..." : "Save & Print Prescription"}
        </button>

        <button className="btn secondary" onClick={() => setShowPast(!showPast)}>
          {showPast ? "Close Past Prescriptions" : "Show Past Prescriptions"}
        </button>

        <button className="btn danger" onClick={handleClear}>
          Clear Form
        </button>
      </div>

      {showPast && (
        <div className="past-prescriptions-panel">
          <h3>Past Prescriptions</h3>

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
                    setHighlightedIndex((prev) =>
                      prev < filteredPastPrescriptions.length - 1 ? prev + 1 : prev
                    );
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
                  {filteredPastPrescriptions.map((p, idx) => (
                    <li
                      key={p.id}
                      className={highlightedIndex === idx ? "highlighted" : ""}
                      onClick={() => {
                        loadPastPrescription(p);
                        setSearchTerm("");
                      }}
                    >
                      {p.name || "Unnamed"} |{" "}
                      {p.diagnosis?.filter((d) => d.trim()).join(", ") || "-"} |{" "}
                      {new Date(p.createdAt || p.savedAt).toLocaleDateString()} |{" "}
                      {p.rxId}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

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
                    {p.name || "Unnamed"} |{" "}
                    {p.diagnosis?.filter((d) => d.trim()).join(", ") || "-"} |{" "}
                    {new Date(p.createdAt || p.savedAt).toLocaleDateString()} |{" "}
                    {p.rxId}
                  </button>
                  <button
                    className="btn danger small"
                    onClick={() => deletePrescription(p.id)}
                  >
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
