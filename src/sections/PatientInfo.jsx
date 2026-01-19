import { useState, useEffect } from "react";
import "../App.css";



function PatientInfo({ data, onChange, setValid }) {
  const [errors, setErrors] = useState({
    name: false,
    age: false,
    gender: false,
    disability: false,
    weight: false,
  });

  useEffect(() => {
  if (data.gender !== "Female") {
    onChange("pregnant", false);
    onChange("lactating", false);
  }
}, [data.gender]);


  useEffect(() => {
    const newErrors = {
      name: false,
      age: false,
      gender: false,
      disability: false,
      weight: false,
    };

    // ===== Name validation =====
    if (!data.name.trim() || data.name.trim().length < 3 || /\d/.test(data.name)) {
      newErrors.name = true;
    }

    // ===== Age validation =====
    const ageValue = parseFloat(data.age);
    if (
      data.age === "" ||
      isNaN(ageValue) ||
      ageValue <= 0 ||
      (ageValue > 0 && ageValue < 1 && Number((data.age.split(".")[1] || "0")) > 11)
    ) {
      newErrors.age = true;
    }

    // ===== Gender validation =====
    if (!data.gender) newErrors.gender = true;

    // ===== Disability validation =====
    if (!data.disability) newErrors.disability = true;

    // ===== Weight validation =====
    const weightValue = parseFloat(data.weight);
    if (!data.weight || isNaN(weightValue) || weightValue <= 0) {
      newErrors.weight = true;
    }

    setErrors(newErrors);

    setValid(
      !newErrors.name &&
        !newErrors.age &&
        !newErrors.gender &&
        !newErrors.disability &&
        !newErrors.weight
    );
  }, [data, setValid]);

  const handleAgeChange = (value) => {
    let sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) sanitized = parts[0] + "." + parts[1];
    onChange("age", sanitized);
  };

  const handleNameChange = (value) => {
    const sanitized = value.replace(/[^a-zA-Z\s]/g, "");
    onChange("name", sanitized);
  };

  const handleWeightChange = (value) => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    onChange("weight", sanitized);
  };

  const getAgeSuffix = () => {
    const ageNum = parseFloat(data.age);
    if (isNaN(ageNum) || ageNum <= 0) return "";
    if (ageNum > 0 && ageNum < 1) {
      const decimal = data.age.split(".")[1] || "0";
      return Number(decimal) === 1 ? "Month" : "Months";
    }
    return ageNum === 1 ? "Year" : "Years";
  };

  return (
    <section className="section">
      <h2>Patient Information</h2>

      {/* Name field */}
      <div className="form-group">
        <label>
          Patient Name {errors.name && <span style={{ color: "red" }}>*</span>}
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="input"
        />
      </div>

      {/* Row with Age, Gender, Disability, Weight */}
      <div
        className="form-row"
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        {/* Age */}
        <div className="form-group" style={{ position: "relative", flex: "1 1 120px" }}>
          <label>
            Age {errors.age && <span style={{ color: "red" }}>*</span>}
          </label>
          <input
            type="text"
            value={data.age}
            onChange={(e) => handleAgeChange(e.target.value)}
            className="input"
            style={{ paddingRight: "60px" }}
          />
          <span
            className="age-unit"
          >
            {getAgeSuffix()}
          </span>
        </div>

        {/* Gender */}
        <div className="form-group" style={{ flex: "1 1 120px" }}>
          <label>
            Gender {errors.gender && <span style={{ color: "red" }}>*</span>}
          </label>
          <select
            value={data.gender}
            onChange={(e) => onChange("gender", e.target.value)}
            className="select"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Disability */}
        <div className="form-group" style={{ flex: "1 1 120px" }}>
          <label>
            Disability {errors.disability && <span style={{ color: "red" }}>*</span>}
          </label>
          <select
            value={data.disability || ""}
            onChange={(e) => onChange("disability", e.target.value)}
            className="select"
          >
            <option value="">Select</option>
            <option value="None">None</option>
            <option value="Physical">Physical</option>
            <option value="Visual">Visual</option>
            <option value="Hearing">Hearing</option>
            <option value="Mental">Mental</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Weight */}
        <div className="form-group" style={{ flex: "1 1 120px" }}>
          <label>
            Weight (Kg) {errors.weight && <span style={{ color: "red" }}>*</span>}
          </label>
          <input
            type="text"
            value={data.weight || ""}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Female-specific inline fields */}
  {/* Married / Female-specific fields */}
{data.gender && (
  <div
    style={{
      marginTop: "10px",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      flexWrap: "wrap",
    }}
  >
    <label>
      <input
        type="checkbox"
        checked={data.married || false}
        onChange={(e) => onChange("married", e.target.checked)}
      />{" "}
      Married
    </label>

    {data.gender === "Female" && data.married && (
      <>
        <label>
          <input
            type="checkbox"
            checked={data.pregnant || false}
            onChange={(e) => onChange("pregnant", e.target.checked)}
          />{" "}
          Pregnant
        </label>

        <label>
          <input
            type="checkbox"
            checked={data.lactating || false}
            onChange={(e) => onChange("lactating", e.target.checked)}
          />{" "}
          Lactating
        </label>
      </>
    )}
  </div>
)}

    </section>
  );
}

export default PatientInfo;
