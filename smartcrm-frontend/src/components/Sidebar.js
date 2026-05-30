import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

/* ─── Nav items ─────────────────────────────────────────── */
const NAV_ITEMS = [
    { path: "/dashboard",  icon: "👥", label: "Customers"  },
    { path: "/companies",  icon: "🏢", label: "Companies"  },
    { path: "/analytics",  icon: "📊", label: "Analytics"  },
    { path: "/settings",   icon: "⚙️", label: "Settings"   },
];

export default function Sidebar() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const [hovered, setHovered] = useState(null);

    // Decode role from JWT
    let role = "";
    try {
        const token = localStorage.getItem("token");
        if (token) role = JSON.parse(atob(token.split(".")[1])).role;
    } catch {}

    // Avatar colour for logged-in user
    const AVATAR_COLORS = [
        { bg: "#e8e4ff", text: "#5b4fcf" },
        { bg: "#fde8ef", text: "#c0395d" },
        { bg: "#d6f5ea", text: "#1a7a4a" },
        { bg: "#fff3cd", text: "#856404" },
        { bg: "#e3f0ff", text: "#1557a0" },
        { bg: "#fce4ff", text: "#8b1fad" },
    ];

    // Pull name from token if available
    let userName = "";
    let userEmail = "";
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const p = JSON.parse(atob(token.split(".")[1]));
            userName  = p.name  || p.sub || "";
            userEmail = p.email || p.sub || "";
        }
    } catch {}

    const ac = AVATAR_COLORS[(userName?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
    const initials = (userName || "?")[0]?.toUpperCase() || "?";

    return (
        <aside style={{
            width: 220,
            minWidth: 220,
            height: "100vh",
            position: "sticky",
            top: 0,
            background: "#fff",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'DM Sans','Segoe UI',sans-serif",
            flexShrink: 0,
            zIndex: 100,
        }}>
            {/* ── Logo / Brand ── */}
            <div style={{
                padding: "20px 18px 16px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 10,
            }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "#4f46e5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: "#fff", fontWeight: 800, flexShrink: 0,
                    letterSpacing: "-0.5px",
                }}>
                    S
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111827", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                        Smart CRM
                    </div>
                    <div style={{ fontSize: 10.5, color: "#9ca3af", fontWeight: 500, letterSpacing: "0.2px" }}>
                        Workspace
                    </div>
                </div>
            </div>

            {/* ── Nav Links ── */}
            <nav style={{ padding: "10px 10px 0", flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", padding: "8px 8px 4px" }}>
                    Menu
                </div>
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                    const isHov = hovered === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            onMouseEnter={() => setHovered(item.path)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                width: "100%",
                                padding: "9px 10px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: 13.5,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? "#4f46e5" : (isHov ? "#111827" : "#374151"),
                                background: isActive ? "#eef2ff" : (isHov ? "#f5f5f7" : "transparent"),
                                textAlign: "left",
                                transition: "all 0.12s ease",
                                marginBottom: 2,
                                position: "relative",
                            }}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <span style={{
                                    position: "absolute",
                                    left: 0, top: "20%", bottom: "20%",
                                    width: 3, borderRadius: "0 3px 3px 0",
                                    background: "#4f46e5",
                                }} />
                            )}
                            <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* ── User footer ── */}
            <div style={{
                padding: "12px 14px",
                borderTop: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 10,
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: ac.bg, color: ac.text,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {userName || "User"}
                    </div>
                    <div style={{ fontSize: 10.5, color: "#9ca3af", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {role || "Member"}
                    </div>
                </div>
            </div>
        </aside>
    );
}