import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

/* ─── Priority config ───────────────────────────────────── */
const PRIORITY_STYLES = {
    HIGH:   { bg: "#fff0f3", color: "#c0395d", border: "#f9c0ce", dot: "#c0395d" },
    MEDIUM: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", dot: "#f59e0b" },
    LOW:    { bg: "#d6f5ea", color: "#1a7a4a", border: "#a7f3d0", dot: "#10b981" },
};

const AVATAR_BG = [
    { bg: "#eef2ff", text: "#4f46e5" },
    { bg: "#d6f5ea", text: "#1a7a4a" },
    { bg: "#fffbeb", text: "#92400e" },
    { bg: "#fce4ff", text: "#8b1fad" },
    { bg: "#e3f0ff", text: "#1557a0" },
    { bg: "#fde8ef", text: "#c0395d" },
];
const companyColor = (name) => AVATAR_BG[(name?.charCodeAt(0) || 0) % AVATAR_BG.length];

/* ─── PriorityBadge ─────────────────────────────────────── */
function PriorityBadge({ priority }) {
    const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700,
            background: s.bg, color: s.color,
            border: `1px solid ${s.border}`,
            letterSpacing: "0.4px", textTransform: "uppercase",
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {priority}
        </span>
    );
}

/* ─── Stat Pill ─────────────────────────────────────────── */
function StatPill({ icon, label, value, color }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: color || "#111827" }}>{value}</span>
        </div>
    );
}

