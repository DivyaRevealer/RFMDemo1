
// import React from "react";

// function Dashboard() {
//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>📊 Dashboard</h1>
//       <p>Welcome to your RFM Analysis Dashboard.</p>
//     </div>
//   );
// }

// export default Dashboard;

//import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Button } from 'antd';
//import 'antd/dist/antd.css';
import './Dashboard.css';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#4CAF50', '#8BC34A', '#FFC107', '#FF5722'];

// Sample Data
// const metricData = {
//   totalCustomers: 26533,
//   unitsPerTxn: 5.41,
//   profitPerCustomer: 2170.65,
//   customerSpending: 5435.15,
//   daysToReturn: 128.75,
//   retentionRate: 30.87,
// };

// const pieDataR = [
//   { name: '4', value: 5307 },
//   { name: '3', value: 5306 },
//   { name: '2', value: 5439 },
//   { name: '1', value: 5174 },
// ];
// const pieDataF = [
//   { name: '4', value: 2106 },
//   { name: '3', value: 1869 },
//   { name: '2', value: 4607 },
//   { name: '1', value: 16402 },
// ];
// const pieDataM = [
//   { name: '4', value: 5306 },
//   { name: '3', value: 5307 },
//   { name: '2', value: 5439 },
//   { name: '1', value: 5174 },
// ];

