import { useState, useEffect } from "react";
import PatientInfo from "./sections/PatientInfo";
import Symptoms from "./sections/Symptoms";
import Diagnosis from "./sections/Diagnosis";
import Medications from "./sections/Medications";
import Advice from "./sections/Advice";
import FooterActions from "./sections/FooterActions";
import VitalSign from "./sections/VitalSign";
import LabResult from "./sections/LabResult";
import Activate from "./Activate";
import { isActivated } from "./utils/activation.js";
import "./App.css";

// IndexedDB constants
const DB_NAME = "clinicDB";
const STORE_NAME = "prescriptions";
const DB_VERSION = 2;



// Open the prescriptions store
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export default function App() {
  const [activated, setActivated] = useState(null);
  const [loading, setLoading] = useState(true);


    useEffect(() => {
    (async () => {
      try {
        const active = await isActivated();
        setActivated(active);
      } catch {
        setActivated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "",
    disability: "",
    symptoms: [""],
    diagnosis: [""],
    medications: [{ name: "", doseValue: "", doseUnit: "", frequency: "", duration: "" }],
    advice: "",
    nextVisit: "",
    labResults: [{ test: "", value: "" }],
    vitalSigns: { bp: "", pr: "", rr: "", temp: "" },
  });

  const [pastPrescriptions, setPastPrescriptions] = useState([]);
  const [patientInfoValid, setPatientInfoValid] = useState(false);
  const [symptomsValid, setSymptomsValid] = useState(false);
  const [diagnosisValid, setDiagnosisValid] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  // Theme toggle
  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Check activation on mount
  useEffect(() => {
    (async () => {
      try {
        const active = await isActivated();
        setActivated(active); // true if already activated
      } catch {
        setActivated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load prescriptions from IndexedDB
  const loadPastPrescriptions = async () => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => setPastPrescriptions(req.result || []);
  };

  useEffect(() => {
    loadPastPrescriptions();
  }, []);

  // Save a prescription
  const savePrescription = async (record) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({ ...record, savedAt: new Date().toISOString() });
    tx.oncomplete = loadPastPrescriptions;
  };

  // Delete a prescription
  const deletePrescription = async (id) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = loadPastPrescriptions;
  };

  // Load a past prescription into the form
  const loadPastPrescription = ({ id, savedAt, ...clean }) => setPatient(clean);

  // Field handlers
  const handleFieldChange = (field, value) => setPatient((p) => ({ ...p, [field]: value }));
  const handleVitalChange = (field, value) =>
    setPatient((p) => ({ ...p, vitalSigns: { ...p.vitalSigns, [field]: value } }));
  const handleClear = () =>
    setPatient({
      name: "",
      age: "",
      gender: "",
      disability: "",
      symptoms: [""],
      diagnosis: [""],
      medications: [{ name: "", doseValue: "", doseUnit: "", frequency: "", duration: "" }],
      advice: "",
      labResults: [{ test: "", value: "" }],
      vitalSigns: { bp: "", pr: "", rr: "", temp: "" },
    });
     // Disable right-click and prevent inspect shortcuts
  useEffect(() => {
  const handleContextMenu = (e) => e.preventDefault();

  const handleKeyDown = (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
      (e.ctrlKey && e.key.toUpperCase() === "U")
    ) {
      e.preventDefault();
      alert("Inspect disabled!");
    }
  };

  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("keydown", handleKeyDown);

  // ✅ Cleanup function
  return () => {
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("keydown", handleKeyDown);
  };
}, []); // <-- this is correct, no trailing comma after []

  // Show loading or activation screen
  if (loading) return <p>Loading...</p>;
  if (!activated) return <Activate onActivated={() => setActivated(true)} />;

  // Main app content
  return (
    <div>
    <div className="theme-toggle">
  <input
    type="checkbox"
    id="toggle"
    checked={darkMode}
    onChange={() => setDarkMode(!darkMode)}
  />

  <label htmlFor="toggle" className="toggle-label">
    <div className="icons">
      <span className="sun">☀️</span>
      <span className="moon">🌙</span>
    </div>
    <div className="ball" />
  </label>
</div>


      <PatientInfo data={patient} onChange={handleFieldChange} setValid={setPatientInfoValid} />
      <Symptoms data={patient} onChange={handleFieldChange} setValid={setSymptomsValid} />
      <VitalSign data={patient.vitalSigns} onChange={handleVitalChange} />
      <Diagnosis data={patient} onChange={handleFieldChange} setValid={setDiagnosisValid} />
      <LabResult data={patient} onChange={handleFieldChange} />
      <Medications data={patient} onChange={handleFieldChange} />
      <Advice data={patient} onChange={handleFieldChange} />

      <FooterActions
        patient={patient}
        onClear={handleClear}
        patientInfoValid={patientInfoValid}
        symptomsValid={symptomsValid}
        diagnosisValid={diagnosisValid}
        pastPrescriptions={pastPrescriptions}
        loadPastPrescription={loadPastPrescription}
        savePrescription={savePrescription}
        deletePrescription={deletePrescription}
      />
    </div>
  );
}
