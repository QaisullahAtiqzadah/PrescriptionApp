import "../App.css";

function Advice({ data, onChange }) {
  return (
    <section className="section">
      <h2>Advice / Instructions</h2>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {/* Advice text */}
        <textarea
          className="textarea"
          style={{ flex: 2 }}
          value={data.advice}
          onChange={(e) => onChange("advice", e.target.value)}
          placeholder="Enter general advice here.."
        />

        {/* Next visit */}
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: "bold" }}>Next Visit (days)</label>
          <input
            type="number"
            className="input"
            value={data.nextVisit}
            onChange={(e) => onChange("nextVisit", e.target.value)}
            placeholder="e.g. 7"
            min="1"
          />
        </div>
      </div>
    </section>
  );
}

export default Advice;
