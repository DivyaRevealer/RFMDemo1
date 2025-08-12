import React from "react";

// percent: 0–100
export default function GaugeSpeedometer({
  percent = 0,
  width = 320,
  height = 180,
  strokeWidth = 18,
  label = "Turnout Ratio",
  main = "",         // e.g. "20%"
  sub = "",          // e.g. "5,000 / 25,000"
}) {
  const cx = width / 2;
  const cy = height - 10;                 // drop center a bit
  const r = Math.min(width, height * 2) / 2 - 10;

  const deg = Math.max(0, Math.min(100, percent)) * 1.8; // 0→180
  const start = -180, end = 0;

  const toRad = (a) => (a * Math.PI) / 180;

  // SVG arc path helper
  const arcPath = (a1, a2) => {
    const x1 = cx + r * Math.cos(toRad(a1));
    const y1 = cy + r * Math.sin(toRad(a1));
    const x2 = cx + r * Math.cos(toRad(a2));
    const y2 = cy + r * Math.sin(toRad(a2));
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Needle geometry
  const needleLen = r - 22;
  const needleAngle = start + deg; // -180..0
  const nx = cx + needleLen * Math.cos(toRad(needleAngle));
  const ny = cy + needleLen * Math.sin(toRad(needleAngle));

  return (
    <div style={{ width, height, position: "relative" }}>
      <svg width={width} height={height}>
        {/* Track */}
        <path
          d={arcPath(start, end)}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Value arc (green gradient) */}
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path
          d={arcPath(start, start + deg)}
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Ticks (every 20%) */}
        {[0,20,40,60,80,100].map(t => {
          const a = start + t * 1.8;
          const rx1 = cx + (r - strokeWidth - 6) * Math.cos(toRad(a));
          const ry1 = cy + (r - strokeWidth - 6) * Math.sin(toRad(a));
          const rx2 = cx + (r - strokeWidth - 18) * Math.cos(toRad(a));
          const ry2 = cy + (r - strokeWidth - 18) * Math.sin(toRad(a));
          return <line key={t} x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#cbd5e1" strokeWidth="2" />;
        })}

        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#111827" strokeWidth="3" />
        <circle cx={cx} cy={cy} r="6" fill="#111827" />
      </svg>

      {/* Center labels */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: height/2 - 8,
        textAlign: "center"
      }}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{main}</div>
        {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{sub}</div>}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}