export default function Companies() {
    const navigate = useNavigate();

    const [companies,    setCompanies]    = useState([]);
    const [totalCount,   setTotalCount]   = useState(0);   // ← authoritative backend count
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);
    const [search,       setSearch]       = useState("");
    const [sortBy,       setSortBy]       = useState("customers");
    const [hoveredCard,  setHoveredCard]  = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const token   = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch the company list AND the authoritative count in parallel.
                // The count endpoint reads from the same CompanyService.groupByCompany()
                // method as the list endpoint, so they are guaranteed to agree.
                const [listRes, countRes] = await Promise.all([
                    fetch("http://localhost:8080/api/companies",       { headers }),
                    fetch("http://localhost:8080/api/companies/count", { headers }),
                ]);

                if (!listRes.ok || !countRes.ok) throw new Error("Failed to fetch companies.");

                const data  = await listRes.json();
                const count = await countRes.json();

                setCompanies(data);
                setTotalCount(count);   // use backend count, never data.length or local compute
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filtered = [...companies]
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "name")   return a.name.localeCompare(b.name);
            if (sortBy === "issues") return (b.openCount ?? 0) - (a.openCount ?? 0);
            return (b.customerCount ?? 0) - (a.customerCount ?? 0);
        });

    const totalCustomers = companies.reduce((s, c) => s + (c.customerCount ?? 0), 0);
    const totalOpen      = companies.reduce((s, c) => s + (c.openCount     ?? 0), 0);

    /* ── loading ── */
    if (loading) {
        return (
            <Layout title="Companies">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
                    <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTop: "3px solid #4f46e5", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
                    <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>Loading companies…</span>
                </div>
            </Layout>
        );
    }

    /* ── error ── */
    if (error) {
        return (
            <Layout title="Companies">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                    <div style={{ background: "#fff", borderRadius: 14, padding: "32px 40px", textAlign: "center" }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                        <p style={{ color: "#c0395d", fontWeight: 600, fontSize: 14 }}>{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Companies">
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
                @keyframes spin   { to { transform: rotate(360deg); } }
            `}</style>

            <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 22 }}>

                {/* ── Summary bar ── */}
                {/*
                  * FIXED: was `companies.length` (local array length, could differ
                  * from backend count if any de-duplication happened server-side).
                  * Now uses `totalCount` fetched from GET /api/companies/count,
                  * which runs through the same CompanyService.groupByCompany()
                  * normalization as the list itself → always matches Analytics.
                  */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <p style={{ fontSize: 13.5, color: "#6b7280", margin: 0 }}>
                        {totalCount} companies · {totalCustomers} total customers · {totalOpen} open issues
                    </p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {/* Search */}
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search companies…"
                                style={{
                                    padding: "8px 12px 8px 32px", borderRadius: 8,
                                    border: "1px solid #d1d5db", fontSize: 13,
                                    fontFamily: "inherit", color: "#111827",
                                    background: "#fff", width: 200,
                                    outline: "none",
                                }}
                            />
                        </div>
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: "8px 12px", borderRadius: 8,
                                border: "1px solid #d1d5db", fontSize: 13,
                                fontFamily: "inherit", background: "#fff",
                                color: "#374151", cursor: "pointer", outline: "none",
                            }}
                        >
                            <option value="customers">Sort: Customers</option>
                            <option value="issues">Sort: Open Issues</option>
                            <option value="name">Sort: Name</option>
                        </select>
                    </div>
                </div>

                {/* ── Company Grid ── */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>🏢</div>
                        <p style={{ fontSize: 14 }}>No companies found.</p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                        gap: 16,
                    }}>
                        {filtered.map((company, i) => {
                            const isHov         = hoveredCard === company.name;
                            const ac            = companyColor(company.name);
                            const initials      = company.name.slice(0, 2).toUpperCase();
                            const openNotes     = company.openCount        ?? 0;
                            const resolvedNotes = company.resolvedCount    ?? 0;
                            const inProgNotes   = company.inProgressCount  ?? 0;
                            const total         = openNotes + inProgNotes + resolvedNotes;

                            return (
                                <div
                                    key={company.name}
                                    onMouseEnter={() => setHoveredCard(company.name)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    onClick={() => navigate(`/companies/${encodeURIComponent(company.name)}`)}
                                    style={{
                                        background: "#fff",
                                        borderRadius: 14,
                                        border: isHov ? "1px solid #c7d2fe" : "1px solid #e5e7eb",
                                        padding: "20px 22px",
                                        cursor: "pointer",
                                        boxShadow: isHov
                                            ? "0 12px 36px rgba(79,70,229,0.13), 0 2px 8px rgba(0,0,0,0.06)"
                                            : "0 1px 4px rgba(0,0,0,0.05)",
                                        transform: isHov ? "translateY(-4px)" : "none",
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                                        animation: `fadeUp 0.35s ${i * 0.05}s ease both`,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 14,
                                    }}
                                >
                                    {/* Header */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 12,
                                            background: ac.bg, color: ac.text,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 15, fontWeight: 800, flexShrink: 0,
                                            letterSpacing: "-0.5px",
                                        }}>
                                            {initials}
                                        </div>
                                        <div style={{ flex: 1, overflow: "hidden" }}>
                                            <div style={{ fontWeight: 700, fontSize: 14.5, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {company.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
                                                {company.customerCount ?? 0} customer{(company.customerCount ?? 0) !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                        <PriorityBadge priority={company.priority || "LOW"} />
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: 1, background: "#f3f4f6" }} />

                                    {/* Stats row */}
                                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                                        <StatPill icon="👥" label="Contacts"    value={company.customerCount ?? 0} />
                                        <StatPill icon="🔔" label="Open"        value={openNotes}     color={openNotes     > 0 ? "#c0395d" : "#374151"} />
                                        <StatPill icon="🔄" label="In Progress" value={inProgNotes}   color={inProgNotes   > 0 ? "#92400e" : "#374151"} />
                                        <StatPill icon="✅" label="Resolved"    value={resolvedNotes} color="#1a7a4a" />
                                    </div>

                                    {/* Progress bar (resolved %) */}
                                    {total > 0 && (
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 11, color: "#9ca3af" }}>Issue resolution</span>
                                                <span style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>
                                                    {Math.round((resolvedNotes / total) * 100)}%
                                                </span>
                                            </div>
                                            <div style={{ height: 5, borderRadius: 99, background: "#f3f4f6", overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%",
                                                    width: `${Math.round((resolvedNotes / total) * 100)}%`,
                                                    background: "#10b981", borderRadius: 99,
                                                    transition: "width 0.4s ease",
                                                }} />
                                            </div>
                                        </div>
                                    )}

                                    {/* View link */}
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <span style={{
                                            fontSize: 12, color: "#4f46e5", fontWeight: 600,
                                            display: "inline-flex", alignItems: "center", gap: 3,
                                            transition: "gap 0.18s ease",
                                            ...(isHov ? { gap: 6 } : {}),
                                        }}>
                                            View details
                                            <span style={{
                                                display: "inline-block",
                                                transition: "transform 0.18s ease",
                                                transform: isHov ? "translateX(3px)" : "translateX(0)",
                                            }}>→</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}