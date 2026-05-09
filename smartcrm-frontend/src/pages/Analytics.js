import React, { useState, useEffect, useRef } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f2f7",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "36px 40px",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "32px",
  },
  headerTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  headerSub: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "4px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px 28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderTop: "4px solid",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    cursor: "default",
  },
  cardIconRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  cardLabel: {
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
  },
  cardValue: {
    fontSize: "38px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 1,
    letterSpacing: "-1px",
  },
  chartCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px 32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  },
  chartHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  chartBadge: {
    fontSize: "12px",
    fontWeight: "600",
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f7",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    gap: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "15px",
    color: "#64748b",
    fontWeight: "500",
  },
  errorWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f7",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#ef4444",
    fontSize: "15px",
  },
};

const STAT_CONFIGS = [
  {
    key: "totalCustomers",
    label: "Total Customers",
    icon: "👥",
    iconBg: "#ede9fe",
    borderColor: "#7c3aed",
  },
  {
    key: "openIssues",
    label: "Open Issues",
    icon: "🔔",
    iconBg: "#fef3c7",
    borderColor: "#f59e0b",
  },
  {
    key: "totalCompanies",
    label: "Total Companies",
    icon: "🏢",
    iconBg: "#d1fae5",
    borderColor: "#10b981",
  },
];

export default function Analytics() {
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [openIssues, setOpenIssues] = useState(null);
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .analytics-card { animation: fadeUp 0.4s ease both; }
      .analytics-card:nth-child(1) { animation-delay: 0.05s; }
      .analytics-card:nth-child(2) { animation-delay: 0.12s; }
      .analytics-card:nth-child(3) { animation-delay: 0.19s; }
      .analytics-chart-card { animation: fadeUp 0.45s 0.28s ease both; }
    `;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

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

        const totalCount = await countRes.json();
        const openCount = await openRes.json();
const customersData = await customersRes.json();
const customers = customersData.content || [];
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

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Loading analytics…</span>
      </div>
    );
  }

  if (error) {
    return <div style={styles.errorWrap}>⚠️ {error}</div>;
  }

  const totalCompanies = Object.keys(companyData).length;
  const statValues = { totalCustomers, openIssues, totalCompanies };

  const sortedCompanies = Object.entries(companyData).sort((a, b) => b[1] - a[1]);
  const chartLabels = sortedCompanies.map(([company]) => company);
  const chartCounts = sortedCompanies.map(([, count]) => count);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Customers",
        data: chartCounts,
        backgroundColor: chartLabels.map(
          (_, i) =>
            [
              "rgba(99, 102, 241, 0.85)",
              "rgba(16, 185, 129, 0.85)",
              "rgba(245, 158, 11, 0.85)",
              "rgba(239, 68, 68, 0.85)",
              "rgba(59, 130, 246, 0.85)",
              "rgba(168, 85, 247, 0.85)",
              "rgba(236, 72, 153, 0.85)",
              "rgba(20, 184, 166, 0.85)",
            ][i % 8]
        ),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 56,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
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
          color: "#64748b",
          font: { family: "'DM Sans', sans-serif", size: 12, weight: "500" },
          maxRotation: 30,
        },
      },
      y: {
        grid: { color: "#f1f5f9" },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: "#94a3b8",
          stepSize: 1,
          font: { family: "'DM Sans', sans-serif", size: 11 },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Analytics</h1>
        <p style={styles.headerSub}>
          Live overview of your CRM performance and customer distribution.
        </p>
      </div>

      <div style={styles.statsGrid}>
        {STAT_CONFIGS.map((cfg) => (
          <div
            key={cfg.key}
            className="analytics-card"
            style={{
              ...styles.card,
              borderTopColor: cfg.borderColor,
              transform: hoveredCard === cfg.key ? "translateY(-3px)" : "none",
              boxShadow:
                hoveredCard === cfg.key
                  ? "0 8px 30px rgba(0,0,0,0.10)"
                  : styles.card.boxShadow,
            }}
            onMouseEnter={() => setHoveredCard(cfg.key)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardIconRow}>
              <span style={styles.cardLabel}>{cfg.label}</span>
              <div style={{ ...styles.cardIcon, background: cfg.iconBg }}>
                {cfg.icon}
              </div>
            </div>
            <div style={styles.cardValue}>{statValues[cfg.key] ?? "—"}</div>
          </div>
        ))}
      </div>

      <div style={styles.chartCard} className="analytics-chart-card">
        <div style={styles.chartHeader}>
          <h2 style={styles.chartTitle}>Customers per Company</h2>
          <span style={styles.chartBadge}>{totalCompanies} companies</span>
        </div>
        {chartLabels.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            No company data available.
          </div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}