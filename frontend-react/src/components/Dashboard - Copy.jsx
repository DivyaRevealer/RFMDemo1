
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
const metricData = {
  totalCustomers: 26533,
  unitsPerTxn: 5.41,
  profitPerCustomer: 2170.65,
  customerSpending: 5435.15,
  daysToReturn: 128.75,
  retentionRate: 30.87,
};

const pieDataR = [
  { name: '4', value: 5307 },
  { name: '3', value: 5306 },
  { name: '2', value: 5439 },
  { name: '1', value: 5174 },
];
const pieDataF = [
  { name: '4', value: 2106 },
  { name: '3', value: 1869 },
  { name: '2', value: 4607 },
  { name: '1', value: 16402 },
];
const pieDataM = [
  { name: '4', value: 5306 },
  { name: '3', value: 5307 },
  { name: '2', value: 5439 },
  { name: '1', value: 5174 },
];

const barDataR = [
  { bucket: '1-200', value: 5050 },
  { bucket: '200-400', value: 4421 },
  { bucket: '400-600', value: 3431 },
  { bucket: '600-800', value: 2454 },
  { bucket: '800-1000', value: 3082 },
  { bucket: '>1000', value: 8095 },
];
const barDataVisits = [
  { visits: '1', value: 16402 },
  { visits: '2', value: 4607 },
  { visits: '3', value: 2106 },
  { visits: '4', value: 1163 },
  { visits: '5', value: 706 },
  { visits: '6', value: 1549 },
];
const barDataValue = [
  { range: '1-1000', value: 6100 },
  { range: '1000-2000', value: 5516 },
  { range: '2000-3000', value: 3442 },
  { range: '3000-4000', value: 2277 },
  { range: '4000-5000', value: 1728 },
  { range: '>5000', value: 7470 },
];

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function Dashboard() {
  const [filters, setFilters] = useState({});
 
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
          <p>{metricData.customerSpending.toLocaleString()}</p>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

