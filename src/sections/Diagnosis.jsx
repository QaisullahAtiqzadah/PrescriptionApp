import { useEffect, useState } from "react";
import "../App.css";
import diagnosisList from "../Dtata/Diagnosis.json"; // your JSON with {name, shortcut}

function Diagnosis({ data, onChange, setValid }) {
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focusedRow, setFocusedRow] = useState(null);

  /* ---------- VALIDATION ---------- */
  const isValidDiagnosis = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 3) return false;
    if (/\d/.test(trimmed)) return false;
    return true;
  };

  useEffect(() => {
    const newErrors = {};
    data.diagnosis.forEach((d, i) => {
      newErrors[i] = !isValidDiagnosis(d);
    });
    setErrors(newErrors);

    const filled = data.diagnosis.filter((d) => d.trim() !== "");
    setValid(filled.length > 0 && filled.every(isValidDiagnosis));
  }, [data.diagnosis, setValid]);

  /* ---------- AUTOCOMPLETE ---------- */
  const filterDiagnosis = (query) => {
    if (!query || query.trim().length < 2) return [];

    const q = query.toLowerCase();

    return diagnosisList
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.shortcut.toLowerCase().includes(q)
      )
      .slice(0, 6); // limit suggestions
  };

  const handleChange = (index, value) => {
    value = value.replace(/\d/g, ""); // remove numbers

    const updated = [...data.diagnosis];
    updated[index] = value;

    // Add new empty textarea if last filled
    if (index === updated.length - 1 && value.trim().length >= 3) {
      updated.push("");
    }

    onChange("diagnosis", updated);

    setFocusedRow(index);
    setSuggestions(filterDiagnosis(value));
    setActiveIndex(-1);
  };

  const selectDiagnosis = (index, diagnosis) => {
    const updated = [...data.diagnosis];
    updated[index] = `${diagnosis.name} (${diagnosis.shortcut})`;

    onChange("diagnosis", updated);

    setSuggestions([]);
    setFocusedRow(null);
    setActiveIndex(-1);
  };

  /* ---------- KEYBOARD CONTROL ---------- */
  const handleKeyDown = (e, index) => {
    if (focusedRow !== index || !suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected =
        activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      if (selected) selectDiagnosis(index, selected);
      return;
    }

    if (e.key === "Escape") {
      setSuggestions([]);
      setFocusedRow(null);
      setActiveIndex(-1);
    }
  };

  const handleDelete = () => {
    if (data.diagnosis.length > 1) {
      onChange("diagnosis", data.diagnosis.slice(0, -1));
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <section className="section">
      <h2>Diagnosis</h2>

      {data.diagnosis.map((item, index) => (
        <div
          key={index}
          className="row-wrapper"
          style={{ position: "relative" }}
        >
          <textarea
            className="textarea"
            value={item}
            placeholder="Enter diagnosis"
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setFocusedRow(index)}
          />

          {errors[index] && (
            <span style={{ color: "red", fontWeight: "bold" }}>*</span>
          )}

          {focusedRow === index && suggestions.length > 0 && (
            <ul className="autocomplete">
              {suggestions.map((d, i) => (
                <li
                  key={`${d.shortcut}-${i}`}
                  className={i === activeIndex ? "active" : ""}
                  onMouseDown={() => selectDiagnosis(index, d)}
                >
                  {d.name} <strong>({d.shortcut})</strong>
                </li>
              ))}
            </ul>
          )}

          {index === 0 && (
            <button className="btn danger" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      ))}
    </section>
  );
}

export default Diagnosis;
