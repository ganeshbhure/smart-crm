import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Layout from "../components/Layout";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ─── STAT CONFIGS (unchanged) ─────────────────────────── */
const STAT_CONFIGS = [
  {
    key: "totalCustomers",
    label: "Total Customers",
    icon: "👥",
    iconBg: "#eef2ff",
    borderColor: "#4f46e5",
    valueColor: "#4f46e5",
    trend: "+12% this month",
    trendColor: "#1a7a4a",
  },
  {
    key: "openIssues",
    label: "Open Issues",
    icon: "🔔",
    iconBg: "#fffbeb",
    borderColor: "#f59e0b",
    valueColor: "#92400e",
    trend: "Needs attention",
    trendColor: "#c0395d",
  },
  {
    key: "totalCompanies",
    label: "Total Companies",
    icon: "🏢",
    iconBg: "#d6f5ea",
    borderColor: "#10b981",
    valueColor: "#1a7a4a",
    trend: "Across all pages",
    trendColor: "#1a7a4a",
  },
];

/* ─── BAR COLOURS — refined palette ────────────────────── */
const BAR_COLORS = [
  "rgba(79,  70, 229, 0.82)",
  "rgba(16, 185, 129, 0.82)",
  "rgba(245,158,  11, 0.82)",
  "rgba(239, 68,  68, 0.82)",
  "rgba(59, 130, 246, 0.82)",
  "rgba(168, 85, 247, 0.82)",
  "rgba(236, 72, 153, 0.82)",
  "rgba(20, 184, 166, 0.82)",
];

