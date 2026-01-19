import "../App.css";

function VitalSign({ data, onChange }) {
  return (
    <section className="section">
      <h2>Vital Signs</h2>

      <div
        className="form-row"
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        {/* Blood Pressure */}
        <div className="form-group" style={{ flex: "1 1 150px" }}>
          <label>BP (mmHg)</label>
          <input
            type="text"
            className="input"
            placeholder="120/80"
            value={data.bp || ""}
            onChange={(e) => onChange("bp", e.target.value)}
          />
        </div>

        {/* Pulse Rate */}
        <div className="form-group" style={{ flex: "1 1 150px" }}>
          <label>PR (bpm)</label>
          <input
            type="number"
            className="input"
            placeholder="72"
            value={data.pr || ""}
            onChange={(e) => onChange("pr", e.target.value)}
          />
        </div>

        {/* Respiratory Rate */}
        <div className="form-group" style={{ flex: "1 1 150px" }}>
          <label>RR (breaths/min)</label>
          <input
            type="number"
            className="input"
            placeholder="16"
            value={data.rr || ""}
            onChange={(e) => onChange("rr", e.target.value)}
          />
        </div>

        {/* Temperature */}
        <div className="form-group" style={{ flex: "1 1 150px" }}>
          <label>Temp (°C)</label>
          <input
            type="number"
            step="0.1"
            className="input"
            placeholder="36.7"
            value={data.temp || ""}
            onChange={(e) => onChange("temp", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

export default VitalSign;
