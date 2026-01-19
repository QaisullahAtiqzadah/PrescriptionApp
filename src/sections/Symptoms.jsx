import { useState, useEffect } from "react";
import "../App.css";
import symptomsList from "../Dtata/Symptoms.json";

function Symptoms({ data, onChange, setValid }) {
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focusedRow, setFocusedRow] = useState(null);

  /* ---------- VALIDATION ---------- */
  const isValidSymptom = (value) => {
    if (!value.trim()) return false;
    if (/\d/.test(value)) return false;
    if (value.trim().length < 3) return false;
    return true;
  };

  useEffect(() => {
    const newErrors = {};
    data.symptoms.forEach((s, i) => {
      newErrors[i] = !isValidSymptom(s);
    });
    setErrors(newErrors);

    const filled = data.symptoms.filter((s) => s.trim() !== "");
    setValid(filled.length > 0 && filled.every(isValidSymptom));
  }, [data.symptoms, setValid]);

  /* ---------- AUTOCOMPLETE ---------- */
  const filterSymptoms = (query) => {
    if (!query || query.length < 2) return [];
    return symptomsList
      .filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6);
  };

  const handleChange = (index, value) => {
    value = value.replace(/\d/g, "");

    const updated = [...data.symptoms];
    updated[index] = value;

    if (
      index === updated.length - 1 &&
      value.trim().length >= 3
    ) {
      updated.push("");
    }

    onChange("symptoms", updated);

    setFocusedRow(index);
    setSuggestions(filterSymptoms(value));
    setActiveIndex(-1);
  };

  const selectSymptom = (index, value) => {
    const updated = [...data.symptoms];
    updated[index] = value;
    onChange("symptoms", updated);

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
        activeIndex >= 0
          ? suggestions[activeIndex]
          : suggestions[0];

      selectSymptom(index, selected);
      return;
    }

    if (e.key === "Escape") {
      setSuggestions([]);
      setFocusedRow(null);
      setActiveIndex(-1);
    }
  };

  const handleDelete = () => {
    if (data.symptoms.length > 1) {
      onChange("symptoms", data.symptoms.slice(0, -1));
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <section className="section">
      <h2>Symptoms</h2>

      {data.symptoms.map((symptom, index) => (
        <div
          key={index}
          className="row-wrapper"
          style={{ position: "relative" }}
        >
          <input
            className="input"
            value={symptom}
            placeholder="Enter symptom"
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setFocusedRow(index)}
            autoComplete="off"
          />

          {errors[index] && (
            <span style={{ color: "red", fontWeight: "bold" }}>
              *
            </span>
          )}

          {focusedRow === index && suggestions.length > 0 && (
            <ul className="autocomplete">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className={i === activeIndex ? "active" : ""}
                  onMouseDown={() => selectSymptom(index, s)}
                >
                  {s}
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

export default Symptoms;
