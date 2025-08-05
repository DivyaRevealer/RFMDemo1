import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RFMTable = () => {
  const [data, setData] = useState([]);
  const [segment, setSegment] = useState("All");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRFM = async () => {
    const res = await axios.get("http://localhost:8000/rfm");
    setData(res.data);
  };

  useEffect(() => {
    loadRFM();
  }, []);

  const filtered = segment === "All" ? data : data.filter(d => d.Segment === segment);

  const sendCampaign = async (seg) => {
    setLoading(true);
    const res = await fetch(`http://localhost:8000/campaign/${seg}`, {
      method: "POST"
    });
    const result = await res.json();
    setStatus(result.status);
    setLoading(false);
  };

  return (
    <div>
      <label>Filter Segment: </label>
      <select onChange={e => setSegment(e.target.value)} value={segment}>
        <option>All</option>
        <option>Champions</option>
        <option>Loyal</option>
        <option>Potential</option>
        <option>At Risk</option>
        <option>Lost</option>
      </select>

      <button onClick={() => window.open("http://localhost:8000/export", "_blank")}>
        Export to Excel
      </button>

      {["Champions", "Loyal", "Potential", "At Risk", "Lost"].map(seg => (
        <button
          key={seg}
          onClick={() => sendCampaign(seg)}
          disabled={loading}
          style={{ marginLeft: "10px" }}
        >
          {loading ? "Sending..." : `Trigger ${seg} Campaign`}
        </button>
      ))}

      {status && <p style={{ color: "green" }}>{status}</p>}

      {filtered.length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
          <thead>
            <tr>{Object.keys(filtered[0]).map(key => <th key={key}>{key}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RFMTable;
