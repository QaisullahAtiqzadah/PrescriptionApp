import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import drugs from "../Dtata/who-eml.json";
import notesList from "../Dtata/NotesEG.json"; // new JSON for notes autocomplete

function Medications({ data, onChange }) {
  const [errors, setErrors] = useState([]);
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [notesSuggestions, setNotesSuggestions] = useState([]);
  const [activeDrugIndex, setActiveDrugIndex] = useState(-1);
  const [activeNotesIndex, setActiveNotesIndex] = useState(-1);
  const [focusedDrugRow, setFocusedDrugRow] = useState(null);
  const [focusedNotesRow, setFocusedNotesRow] = useState(null);

  const doseRefs = useRef({});

  /* ---------------- CLOSE SUGGESTIONS ON CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const handleClickOutside = () => {
      setDrugSuggestions([]);
      setNotesSuggestions([]);
      setFocusedDrugRow(null);
      setFocusedNotesRow(null);
      setActiveDrugIndex(-1);
      setActiveNotesIndex(-1);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /* ---------------- VALIDATION ---------------- */
  useEffect(() => {
    const newErrors = data.medications.map((med) => ({
      name: !(med.name || "").trim(),
      doseValue: !(med.doseValue || "").trim(),
      doseUnit: !med.doseUnit,
      frequency: !(med.frequency || "").trim(),
      duration: !(med.duration || "").trim(),
      usage: !med.usage,
      notes: !(med.notes || "").trim(),
    }));
    setErrors(newErrors);
  }, [data.medications]);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (index, field, value) => {
    const updated = [...data.medications];
    updated[index][field] = value;

    // Auto-add new row if last row is filled
    const last = updated[updated.length - 1];
    if (
      index === updated.length - 1 &&
      (last.name || "").trim() &&
      (last.doseValue || "").trim() &&
      last.doseUnit &&
      (last.frequency || "").trim() &&
      (last.duration || "").trim() &&
      last.usage
    ) {
      updated.push({
        name: "",
        form: "",
        doseValue: "",
        doseUnit: "",
        frequency: "",
        duration: "",
        usage: "",
        notes: "",
      });
    }

    onChange("medications", updated);
  };

  /* ---------------- DRUG AUTOCOMPLETE ---------------- */
  const filterDrugs = (query) => {
    if (!query || query.length < 2) return [];
    return drugs
      .flatMap((d) =>
        d.variants.map((v) => ({
          label: v,
        }))
      )
      .filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);
  };

  const handleDrugInput = (index, value) => {
    handleChange(index, "name", value);
    setFocusedDrugRow(index);
    setDrugSuggestions(filterDrugs(value));
    setActiveDrugIndex(-1);
  };

  const selectDrug = (index, item) => {
    handleChange(index, "name", item.label);
    setDrugSuggestions([]);
    setFocusedDrugRow(null);
    setActiveDrugIndex(-1);
  };

  const handleDrugKeyDown = (e, rowIndex) => {
    if (focusedDrugRow !== rowIndex || !drugSuggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveDrugIndex((prev) =>
        prev < drugSuggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveDrugIndex((prev) =>
        prev > 0 ? prev - 1 : drugSuggestions.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeDrugIndex >= 0) selectDrug(rowIndex, drugSuggestions[activeDrugIndex]);
    }

    if (e.key === "Escape") {
      setDrugSuggestions([]);
      setFocusedDrugRow(null);
      setActiveDrugIndex(-1);
    }
  };

  /* ---------------- NOTES AUTOCOMPLETE ---------------- */
  const filterNotes = (query) => {
    if (!query || query.length < 2) return [];
    return notesList
      .filter((note) => note.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);
  };

  const handleNotesInput = (index, value) => {
    handleChange(index, "notes", value);
    setFocusedNotesRow(index);
    setNotesSuggestions(filterNotes(value));
    setActiveNotesIndex(-1);
  };

  const selectNote = (index, note) => {
    handleChange(index, "notes", note);
    setNotesSuggestions([]);
    setFocusedNotesRow(null);
    setActiveNotesIndex(-1);
  };

  const handleNotesKeyDown = (e, rowIndex) => {
    if (focusedNotesRow !== rowIndex || !notesSuggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveNotesIndex((prev) =>
        prev < notesSuggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveNotesIndex((prev) =>
        prev > 0 ? prev - 1 : notesSuggestions.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeNotesIndex >= 0) selectNote(rowIndex, notesSuggestions[activeNotesIndex]);
    }

    if (e.key === "Escape") {
      setNotesSuggestions([]);
      setFocusedNotesRow(null);
      setActiveNotesIndex(-1);
    }
  };

  /* ---------------- DELETE ROW ---------------- */
  const handleDelete = (index) => {
    if (data.medications.length > 1) {
      const updated = [...data.medications];
      updated.splice(index, 1);
      onChange("medications", updated);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <section className="section">
      <h2>Medications</h2>

      {data.medications.map((med, index) => (
        <div
          key={index}
          className="med-row"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginBottom: "12px",
            position: "relative",
          }}
        >
          {/* Upper line: Drug | Dose | Unit | Freq | Days | Usage */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* Drug */}
            <div style={{ flex: 2, position: "relative" }}>
              <input
                type="text"
                placeholder="Drug (generic)"
                value={med.name}
                autoComplete="off"
                className="input"
                onChange={(e) =>
                  handleDrugInput(
                    index,
                    e.target.value.replace(/[^a-zA-Z\s]/g, "")
                  )
                }
                onKeyDown={(e) => handleDrugKeyDown(e, index)}
                onFocus={() => setFocusedDrugRow(index)}
              />
              {med.form && (
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  {med.form}
                </div>
              )}
              {focusedDrugRow === index && drugSuggestions.length > 0 && (
                <ul className="autocomplete">
                  {drugSuggestions.map((d, i) => (
                    <li
                      key={i}
                      className={i === activeDrugIndex ? "active" : ""}
                      onClick={() => selectDrug(index, d)}
                    >
                      {d.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dose */}
            <input
              ref={(el) => (doseRefs.current[index] = el)}
              type="text"
              placeholder="Dose"
              value={med.doseValue || ""}
              className="input"
              style={{ width: "70px" }}
              onChange={(e) =>
                handleChange(index, "doseValue", e.target.value.replace(/[^0-9]/g, ""))
              }
            />

            {/* Unit */}
            <select
              value={med.doseUnit || ""}
              onChange={(e) => handleChange(index, "doseUnit", e.target.value)}
              className="select"
              style={{ width: "70px" }}
            >
              <option value="">Unit</option>
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="cc">cc</option>
              <option value="g">g</option>
              <option value="IU">IU</option>
            </select>

            {/* Frequency */}
            <select
              value={med.frequency}
              onChange={(e) => handleChange(index, "frequency", e.target.value)}
              className="select"
              style={{ width: "70px" }}
            >
              <option value="">Freq</option>
              <option value="OD">OD</option>
              <option value="BD">BD</option>
              <option value="TDS">TDS</option>
              <option value="QID">QID</option>
              <option value="HS">HS</option>
              <option value="PRN">PRN</option>
            </select>

            {/* Duration */}
            <input
              type="text"
              placeholder="Days"
              value={med.duration}
              className="input"
              style={{ width: "70px" }}
              onChange={(e) =>
                handleChange(index, "duration", e.target.value.replace(/[^0-9]/g, ""))
              }
            />

            {/* Usage */}
            <select
              value={med.usage || ""}
              onChange={(e) => handleChange(index, "usage", e.target.value)}
              className="select"
              style={{ width: "80px" }}
            >
              <option value="">Usage</option>
              <option value="Oral">Oral</option>
              <option value="IM">IM</option>
              <option value="IV">IV</option>
              <option value="SC">SC</option>
              <option value="Topical">Topical</option>
            </select>
          </div>

          {/* Lower line: Notes + Delete */}
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                placeholder="Notes (e.g. test before use)"
                value={med.notes || ""}
                className="input"
                onChange={(e) => handleNotesInput(index, e.target.value)}
                onKeyDown={(e) => handleNotesKeyDown(e, index)}
                onFocus={() => setFocusedNotesRow(index)}
              />
              {focusedNotesRow === index && notesSuggestions.length > 0 && (
                <ul className="autocomplete">
                  {notesSuggestions.map((note, i) => (
                    <li
                      key={i}
                      className={i === activeNotesIndex ? "active" : ""}
                      onClick={() => selectNote(index, note)}
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className="btn danger"
              onClick={() => handleDelete(index)}
              style={{ flexShrink: 0 }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Medications;
