import React, { useMemo, useState } from "react";
import { Card, Row, Col, Select, Typography, Space, Button, Progress } from "antd";

const { Option } = Select;
const { Title } = Typography;

export default function Campaign_Dashboard() {
  // --- Hardcoded campaigns + selected ---
  const [selected, setSelected] = useState(1);
  const campaigns = [
    { id: 1, name: "Diwali Mega Sale" },
    { id: 2, name: "Summer Bonanza" },
    { id: 3, name: "New Year Bash" }
  ];

  // --- Hardcoded campaign details (dummy) ---
  const C = {
    name: "Diwali Mega Sale",
    period_from: "2025-07-27",
    period_to:   "2025-07-30",
    total_customers: 50000,
    shortlisted: 25000,
    turnout: 5000, // people who actually turned up
    revenue_total: 1200000,       // ₹
    discount_total: 150000,       // ₹
    broadcast_expenses: 40000,    // ₹
    weeks: [1200, 800, 560, 380, 220], // turnout by week
  };

  // --- Theme helpers ---
  const g = {
    blue:  "linear-gradient(90deg,#60a5fa,#2563eb)",
    green: "linear-gradient(90deg,#34d399,#10b981)",
    pink:  "linear-gradient(90deg,#f472b6,#ec4899)",
    gold:  "linear-gradient(90deg,#f59e0b,#fbbf24)",
    header:"linear-gradient(90deg,#6a11cb,#2575fc)",
  };
  const chip = (bg) => ({
    background: bg, color: "#fff", padding: "8px 16px",
    borderRadius: 999, fontWeight: 700, display: "inline-block",
    width: "100%", textAlign: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  });
  const fmtINR = (v) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

  // --- Derived metrics ---
  const M = useMemo(() => {
    const turnoutPct = C.shortlisted ? Math.round((C.turnout / C.shortlisted) * 100) : 0; // FIX: vs shortlisted
    const gp = C.revenue_total - C.discount_total - C.broadcast_expenses;
    const barMax = Math.max(C.revenue_total, C.discount_total, C.broadcast_expenses, 1);
    return { turnoutPct, gp, barMax };
  }, [C]);

  // --- Reusable round KPI Circle ---
  const Circle = ({ label, value, grad }) => (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 110, height: 110, borderRadius: "50%",
          background: grad, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 22, boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
        }}
      >
        {value.toLocaleString("en-IN")}
      </div>
      <div style={{ marginTop: 8, fontWeight: 600 }}>{label}</div>
    </div>
  );

  // --- Donut with center overlay (count + %) ---
  const DonutWithCenter = () => (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Progress
        type="dashboard"
        percent={M.turnoutPct}
        strokeColor={{ '0%': '#34d399', '100%': '#10b981' }}
        width={190}
        format={() => ""} // we'll draw our own center
      />
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          pointerEvents: "none"
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          {C.turnout.toLocaleString("en-IN")}
        </div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
          {M.turnoutPct}% of shortlisted
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", padding: 12 }}>
      {/* Page Header */}
      <Card
        title={<span style={{ color: "#fff" }}>Campaign Analysis</span>}
        headStyle={{ background: g.header, borderRadius: "8px 8px 0 0" }}
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <span style={{ color: "#fff" }}>Choose Campaign:</span>
            <Select
              style={{ minWidth: 260 }}
              value={selected}
              onChange={setSelected}
              showSearch
              optionFilterProp="children"
            >
              {campaigns.map((c) => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
            <Button onClick={() => window.history.back()}>Back</Button>
          </Space>
        }
      >
        {/* Name + Period */}
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col xs={24} md={12}>
            <strong style={{ marginRight: 8 }}>Name:</strong>
            <span style={{ fontWeight: 700 }}>{C.name}</span>
          </Col>
          <Col xs={24} md={12}>
            <strong style={{ marginRight: 8 }}>Period:</strong>
            <span>{C.period_from} → {C.period_to}</span>
          </Col>
        </Row>

        {/* 3 KPI circles (Total, Shortlisted, Turnout) */}
        <Row gutter={24} style={{ marginTop: 12, marginBottom: 8 }}>
          <Col xs={24} md={8} style={{ marginBottom: 16 }}>
            <Circle label="Total Customers" value={C.total_customers} grad={g.blue} />
          </Col>
          <Col xs={24} md={8} style={{ marginBottom: 16 }}>
            <Circle label="Customers Shortlisted" value={C.shortlisted} grad={g.green} />
          </Col>
          <Col xs={24} md={8} style={{ marginBottom: 16 }}>
            <Circle label="Turnout" value={C.turnout} grad={g.pink} />
          </Col>
        </Row>

        {/* Turnout Ratio + Revenue vs Cost + GP */}
        <Row gutter={16} style={{ alignItems: "center", marginTop: 8 }}>
          <Col xs={24} md={8} style={{ textAlign: "center", marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Turnout Ratio</Title>
            <DonutWithCenter />
          </Col>

          <Col xs={24} md={10} style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Revenue Vs Cost</Title>

            {/* Overall Revenue */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Overall Revenue</div>
              <div style={{ background: "#f1f5f9", height: 14, borderRadius: 8 }}>
                <div style={{
                  width: `${(C.revenue_total / M.barMax) * 100}%`,
                  height: 14, borderRadius: 8, background: g.blue
                }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{fmtINR(C.revenue_total)}</div>
            </div>

            {/* Campaign Discount */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Campaign Discount</div>
              <div style={{ background: "#f1f5f9", height: 14, borderRadius: 8 }}>
                <div style={{
                  width: `${(C.discount_total / M.barMax) * 100}%`,
                  height: 14, borderRadius: 8, background: g.pink
                }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{fmtINR(C.discount_total)}</div>
            </div>

            {/* Broadcast Expenses */}
            <div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Broadcast Expenses</div>
              <div style={{ background: "#f1f5f9", height: 14, borderRadius: 8 }}>
                <div style={{
                  width: `${(C.broadcast_expenses / M.barMax) * 100}%`,
                  height: 14, borderRadius: 8, background: g.gold
                }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{fmtINR(C.broadcast_expenses)}</div>
            </div>

            {/* Legend */}
            <div style={{ marginTop: 12, display: "flex", gap: 18, flexWrap: "wrap" }}>
              <div><span style={{ ...chip(g.blue), padding: "4px 10px", width: "auto" }} /> <span style={{ marginLeft: 6 }}>Overall Revenue</span></div>
              <div><span style={{ ...chip(g.pink), padding: "4px 10px", width: "auto" }} /> <span style={{ marginLeft: 6 }}>Campaign Discount</span></div>
              <div><span style={{ ...chip(g.gold), padding: "4px 10px", width: "auto" }} /> <span style={{ marginLeft: 6 }}>Broadcast Expenses</span></div>
            </div>
          </Col>

          {/* GP chip */}
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <Title level={5} style={{ marginBottom: 8 }}>GP</Title>
            <div style={{ ...chip("linear-gradient(90deg,#f59e0b,#ef4444)"), fontSize: 18 }}>
              {fmtINR(M.gp)}
            </div>
          </Col>
        </Row>

        {/* Customer Turnout by Period */}
        <div style={{ marginTop: 24 }}>
          <Title level={5} style={{ marginBottom: 10 }}>Customer Turnout by Period</Title>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 150 }}>
            {C.weeks.map((v, i, arr) => {
              const h = Math.max(8, (v / Math.max(...arr, 1)) * 120);
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 30, height: h, borderRadius: 8,
                    background: "linear-gradient(180deg,#60a5fa,#2563eb)",
                    boxShadow: "0 6px 16px rgba(37,99,235,0.25)"
                  }} />
                  <div style={{ fontSize: 12, marginTop: 6 }}>wk {i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