// const barDataR = [
//   { bucket: '1-200', value: 5050 },
//   { bucket: '200-400', value: 4421 },
//   { bucket: '400-600', value: 3431 },
//   { bucket: '600-800', value: 2454 },
//   { bucket: '800-1000', value: 3082 },
//   { bucket: '>1000', value: 8095 },
// ];
// const barDataVisits = [
//   { visits: '1', value: 16402 },
//   { visits: '2', value: 4607 },
//   { visits: '3', value: 2106 },
//   { visits: '4', value: 1163 },
//   { visits: '5', value: 706 },
//   { visits: '6', value: 1549 },
// ];
// const barDataValue = [
//   { range: '1-1000', value: 6100 },
//   { range: '1000-2000', value: 5516 },
//   { range: '2000-3000', value: 3442 },
//   { range: '3000-4000', value: 2277 },
//   { range: '4000-5000', value: 1728 },
//   { range: '>5000', value: 7470 },
// ];

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  const [metricData, setMetricData] = useState({
    totalCustomers: 0,
    unitsPerTxn: 0,
    profitPerCustomer: 0,
    customerSpending: 0,
    daysToReturn: 0,
    retentionRate: 0,
  });
  const [pieDataR, setPieDataR] = useState([]);
  const [pieDataF, setPieDataF] = useState([]);
  const [pieDataM, setPieDataM] = useState([]);
  const [barDataR, setBarDataR] = useState([]);
  const [barDataVisits, setBarDataVisits] = useState([]);
  const [barDataValue, setBarDataValue] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/dashboard/')
      .then((res) => res.json())
      .then((rows) => computeMetrics(rows))
      .catch((err) => console.error('Failed to fetch dashboard data', err));
  }, []);

  const computeMetrics = (rows) => {
    const totalCustomers = rows.length;
    const totalItems = rows.reduce((sum, r) => sum + (r.NO_OF_ITEMS || 0), 0);
    const totalTransactions = rows.reduce((sum, r) => sum + (r.F_VALUE || 0), 0);
    const unitsPerTxn = totalTransactions ? (totalItems / totalTransactions).toFixed(2) : 0;
    const profitPerCustomer = totalCustomers ? (rows.reduce((s, r) => s + parseFloat(r.GROSS_PROFIT || 0), 0) / totalCustomers).toFixed(2) : 0;
    const customerSpending = totalCustomers ? (rows.reduce((s, r) => s + (r.M_VALUE || 0), 0) / totalCustomers).toFixed(2) : 0;
    const daysToReturn = totalCustomers ? (rows.reduce((s, r) => s + (r.DAYS || 0), 0) / totalCustomers).toFixed(2) : 0;
    const retentionRate = totalCustomers ? ((rows.filter((r) => (r.F_VALUE || 0) > 1).length / totalCustomers) * 100).toFixed(2) : 0;
    setMetricData({ totalCustomers, unitsPerTxn, profitPerCustomer, customerSpending, daysToReturn, retentionRate });

    const rScoreCounts = countBy(rows, 'R_SCORE');
    setPieDataR(objectToArray(rScoreCounts));
    const fScoreCounts = countBy(rows, 'F_SCORE');
    setPieDataF(objectToArray(fScoreCounts));
    const mScoreCounts = countBy(rows, 'M_SCORE');
    setPieDataM(objectToArray(mScoreCounts));

    const rBuckets = { '1-200': 0, '200-400': 0, '400-600': 0, '600-800': 0, '800-1000': 0, '>1000': 0 };
    rows.forEach((r) => {
      const v = r.R_VALUE || 0;
      if (v <= 200) rBuckets['1-200']++;
      else if (v <= 400) rBuckets['200-400']++;
      else if (v <= 600) rBuckets['400-600']++;
      else if (v <= 800) rBuckets['600-800']++;
      else if (v <= 1000) rBuckets['800-1000']++;
      else rBuckets['>1000']++;
    });
    setBarDataR(objectEntriesToArray(rBuckets, 'bucket'));

    const visitsCounts = {};
    rows.forEach((r) => {
      const v = r.F_VALUE || 0;
      visitsCounts[v] = (visitsCounts[v] || 0) + 1;
    });
    setBarDataVisits(objectEntriesToArray(visitsCounts, 'visits'));

    const valueBuckets = { '1-1000': 0, '1000-2000': 0, '2000-3000': 0, '3000-4000': 0, '4000-5000': 0, '>5000': 0 };
    rows.forEach((r) => {
      const v = r.M_VALUE || 0;
      if (v <= 1000) valueBuckets['1-1000']++;
      else if (v <= 2000) valueBuckets['1000-2000']++;
      else if (v <= 3000) valueBuckets['2000-3000']++;
      else if (v <= 4000) valueBuckets['3000-4000']++;
      else if (v <= 5000) valueBuckets['4000-5000']++;
      else valueBuckets['>5000']++;
    });
    setBarDataValue(objectEntriesToArray(valueBuckets, 'range'));
  };

  const countBy = (rows, key) => {
    const counts = {};
    rows.forEach((r) => {
      const v = r[key];
      counts[v] = (counts[v] || 0) + 1;
    });
    return counts;
  };

  const objectToArray = (obj) => Object.entries(obj).map(([name, value]) => ({ name: String(name), value }));

  const objectEntriesToArray = (obj, keyName) =>
    Object.entries(obj).map(([key, value]) => ({ [keyName]: String(key), value }));

  return (
    <div className="rfm-dashboard">
      {/* Filters */}
      <div className="filters">
        <RangePicker />
        <Select placeholder="Customer Mobile No" className="filter-select">
          <Option value="all">All</Option>
        </Select>
        <Select placeholder="Customer Name" className="filter-select">
          <Option value="all">All</Option>
        </Select>
        <Select placeholder="R Value Bucket" className="filter-select">
          <Option value="all">All</Option>
        </Select>
        <Select placeholder="F Value Bucket" className="filter-select">
          <Option value="all">All</Option>
        </Select>
        <Select placeholder="M Value Bucket" className="filter-select">
          <Option value="all">All</Option>
        </Select>
        <Button type="primary">Apply Filter</Button>
      </div>

      {/* Metric Cards */}
      <div className="metrics">
        <div className="metric-card">
          <h3>Total Customer</h3>
          <p>{metricData.totalCustomers.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <h3>Unit Per Transaction</h3>
          <p>{metricData.unitsPerTxn}</p>
        </div>
        <div className="metric-card">
          <h3>Profit Per Customer</h3>
          {/* <p>{metricData.profitPerCustomer.toLocaleString()}</p> */}
           <p>{metricData.profitPerCustomer}</p>
        </div>
        <div className="metric-card">
          <h3>Customer Spending</h3>
          {/* <p>{metricData.customerSpending.toLocaleString()}</p> */}
          <p>{metricData.customerSpending}</p>
        </div>
        <div className="metric-card">
          <h3>Days to Return</h3>
          <p>{metricData.daysToReturn}</p>
        </div>
        <div className="metric-card">
          <h3>Retention Rate</h3>
          <p>{metricData.retentionRate}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="chart-container">
          <h4>Total Customer by R Score</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieDataR} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} label>
                {pieDataR.map((entry, index) => (
                  // <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  <Cell key={`cell-r-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4>Total Customer by F Score</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieDataF} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} label>
                {pieDataF.map((entry, index) => (
                  // <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   <Cell key={`cell-f-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4>Total Customer by M Score</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieDataM} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} label>
                {pieDataM.map((entry, index) => (
                  // <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   <Cell key={`cell-m-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4>Total Customer by R Value Bucket (Days)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barDataR} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="bucket" type="category" />
              <Tooltip />
              <Bar dataKey="value">
                {barDataR.map((entry, index) => (
                  <Cell key={`cell-bar-r-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4>Total Customer by No. of Visits</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barDataVisits} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="visits" type="category" />
              <Tooltip />
              <Bar dataKey="value">
                {barDataVisits.map((entry, index) => (
                  <Cell key={`cell-bar-v-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h4>Total Customer by Value</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barDataValue} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="range" type="category" />
              <Tooltip />
              <Bar dataKey="value">
                {barDataValue.map((entry, index) => (
                  <Cell key={`cell-bar-val-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

