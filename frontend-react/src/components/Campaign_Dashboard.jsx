import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Select, Typography, Space, Button, Progress } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const { Option } = Select;
const { Title } = Typography;
import GaugeSpeedoMeter from "./GaugeSpeedoMeter";

export default function CampaignAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(id || null);

  // gradients
  const g = {
    blue:  "linear-gradient(90deg,#60a5fa,#2563eb)",
    green: "linear-gradient(90deg,#34d399,#10b981)",
    pink:  "linear-gradient(90deg,#f472b6,#ec4899)",
    gold:  "linear-gradient(90deg,#f59e0b,#fbbf24)",
    header:"linear-gradient(90deg,#6a11cb,#2575fc)",
  };
  const chip = (bg) => ({
    background: bg,
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 999,
    fontWeight: 700,
    display: "inline-block",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  });

  // ---- Hardcoded campaign list ----
  const campaigns = [
    { id: 1, name: "Diwali Mega Sale" },
    { id: 2, name: "Summer Bonanza" },
    { id: 3, name: "New Year Bash" }
  ];

 

const COLORS = ["#10b981", "#e5e7eb"]; // green for turnout, light gray for remaining


  // ---- Hardcoded campaign details ----
  const campaignDetails = {
    name: "Diwali Mega Sale",
    start_date: "2025-07-27",
    end_date: "2025-07-30",
    total_customers: 50000,
    shortlisted_count: 25000,
    turnout_count: 5000,
    revenue_total: 1200000,
    discount_total: 150000,
    broadcast_expenses: 80000,
    turnout_weeks: [1200, 800, 560, 380, 220, 480, 520, 620]
  };

  const M = useMemo(() => {
    const totalCustomers   = Number(campaignDetails.total_customers);
    const shortlisted      = Number(campaignDetails.shortlisted_count);
    const turnoutCustomers = Number(campaignDetails.turnout_count);
    //const turnoutPct       = totalCustomers ? Math.round((turnoutCustomers / totalCustomers) * 100) : 0;
    const turnoutPct = shortlisted ? Math.round((turnoutCustomers / shortlisted) * 100) : 0;

    const overallRevenue   = Number(campaignDetails.revenue_total);
    const campaignDiscount = Number(campaignDetails.discount_total);
    const broadcastExp     = Number(campaignDetails.broadcast_expenses);
    const gp               = overallRevenue - campaignDiscount - broadcastExp;

    const weeks = campaignDetails.turnout_weeks;
    const barMax = Math.max(overallRevenue, campaignDiscount, broadcastExp, 1);
    const fmtINR = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

    return {
      totalCustomers, shortlisted, turnoutCustomers, turnoutPct,
      overallRevenue, campaignDiscount, broadcastExp, gp, weeks, barMax, fmtINR
    };
  }, []);

   const donutData = [
  { name: "Turnout", value: M.turnoutPct },
  { name: "Remaining", value: 100 - M.turnoutPct }
];

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", padding: 12 }}>
      <Card
        title={<span style={{ color: "#fff" }}>Campaign Analysis</span>}
        headStyle={{ background: g.header, borderRadius: "8px 8px 0 0" }}
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Select
              placeholder="Choose Campaign"
              style={{ minWidth: 280 }}
              value={selected}
              onChange={(v) => { setSelected(v); navigate(`/campaign/analysis/${v}`); }}
              showSearch
              optionFilterProp="children"
            >
              {campaigns.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </Space>
        }
      >
        {/* Top meta */}
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col xs={16} md={12}>
            <strong style={{ marginRight: 8 }}>Name:</strong>
            <span style={{ fontWeight: 700 }}>{campaignDetails.name}</span>
          </Col>
          <Col xs={14} md={12}>
            <strong style={{ marginRight: 8,marginLeft: 408 }}>Period:</strong>
            <span>{campaignDetails.start_date + " → " + campaignDetails.end_date}</span>
          </Col>
        </Row>

        {/* KPI chips */}
        <Row gutter={6} style={{ marginTop: 8 }}>
          <Col xs={18} md={8} style={{ marginBottom: 12, marginright: 228 }}>
            <div style={chip(g.blue)}>Total Customers: {M.totalCustomers.toLocaleString("en-IN")}</div>
          </Col>
          <Col xs={22} md={8} style={{ marginBottom: 12 }}>
            <div style={chip(g.green)}>Shortlisted: {M.shortlisted.toLocaleString("en-IN")}</div>
          </Col>
          <Col xs={22} md={8} style={{ marginBottom: 12 }}>
            <div style={chip(g.pink)}>Turnout: {M.turnoutCustomers.toLocaleString("en-IN")}</div>
          </Col>
        </Row>

        {/* Donut + Revenue vs Cost + GP */}
        {/* Donut + Revenue vs Cost + GP + Chart */}
        <Row gutter={6} style={{ marginTop: 8, alignItems: "stretch", minHeight: 260 }}>
          {/* Turnout Ratio */}
         <Col
            xs={24}
            md={8}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
             <GaugeSpeedoMeter
    percent={M.turnoutPct}             // turnout vs shortlisted
    width={320}
    height={180}
    strokeWidth={18}
    label="Turnout Ratio"
    main={`${M.turnoutPct}%`}
    sub={`${M.turnoutCustomers.toLocaleString("en-IN")} / ${M.shortlisted.toLocaleString("en-IN")}`}
  />
          </Col>
          {/* Revenue vs Cost */}
          <Col xs={18} md={8} style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Revenue vs Cost</Title>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Overall Revenue</div>
              <div style={{ background: "#f1f5f9", height: 14, borderRadius: 8 }}>
                <div style={{
                  width: `${(M.overallRevenue / M.barMax) * 100}%`,
                  height: 14, borderRadius: 8, background: g.blue
                }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{M.fmtINR(M.overallRevenue)}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Campaign Discount</div>
              <div style={{ background: "#f1f5f9", height: 14, borderRadius: 8 }}>
                <div style={{
                  width: `${(M.campaignDiscount / M.barMax) * 100}%`,
                  height: 14, borderRadius: 8, background: g.pink
                }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{M.fmtINR(M.campaignDiscount)}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Broadcast Expenses</div>
              <div style={{ background: "#f1f5f9", height: 14, borderRadius: 8 }}>
                <div style={{
                  width: `${(M.broadcastExp / M.barMax) * 100}%`,
                  height: 14, borderRadius: 8, background: g.gold
                }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{M.fmtINR(M.broadcastExp)}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Gross Profit</div>
              <div style={{ background: "#f1f5f9", height: 14, borderRadius: 8 }}>
                <div style={{
                  width: `${(M.broadcastExp / M.barMax) * 100}%`,
                  height: 14, borderRadius: 8, background: g.green
                }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{M.fmtINR(M.broadcastExp)}</div>
            </div>
          </Col>

          {/* GP + Chart together */}
          <Col xs={18} md={8} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            
           <div style={{ width: "100%" }}>
          <Title level={5} style={{ marginBottom: 100, textAlign: "center" }}>
            Customer Turnout by Period
          </Title>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
              height: 180, // slightly taller for value labels
              justifyContent: "center",
            }}
          >
            {M.weeks.map((v, i) => {
              const maxVal = Math.max(...M.weeks, 1);
              const h = Math.max(8, (v / maxVal) * 120);
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  {/* Value above the bar */}
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    {v.toLocaleString("en-IN")}
                  </div>
                  {/* Bar */}
                  <div
                    style={{
                      width: 28,
                      height: h,
                      borderRadius: 8,
                      background: "linear-gradient(180deg,#60a5fa,#2563eb)",
                      boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
                      marginBottom: 4,
                    }}
                  />
                  {/* Label below */}
                  <div style={{ fontSize: 12 }}>wk {i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
          </Col>
        </Row>


        {/* Mini bar chart: Customer Turnout by Period */}
        
      </Card>
    </div>
  );
}