export default function Analytics() {
  /* ── state (unchanged) ── */
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [openIssues,     setOpenIssues]     = useState(null);
  const [companyData,    setCompanyData]    = useState({});
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [hoveredCard,    setHoveredCard]    = useState(null);

  /* ── data fetching (unchanged logic) ── */
  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const token = localStorage.getItem("token");
        const [countRes, openRes, customersRes] = await Promise.all([
          fetch("http://localhost:8080/api/customers/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8080/api/notes/count/open", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8080/api/customers?page=0&size=100", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!countRes.ok || !openRes.ok || !customersRes.ok) {
          throw new Error("Failed to fetch analytics data.");
        }

        const totalCount    = await countRes.json();
        const openCount     = await openRes.json();
        const customersData = await customersRes.json();
        const customers     = customersData.content || [];

        const grouped = customers.reduce((acc, customer) => {
          const company = customer.company || "Unknown";
          acc[company] = (acc[company] || 0) + 1;
          return acc;
        }, {});

        setTotalCustomers(totalCount);
        setOpenIssues(openCount);
        setCompanyData(grouped);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalyticsData();
  }, []);

  /* ── loading state ── */
  if (loading) {
    return (
        <Layout title="Analytics">
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: "60vh", gap: 16,
          }}>
            <div style={{
              width: 40, height: 40,
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #4f46e5",
              borderRadius: "50%",
              animation: "spin 0.75s linear infinite",
            }} />
            <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
            Loading analytics…
          </span>
          </div>
        </Layout>
    );
  }

  /* ── error state ── */
  if (error) {
    return (
        <Layout title="Analytics">
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: "60vh",
          }}>
            <div style={{
              background: "#fff", borderRadius: 14, padding: "32px 40px",
              border: "1px solid #e5e7eb", textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <p style={{ color: "#c0395d", fontWeight: 600, fontSize: 14 }}>{error}</p>
            </div>
          </div>
        </Layout>
    );
  }

  /* ── derived values (unchanged logic) ── */
  const totalCompanies = Object.keys(companyData).length;
  const statValues     = { totalCustomers, openIssues, totalCompanies };

  const sortedCompanies = Object.entries(companyData).sort((a, b) => b[1] - a[1]);
  const chartLabels     = sortedCompanies.map(([company]) => company);
  const chartCounts     = sortedCompanies.map(([, count]) => count);

  /* ── chart data (unchanged logic) ── */
  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: "Customers",
      data: chartCounts,
      backgroundColor: chartLabels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
      borderRadius: { topLeft: 6, topRight: 6 },
      borderSkipped: false,
      maxBarThickness: 44,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 3.2,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#f9fafb",
        bodyColor: "#9ca3af",
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        titleFont: { family: "'DM Sans',sans-serif", size: 13, weight: "600" },
        bodyFont:  { family: "'DM Sans',sans-serif", size: 12 },
        callbacks: {
          label: (ctx) =>
              `${ctx.parsed.y} customer${ctx.parsed.y !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#9ca3af",
          maxRotation: 35,
          minRotation: 20,
          font: { family: "'DM Sans',sans-serif", size: 11, weight: "500" },
        },
      },
      y: {
        grid: { color: "#f3f4f6", lineWidth: 1 },
        border: { display: false, dash: [3, 3] },
        ticks: {
          color: "#d1d5db",
          stepSize: 1,
          font: { family: "'DM Sans',sans-serif", size: 11 },
        },
        beginAtZero: true,
      },
    },
  };

  /* ── render ── */
  return (
      <Layout title="Analytics">
        <div style={{
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}>
          {/* ── Page subtitle ── */}
          <p style={{ fontSize: 13.5, color: "#6b7280", margin: 0 }}>
            Live overview of your CRM performance and customer distribution.
          </p>

          {/* ── STAT CARDS ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 16,
          }}>
            {STAT_CONFIGS.map((cfg) => {
              const isHovered = hoveredCard === cfg.key;
              return (
                  <div
                      key={cfg.key}
                      className="an-card"
                      onMouseEnter={() => setHoveredCard(cfg.key)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        background: "#fff",
                        borderRadius: 14,
                        padding: "20px 22px",
                        border: "1px solid #e5e7eb",
                        borderTop: `3px solid ${cfg.borderColor}`,
                        boxShadow: isHovered
                            ? "0 8px 28px rgba(0,0,0,0.10)"
                            : "0 1px 4px rgba(0,0,0,0.05)",
                        transform: isHovered ? "translateY(-3px)" : "none",
                        transition: "transform 0.18s ease, box-shadow 0.18s ease",
                        cursor: "default",
                      }}
                  >
                    {/* label + icon */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#6b7280",
                    textTransform: "uppercase", letterSpacing: "0.7px",
                  }}>
                    {cfg.label}
                  </span>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: cfg.iconBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18,
                      }}>
                        {cfg.icon}
                      </div>
                    </div>

                    {/* value */}
                    <div style={{
                      fontSize: 36, fontWeight: 800,
                      color: cfg.valueColor,
                      letterSpacing: "-1.5px", lineHeight: 1,
                      marginBottom: 8,
                    }}>
                      {statValues[cfg.key] ?? "—"}
                    </div>

                    {/* trend */}
                    <div style={{
                      fontSize: 11.5, fontWeight: 500,
                      color: cfg.trendColor,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: cfg.trendColor, display: "inline-block",
                  }} />
                      {cfg.trend}
                    </div>
                  </div>
              );
            })}
          </div>

          {/* ── CHART CARD ── */}
          <div
              className="an-chart"
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
          >
            {/* chart header */}
            <div style={{
              padding: "18px 24px",
              borderBottom: "1px solid #f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#fafafa",
            }}>
              <div>
                <h2 style={{
                  fontSize: 15, fontWeight: 700, color: "#111827",
                  margin: 0, letterSpacing: "-0.3px",
                }}>
                  Customers per Company
                </h2>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                  Distribution across all registered companies
                </p>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 600,
                background: "#eef2ff", color: "#4f46e5",
                padding: "4px 12px", borderRadius: 20,
                border: "1px solid #c7d2fe",
              }}>
              {totalCompanies} {totalCompanies === 1 ? "company" : "companies"}
            </span>
            </div>

            {/* chart body */}
            <div style={{ padding: "20px 24px 24px" }}>
              {chartLabels.length === 0 ? (
                  <div style={{
                    padding: "52px 0", textAlign: "center",
                    color: "#9ca3af", fontSize: 14,
                    background: "#fafafa", borderRadius: 10,
                    border: "1px dashed #e5e7eb",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
                    No company data available yet.
                  </div>
              ) : (
                  <Bar data={chartData} options={chartOptions} />
              )}
            </div>

            {/* chart footer */}
            {chartLabels.length > 0 && (
                <div style={{
                  padding: "12px 24px",
                  borderTop: "1px solid #f3f4f6",
                  background: "#fafafa",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                Showing <strong style={{ color: "#374151" }}>{chartLabels.length}</strong> companies
                ·&nbsp;
                <strong style={{ color: "#374151" }}>{totalCustomers ?? 0}</strong> total customers
              </span>
                </div>
            )}
          </div>
        </div>
      </Layout>
  );
}