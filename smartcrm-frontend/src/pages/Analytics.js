import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import Layout from "../components/Layout";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ─── STAT CONFIGS ──────────────────────────────────────── */
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

/* ─── BAR COLOURS ───────────────────────────────────────── */
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
  /* ── state ── */
  const navigate   = useNavigate();
  const chartRef   = useRef(null);

  const [totalCustomers, setTotalCustomers] = useState(null);
  const [openIssues,     setOpenIssues]     = useState(null);
  const [totalCompanies, setTotalCompanies] = useState(null);
  // Chart source-of-truth: the same normalized company list the Companies page uses.
  // Each entry is { name, customerCount } — no client-side grouping needed.
  const [companies,      setCompanies]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [hoveredCard,    setHoveredCard]    = useState(null);

  /* ── data fetching ── */
  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Three endpoints, all authoritative:
        //  1. /api/customers/count      → total customer stat card
        //  2. /api/notes/count/open     → open issues stat card
        //  3. /api/companies/count      → total companies stat card
        //  4. /api/companies            → chart labels + bar heights + footer count
        //
        // Previously the chart was built by fetching GET /api/customers?page=0&size=100
        // and grouping company names client-side. That missed companies that appeared
        // only after the first 100 customer rows, so the chart and footer showed
        // fewer companies (28) than the stat card and Companies page (31).
        //
        // Now /api/companies is the single chart data source. It already contains
        // every normalized, de-duplicated company with its customerCount, so the
        // chart bar count, footer count, stat card, and Companies page cards are
        // all driven by the same backend grouping logic and always match.
        const [countRes, openRes, companyCountRes, companiesRes] = await Promise.all([
          fetch("http://localhost:8080/api/customers/count",  { headers }),
          fetch("http://localhost:8080/api/notes/count/open", { headers }),
          fetch("http://localhost:8080/api/companies/count",  { headers }),
          fetch("http://localhost:8080/api/companies",        { headers }),
        ]);

        if (!countRes.ok || !openRes.ok || !companyCountRes.ok || !companiesRes.ok) {
          throw new Error("Failed to fetch analytics data.");
        }

        const totalCount   = await countRes.json();
        const openCount    = await openRes.json();
        const companyCount = await companyCountRes.json();
        const companiesData = await companiesRes.json();   // CompanySummaryResponse[]

        setTotalCustomers(totalCount);
        setOpenIssues(openCount);
        setTotalCompanies(companyCount);
        setCompanies(companiesData);                       // used directly for chart
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

  /* ── derived chart values ──────────────────────────────────────────────────────
   * Built directly from the /api/companies response.
   * company.name         → x-axis label   (already trimmed + de-duped by backend)
   * company.customerCount → bar height     (already aggregated by backend)
   *
   * The backend sorts by customerCount desc then name asc, so bars are ordered
   * largest → smallest by default — no extra sort needed here.
   * ─────────────────────────────────────────────────────────────────────────── */
  const chartLabels = companies.map((c) => c.name);
  const chartCounts = companies.map((c) => c.customerCount ?? 0);

  /* ── bar click handler ──────────────────────────────────────────────────────
   * getElementAtEvent resolves which bar index the user clicked, then uses
   * the matching company name to navigate to /companies/:name — matching the
   * route pattern CompanyDetail reads with useParams({ name }).
   * ─────────────────────────────────────────────────────────────────────────── */
  const handleBarClick = (event) => {
    if (!chartRef.current) return;
    const elements = getElementAtEvent(chartRef.current, event);
    if (elements.length === 0) return;               // clicked empty canvas area
    const { index } = elements[0];
    const companyName = chartLabels[index];
    navigate(`/companies/${encodeURIComponent(companyName)}`);
  };

  const statValues = { totalCustomers, openIssues, totalCompanies };

  /* ── chart config ── */
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
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? "pointer" : "default";
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        // Richer tooltip: deeper indigo background, coloured title, larger body text
        backgroundColor: "#1e1b4b",
        titleColor: "#e0e7ff",
        bodyColor: "#c7d2fe",
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        displayColors: false,
        caretSize: 6,
        titleFont: { family: "'DM Sans',sans-serif", size: 13, weight: "700" },
        bodyFont:  { family: "'DM Sans',sans-serif", size: 12.5 },
        callbacks: {
          title: (items) => items[0].label,
          label: (ctx) =>
              `${ctx.parsed.y} customer${ctx.parsed.y !== 1 ? "s" : ""} · click to view`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          // Darker X-axis labels (#6b7280 vs old #9ca3af) and slightly larger font
          color: "#6b7280",
          maxRotation: 40,
          minRotation: 25,
          // Truncate long company names to keep axis from crowding
          callback: function(value) {
            const label = this.getLabelForValue(value);
            return label.length > 14 ? label.slice(0, 13) + "\u2026" : label;
          },
          font: { family: "'DM Sans',sans-serif", size: 11.5, weight: "500" },
        },
      },
      y: {
        // More visible grid lines: #e5e7eb (was near-invisible #f3f4f6)
        grid: { color: "#e5e7eb", lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: {
          // Much darker Y-axis numbers: #6b7280 (was unreadable #d1d5db)
          color: "#6b7280",
          stepSize: 1,
          font: { family: "'DM Sans',sans-serif", size: 11.5, weight: "500" },
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
                  Distribution across all registered companies · <span style={{ color: "#4f46e5", fontWeight: 600 }}>click a bar to open</span>
                </p>
              </div>
              {/* Header badge: authoritative count from /api/companies/count */}
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
                  <Bar ref={chartRef} data={chartData} options={chartOptions} onClick={handleBarClick} />
              )}
            </div>

            {/* chart footer — chartLabels.length always equals totalCompanies because
              both come from the same /api/companies array */}
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