import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SegmentChart = () => {
  const [segmentCounts, setSegmentCounts] = useState({});

  useEffect(() => {
    axios.get("http://localhost:8000/rfm").then(res => {
      const counts = {};
      res.data.forEach(row => {
        counts[row.Segment] = (counts[row.Segment] || 0) + 1;
      });
      setSegmentCounts(counts);
    });
  }, []);

  const data = {
    labels: Object.keys(segmentCounts),
    datasets: [
      {
        label: "Customer Segments",
        data: Object.values(segmentCounts),
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#66BB6A', '#AB47BC']
      }
    ]
  };

  return (
    <div style={{ maxWidth: "300px", margin: "auto" }}>
      <Pie data={data} />
    </div>
  );
};

export default SegmentChart;
