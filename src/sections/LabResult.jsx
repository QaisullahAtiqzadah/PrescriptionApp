import { useState, useEffect, useRef } from "react";
import labTests from "../Dtata/LabResult.json";
import "../App.css";

function LabResult({ data, onChange }) {
  const [results, setResults] = useState(data.labResults || [{ test: "", value: "" }]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestionRow, setSuggestionRow] = useState(null);

  const inputRefs = useRef([]);

  const updateResult = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = value;
    setResults(newResults);
    onChange("labResults", newResults);

    if (field === "test") {
      if (value.trim()) {
        const filtered = labTests.filter((t) =>
          t.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
        setSuggestionRow(index);
        setActiveIndex(0);
      } else {
        setSuggestions([]);
        setSuggestionRow(null);
      }
    }
  };

  const addResult = () => {
    setResults((prev) => [...prev, { test: "", value: "" }]);
  };

  const removeResult = (index) => {
    const newResults = results.filter((_, i) => i !== index);
    setResults(newResults.length ? newResults : [{ test: "", value: "" }]);
    onChange("labResults", newResults.length ? newResults : [{ test: "", value: "" }]);
  };

  const handleSuggestionClick = (index, value) => {
    updateResult(index, "test", value);
    setSuggestions([]);
    setSuggestionRow(null);
  };

  const handleKeyDown = (e, rowIndex) => {
    if (rowIndex !== suggestionRow) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= suggestions.length ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSuggestionClick(rowIndex, suggestions[activeIndex]);
        inputRefs.current[rowIndex]?.focus();
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSuggestionRow(null);
    }
  };

  // Auto-add new row when last row is typed in
  useEffect(() => {
    const last = results[results.length - 1];
    if (last.test || last.value) addResult();
  }, [results]);

  return (
    <section className="section">
      <h2>Lab Results</h2>
      {results.map((r, index) => (
        <div key={index} className="row-wrapper">
          <input
            className="input first-row-input"
            type="text"
            placeholder="Test name (e.g., Hb, FBS)"
            value={r.test}
            onChange={(e) => updateResult(index, "test", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputRefs.current[index] = el)}
          />

          <input
            className="input first-row-input"
            type="text"
            placeholder="Result / Value (e.g., 13 g/dL)"
            value={r.value}
            onChange={(e) => updateResult(index, "value", e.target.value)}
          />

          <button
            type="button"
            className="btn danger"
            onClick={() => removeResult(index)}
          >
            Delete
          </button>

          {/* Autocomplete suggestions */}
          {suggestionRow === index && suggestions.length > 0 && (
            <ul className="autocomplete">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className={i === activeIndex ? "active" : ""}
                  onMouseDown={() => handleSuggestionClick(index, s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

export default LabResult;
