// src/App.jsx
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

import {
  addPrescription,
  getAllPrescriptions,
  deletePrescription as dbDeletePrescription,
} from "./DB/db.js"; // centralized DB functions

export default function App() {
  const [activated, setActivated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const active = await isActivated();
        setActivated(active);
      } catch (err) {
        console.error("Activation check failed:", err);
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

  // Load prescriptions from centralized DB
  const loadPastPrescriptions = async () => {
    try {
      const all = await getAllPrescriptions();
      setPastPrescriptions(all || []);
    } catch (err) {
      console.error("Failed to load prescriptions:", err);
      setPastPrescriptions([]);
    }
  };

  useEffect(() => {
    loadPastPrescriptions();
  }, []);

  // Save a prescription (uses centralized addPrescription)
  const savePrescription = async (record) => {
    try {
      const res = await addPrescription(record);
      // refresh list
      await loadPastPrescriptions();
      return res;
    } catch (err) {
      console.error("Failed to save prescription:", err);
      throw err;
    }
  };

  // Delete a prescription (uses centralized delete)
  const deletePrescription = async (id) => {
    try {
      await dbDeletePrescription(id);
      await loadPastPrescriptions();
    } catch (err) {
      console.error("Failed to delete prescription:", err);
    }
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

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
