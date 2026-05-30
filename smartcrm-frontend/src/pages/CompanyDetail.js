import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

/* ─── helpers ────────────────────────────────────────────── */
const AVATAR_COLORS = [
    { bg: "#e8e4ff", text: "#5b4fcf" },
    { bg: "#fde8ef", text: "#c0395d" },
    { bg: "#d6f5ea", text: "#1a7a4a" },
    { bg: "#fff3cd", text: "#856404" },
    { bg: "#e3f0ff", text: "#1557a0" },
    { bg: "#fce4ff", text: "#8b1fad" },
];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

function Avatar({ name, size = 36 }) {
    const c = avatarColor(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: c.bg, color: c.text,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: size * 0.42,
            flexShrink: 0, letterSpacing: "-0.5px",
        }}>
            {name?.[0]?.toUpperCase() || "?"}
        </div>
    );
}

const PRIORITY_STYLES = {
    HIGH:   { bg: "#fff0f3", color: "#c0395d", border: "#f9c0ce", dot: "#c0395d" },
    MEDIUM: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", dot: "#f59e0b" },
    LOW:    { bg: "#d6f5ea", color: "#1a7a4a", border: "#a7f3d0", dot: "#10b981" },
};

function PriorityBadge({ priority }) {
    const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 20,
            fontSize: 11.5, fontWeight: 700,
            background: s.bg, color: s.color,
            border: `1px solid ${s.border}`,
            letterSpacing: "0.4px", textTransform: "uppercase",
        }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {priority} Priority
        </span>
    );
}

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ icon, label, value, iconBg, valueColor, borderColor }) {
    return (
        <div style={{
            background: "#fff", borderRadius: 12,
            border: "1px solid #e5e7eb",
            borderTop: `3px solid ${borderColor}`,
            padding: "16px 20px",
            display: "flex", flexDirection: "column", gap: 8,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.7px" }}>{label}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: valueColor, letterSpacing: "-1px", lineHeight: 1 }}>
                {value ?? 0}
            </div>
        </div>
    );
}

/* ─── Note Status Badge ─────────────────────────────────── */
function NoteStatusBadge({ status }) {
    const map = {
        RESOLVED:    { bg: "#d6f5ea", color: "#1a7a4a", border: "#a7f3d0", label: "Resolved" },
        IN_PROGRESS: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", label: "In Progress" },
        OPEN:        { bg: "#fff0f3", color: "#c0395d", border: "#f9c0ce", label: "Open" },
    };
    const s = map[status?.toUpperCase()] || map.OPEN;
    return (
        <span style={{
            fontSize: 11, fontWeight: 600,
            background: s.bg, color: s.color,
            padding: "2px 10px", borderRadius: 20,
            border: `1px solid ${s.border}`,
        }}>
            {s.label}
        </span>
    );
}

/* ─── Main Component ────────────────────────────────────── */
export default function CompanyDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const companyName = decodeURIComponent(name);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notesFilter, setNotesFilter] = useState("all"); // all | open | in_progress | resolved
    const [activeTab, setActiveTab] = useState("customers");
    const [hoveredRow, setHoveredRow] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const res = await fetch(
                    `http://localhost:8080/api/companies/${encodeURIComponent(companyName)}`,
                    { headers }
                );

                if (!res.ok) {
                    const msg = res.status === 404
                        ? `Company "${companyName}" not found.`
                        : "Failed to load company data.";
                    throw new Error(msg);
                }

                const json = await res.json();

                // Enrich notes with customerName for display
                const customerMap = {};
                (json.customers || []).forEach((c) => { customerMap[c.id] = c.name; });
                const enrichedNotes = (json.notes || []).map((n) => ({
                    ...n,
                    customerName: customerMap[n.customerId] || "Unknown",
                }));

                setData({ ...json, notes: enrichedNotes });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [companyName]);

    /* ── Loading ── */
    if (loading) {
        return (
            <Layout title={companyName}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
                    <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTop: "3px solid #4f46e5", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
                    <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>Loading company data…</span>
                </div>
            </Layout>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <Layout title="Company">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                    <div style={{ background: "#fff", borderRadius: 14, padding: "32px 40px", textAlign: "center" }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                        <p style={{ color: "#c0395d", fontWeight: 600 }}>{error}</p>
                        <button
                            onClick={() => navigate("/companies")}
                            style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                        >
                            ← Back to Companies
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    const customers    = data?.customers || [];
    const notes        = data?.notes || [];
    const openCount    = data?.openCount ?? 0;
    const inProgCount  = data?.inProgressCount ?? 0;
    const resolvedCount = data?.resolvedCount ?? 0;
    const totalNotes   = data?.totalNotes ?? notes.length;
    const priority     = data?.priority || "LOW";

    const filteredNotes = notes.filter((n) => {
        if (notesFilter === "open")        return n.status === "OPEN";
        if (notesFilter === "in_progress") return n.status === "IN_PROGRESS";
        if (notesFilter === "resolved")    return n.status === "RESOLVED";
        return true;
    });

    const ac = [
        { bg: "#eef2ff", text: "#4f46e5" },
        { bg: "#d6f5ea", text: "#1a7a4a" },
        { bg: "#fffbeb", text: "#92400e" },
    ][(companyName?.charCodeAt(0) || 0) % 3];
    const initials = companyName.slice(0, 2).toUpperCase();

    const topbarRight = (
        <button
            onClick={() => navigate("/companies")}
            style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
                background: "#fff", fontSize: 13, fontWeight: 600,
                color: "#374151", cursor: "pointer", fontFamily: "inherit",
            }}
        >
            ← All Companies
        </button>
    );

    return (
        <Layout title={companyName} topbarRight={topbarRight}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes spin   { to { transform: rotate(360deg); } }
            `}</style>

            <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

                {/* ── Company Hero ── */}
                <div style={{
                    background: "#fff", borderRadius: 16,
                    border: "1px solid #e5e7eb", padding: "24px 28px",
                    display: "flex", alignItems: "center", gap: 20,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    animation: "fadeUp 0.3s ease both",
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: ac.bg, color: ac.text,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, fontWeight: 900, flexShrink: 0, letterSpacing: "-1px",
                    }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
                                {companyName}
                            </h1>
                            <PriorityBadge priority={priority} />
                        </div>
                        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                            {customers.length} customer{customers.length !== 1 ? "s" : ""}
                            {" · "}{totalNotes} total note{totalNotes !== 1 ? "s" : ""}
                            {" · "}{openCount} open issue{openCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 14,
                }}>
                    <StatCard icon="👥" label="Customers"    value={customers.length} iconBg="#eef2ff"  valueColor="#4f46e5" borderColor="#4f46e5" />
                    <StatCard icon="📝" label="Total Notes"  value={totalNotes}        iconBg="#f3f4f6"  valueColor="#374151" borderColor="#9ca3af" />
                    <StatCard icon="🔔" label="Open Issues"  value={openCount}          iconBg="#fff0f3"  valueColor="#c0395d" borderColor="#f9c0ce" />
                    <StatCard icon="🔄" label="In Progress"  value={inProgCount}        iconBg="#fffbeb"  valueColor="#92400e" borderColor="#f59e0b" />
                    <StatCard icon="✅" label="Resolved"     value={resolvedCount}      iconBg="#d6f5ea"  valueColor="#1a7a4a" borderColor="#10b981" />
                </div>

                {/* ── Tabs ── */}
                <div style={{
                    background: "#fff", borderRadius: 16,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                    animation: "fadeUp 0.38s 0.1s ease both",
                }}>
                    {/* Tab Header */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderBottom: "1px solid #f3f4f6", background: "#fafafa",
                        padding: "0 20px",
                    }}>
                        <div style={{ display: "flex", gap: 0 }}>
                            {[
                                { key: "customers", label: `Customers (${customers.length})`, icon: "👥" },
                                { key: "notes",     label: `Notes (${notes.length})`,          icon: "📝" },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        padding: "14px 18px",
                                        border: "none", background: "transparent",
                                        fontSize: 13.5, fontWeight: activeTab === tab.key ? 700 : 500,
                                        color: activeTab === tab.key ? "#4f46e5" : "#6b7280",
                                        borderBottom: activeTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent",
                                        cursor: "pointer", fontFamily: "inherit",
                                        display: "flex", alignItems: "center", gap: 6,
                                        transition: "color 0.15s",
                                        marginBottom: -1,
                                    }}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Notes filter */}
                        {activeTab === "notes" && (
                            <div style={{ display: "flex", gap: 6 }}>
                                {[
                                    { key: "all",         label: "All" },
                                    { key: "open",        label: "Open" },
                                    { key: "in_progress", label: "In Progress" },
                                    { key: "resolved",    label: "Resolved" },
                                ].map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setNotesFilter(f.key)}
                                        style={{
                                            padding: "5px 12px", borderRadius: 20,
                                            border: notesFilter === f.key ? "1px solid #4f46e5" : "1px solid #e5e7eb",
                                            background: notesFilter === f.key ? "#eef2ff" : "#fff",
                                            color: notesFilter === f.key ? "#4f46e5" : "#6b7280",
                                            fontSize: 12, fontWeight: 600,
                                            cursor: "pointer", fontFamily: "inherit",
                                        }}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Customers Tab ── */}
                    {activeTab === "customers" && (
                        <div>
                            {customers.length === 0 ? (
                                <div style={{ padding: "52px 0", textAlign: "center", color: "#9ca3af" }}>
                                    <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
                                    <p style={{ fontSize: 14 }}>No customers found for this company.</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "minmax(150px,2fr) minmax(180px,2fr) minmax(120px,1.2fr)",
                                        padding: "10px 22px",
                                        background: "#f9fafb", borderBottom: "1px solid #f3f4f6",
                                        fontSize: 11, fontWeight: 700, color: "#6b7280",
                                        textTransform: "uppercase", letterSpacing: "0.6px",
                                    }}>
                                        <span>Customer</span>
                                        <span>Email</span>
                                        <span>Phone</span>
                                    </div>
                                    {customers.map((c, i) => {
                                        const isHov = hoveredRow === c.id;
                                        return (
                                            <div
                                                key={c.id}
                                                onMouseEnter={() => setHoveredRow(c.id)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "minmax(150px,2fr) minmax(180px,2fr) minmax(120px,1.2fr)",
                                                    padding: "13px 22px",
                                                    borderBottom: i < customers.length - 1 ? "1px solid #f3f4f6" : "none",
                                                    alignItems: "center",
                                                    background: isHov ? "#fafafa" : "#fff",
                                                    transition: "background 0.12s",
                                                    animation: `fadeIn 0.25s ${i * 0.04}s ease both`,
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <Avatar name={c.name} size={34} />
                                                    <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{c.name}</span>
                                                </div>
                                                <span style={{ fontSize: 13, color: "#4b5563" }}>{c.email}</span>
                                                <span style={{ fontSize: 13, color: "#6b7280" }}>
                                                    {c.phone || <em style={{ opacity: 0.4, fontStyle: "normal" }}>—</em>}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Notes Tab ── */}
                    {activeTab === "notes" && (
                        <div>
                            {filteredNotes.length === 0 ? (
                                <div style={{ padding: "52px 0", textAlign: "center", color: "#9ca3af" }}>
                                    <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
                                    <p style={{ fontSize: 14 }}>
                                        No {notesFilter !== "all" ? notesFilter.replace("_", " ") : ""} notes found.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {filteredNotes.map((note, i) => (
                                        <div
                                            key={note.id}
                                            style={{
                                                padding: "16px 22px",
                                                borderBottom: i < filteredNotes.length - 1 ? "1px solid #f3f4f6" : "none",
                                                animation: `fadeIn 0.25s ${i * 0.04}s ease both`,
                                                display: "flex", alignItems: "flex-start", gap: 14,
                                            }}
                                        >
                                            <Avatar name={note.customerName} size={32} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{note.customerName}</span>
                                                    <NoteStatusBadge status={note.status} />
                                                    {note.createdAt && (
                                                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                                                            {new Date(note.createdAt).toLocaleDateString("en-IN", {
                                                                day: "numeric", month: "short", year: "numeric",
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: 13, color: "#4b5563", margin: 0, lineHeight: 1.6 }}>
                                                    {note.content || <em style={{ opacity: 0.5 }}>No content</em>}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}