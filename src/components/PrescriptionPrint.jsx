import React, { forwardRef } from "react";
import logo from "../assets/logo.svg";

const PrescriptionPrint = forwardRef(({ patient, date, time }, ref) => {
  const getAgeWithSuffix = () => {
    const ageNum = parseFloat(patient.age);
    if (isNaN(ageNum) || ageNum <= 0) return patient.age;
    if (ageNum < 1) {
      const months = patient.age.split(".")[1] || "0";
      return `${patient.age} ${Number(months) === 1 ? "Month" : "Months"}`;
    }
    return `${patient.age} ${ageNum === 1 ? "Year" : "Years"}`;
  };

  return (
    <div ref={ref} style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src={logo} alt="Clinic Logo" style={{ height: "80px" }} />
        <div style={{ textAlign: "center" }}>
          <h1>Good Health Clinic</h1>
          <p>Dr. John Doe, MBBS, MD</p>
          <p>123 Main Street | Phone: +123456789 | Email: clinic@example.com</p>
        </div>
      </div>

      <hr />

      <div>
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Age:</strong> {getAgeWithSuffix()}</p>
        <p><strong>Gender:</strong> {patient.gender}</p>
        <p><strong>Disability:</strong> {patient.disability}</p>
      </div>

      <hr />

      <h2>Diagnosis</h2>
      <ul>{patient.diagnosis.map(d => <li key={d}>{d}</li>)}</ul>

      <h2>Medications</h2>
      <ul>
        {patient.medications.map((m, i) => (
          <li key={i}>
            {m.form || "Tab"} {m.name} — {m.doseValue} {m.doseUnit}, {m.frequency}, {m.duration} days, Usage: {m.usage}
            <br />
            Notes: {m.notes || "-"}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "50px", textAlign: "center" }}>
        Doctor's Signature
      </div>
    </div>
  );
});

export default PrescriptionPrint;
