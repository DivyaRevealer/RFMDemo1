import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RFMTable = () => {
  const [data, setData] = useState([]);
  const [segment, setSegment] = useState("All");

  const loadRFM = async () => {
    const res = await axios.get("http://localhost:8000/rfm");
    setData(res.data);
  };

  useEffect(() => {
    loadRFM();
  }, []);

  const filtered = segment === "All" ? data : data.filter(d => d.Segment === segment);

  return (
    <div>
      <label>Filter Segment: </label>
      <select onChange={e => setSegment(e.target.value)}>
        <option>All</option>
        <option>Champions</option>
        <option>Loyal</option>
        <option>Potential</option>
        <option>At Risk</option>
        <option>Lost</option>
      </select>

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
      <button onClick={() => window.open("http://localhost:8000/export", "_blank")}>Export to Excel</button>
      {["Champions", "Loyal", "Potential", "At Risk", "Lost"].map(seg => (
      <button key={seg} style={{ marginLeft: "10px" }}
        onClick={() => fetch(`http://localhost:8000/campaign/${seg}`, { method: "POST" }).then(() => alert(`Campaign sent to ${seg}`))}>
        Trigger {seg} Campaign
      </button>
    ))}

    </div>
  );
};

export default RFMTable;
