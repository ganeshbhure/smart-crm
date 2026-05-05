import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    getCustomers,
    addCustomer,
    deleteCustomer,
    updateCustomer,
    searchCustomers,
} from "../services/api";
import ContactsModal from "../components/ContactsModal";
import NotesModal from "../components/NotesModal";
import ReactDOM from "react-dom";
// ... rest of your imports stay the same

/* ─── colour helpers ─────────────────────────────────────── */
const AVATAR_COLORS = [
    { bg: "#e8e4ff", text: "#5b4fcf" },
    { bg: "#fde8ef", text: "#c0395d" },
    { bg: "#d6f5ea", text: "#1a7a4a" },
    { bg: "#fff3cd", text: "#856404" },
    { bg: "#e3f0ff", text: "#1557a0" },
    { bg: "#fce4ff", text: "#8b1fad" },
];
const avatarColor = (name) =>
    AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitial = (name) => name?.[0]?.toUpperCase() || "?";

/* ─── Avatar ─────────────────────────────────────────────── */
function Avatar({ name, size = 38 }) {
    const c = avatarColor(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: c.bg, color: c.text,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: size * 0.42,
            flexShrink: 0, letterSpacing: "-0.5px",
        }}>
            {getInitial(name)}
        </div>
    );
}

/* ─── Badge ──────────────────────────────────────────────── */
function Badge({ children, variant = "default" }) {
    const variantStyles = {
        default: { background: "#f0f0f5", color: "#555" },
        success: { background: "#d6f5ea", color: "#1a7a4a" },
        admin:   { background: "#e8e4ff", color: "#5b4fcf" },
        user:    { background: "#e3f0ff", color: "#1557a0" },
    };
    const s = variantStyles[variant] || variantStyles.default;
    return (
        <span style={{
            ...s,
            padding: "2px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 600,
            letterSpacing: "0.3px", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
            {children}
        </span>
    );
}

/* ─── Btn ────────────────────────────────────────────────── */
function Btn({ children, onClick, variant = "default", disabled = false, small = false }) {
    const base = {
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: small ? "6px 14px" : "9px 20px",
        borderRadius: 9, fontSize: small ? 12 : 13,
        fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        border: "none", transition: "all 0.15s ease",
        fontFamily: "inherit", opacity: disabled ? 0.55 : 1, whiteSpace: "nowrap",
    };
    const variants = {
        primary: { background: "#4f46e5", color: "#fff" },
        danger:  { background: "#fff0f3", color: "#c0395d", border: "1px solid #f9c0ce" },
        ghost:   { background: "#f5f5f7", color: "#374151", border: "1px solid #e5e7eb" },
        default: { background: "#fff",    color: "#374151", border: "1px solid #e5e7eb" },
    };
    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            style={{ ...base, ...variants[variant] }}
        >
            {children}
        </button>
    );
}

/* ─── Toast ──────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [message, onClose]);

    if (!message) return null;

    const styles = {
        success: { background: "#d6f5ea", color: "#1a7a4a", borderLeft: "4px solid #1a7a4a" },
        error:   { background: "#fff0f3", color: "#c0395d", borderLeft: "4px solid #c0395d" },
        info:    { background: "#e3f0ff", color: "#1557a0", borderLeft: "4px solid #1557a0" },
    };

    return (
        <div style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 9999,
            padding: "14px 20px", borderRadius: 10,
            fontSize: 14, fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            maxWidth: 340, display: "flex", alignItems: "center", gap: 12,
            ...styles[type], animation: "slideUp 0.25s ease",
        }}>
            <span style={{ flex: 1 }}>{message}</span>
            <span onClick={onClose} style={{ cursor: "pointer", fontSize: 16, lineHeight: 1, opacity: 0.6 }}>✕</span>
            <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    );
}

/* ─── ActionMenu ─────────────────────────────────────────── */
/*
 * Single ⋯ trigger opens a polished dropdown.
 * Contacts + Notes are always visible.
 * Edit + Delete appear only for ADMIN, separated by a divider.
 * Closes on outside click via a mousedown listener.
 * Zero logic changes — all handlers are passed straight through.
 */
/* ─── ActionMenu — Portal-based, always on screen ─── */
function ActionMenu({ customer, role, onContacts, onNotes, onEdit, onDelete }) {
    const [open, setOpen]     = useState(false);
    const [coords, setCoords] = useState({});
    const btnRef  = useRef(null);
    const menuRef = useRef(null);

    const MENU_HEIGHT = role === "ADMIN" ? 176 : 96;
    const MENU_WIDTH  = 188;

    const handleOpen = () => {
        if (open) { setOpen(false); return; }

        const rect = btnRef.current.getBoundingClientRect();

        // Horizontal: prefer right-aligned, but clamp to screen left edge
        const rightAligned = rect.right - MENU_WIDTH;
        const left = Math.max(8, rightAligned);

        // Vertical: open downward if room, otherwise upward
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        const top = spaceBelow >= MENU_HEIGHT
            ? rect.bottom + 6                         // open down
            : rect.top - MENU_HEIGHT - 6;             // open up

        setCoords({ top: Math.max(8, top), left });
        setOpen(true);
    };

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const down = (e) => {
            if (
                !btnRef.current?.contains(e.target) &&
                !menuRef.current?.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener("mousedown", down);
        return () => document.removeEventListener("mousedown", down);
    }, [open]);

    // Close on any scroll
    useEffect(() => {
        if (!open) return;
        const s = () => setOpen(false);
        window.addEventListener("scroll", s, true);
        return () => window.removeEventListener("scroll", s, true);
    }, [open]);

    const MenuItem = ({ icon, label, onClick, color = "#374151", bg = "#f5f5f7" }) => (
        <button
            onClick={() => { onClick(); setOpen(false); }}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 14px",
                background: "transparent", border: "none",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: 13, fontWeight: 500, color,
                textAlign: "left", borderRadius: 7,
                transition: "background 0.12s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = bg}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
            <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{icon}</span>
            {label}
        </button>
    );

    const menu = open ? (
        <div
            ref={menuRef}
            style={{
                position:  "fixed",          // fixed to viewport
                top:       coords.top,
                left:      coords.left,
                width:     MENU_WIDTH,
                background: "#fff",
                border:    "1px solid #e5e7eb",
                borderRadius: 10,
                boxShadow: "0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                zIndex:    99999,            // above everything
                padding:   "5px",
                animation: "menuIn 0.14s ease",
            }}
        >
            <style>{`
                @keyframes menuIn {
                    from { opacity:0; transform:translateY(-5px); }
                    to   { opacity:1; transform:translateY(0);    }
                }
            `}</style>

            <MenuItem icon="👥" label="View Contacts" onClick={onContacts} color="#4f46e5" bg="#eef2ff" />
            <MenuItem icon="📝" label="View Notes"    onClick={onNotes} />

            {role === "ADMIN" && (
                <>
                    <div style={{ margin: "4px 8px", height: 1, background: "#f3f4f6" }} />
                    <MenuItem icon="✏️" label="Edit Customer" onClick={onEdit} />
                    <MenuItem icon="🗑️" label="Delete"        onClick={onDelete} color="#c0395d" bg="#fff0f3" />
                </>
            )}
        </div>
    ) : null;

    return (
        <>
            {/* ··· trigger button */}
            <button
                ref={btnRef}
                onClick={handleOpen}
                title="Actions"
                style={{
                    width: 32, height: 32, borderRadius: 8,
                    border:  "1px solid #e5e7eb",
                    background: open ? "#f0f0f5" : "#fff",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: "#6b7280",
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "#f5f5f7"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = open ? "#f0f0f5" : "#fff"; }}
            >
                ···
            </button>

            {/* Portal: renders directly into document.body — zero CSS inheritance */}
            {ReactDOM.createPortal(menu, document.body)}
        </>
    );
}

/* ─── Dashboard ──────────────────────────────────────────── */
export default function Dashboard() {
    const token = localStorage.getItem("token");
    let role = "";
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            role = payload.role;
        } catch {}
    }

    const [customers, setCustomers]                       = useState([]);
    const [search, setSearch]                             = useState("");
    const [page, setPage]                                 = useState(0);
    const [loading, setLoading]                           = useState(false);
    const [submitting, setSubmitting]                     = useState(false);
    const [error, setError]                               = useState("");
    const [formOpen, setFormOpen]                         = useState(false);
    const [editingCustomer, setEditingCustomer]           = useState(null);
    const [name, setName]                                 = useState("");
    const [email, setEmail]                               = useState("");
    const [phone, setPhone]                               = useState("");
    const [company, setCompany]                           = useState("");
    const [toast, setToast]                               = useState({ message: "", type: "info" });
    const [activeNav, setActiveNav]                       = useState("dashboard");
    const [hoveredRow, setHoveredRow]                     = useState(null);
    const [totalCustomers, setTotalCustomers]             = useState(0);
    const [selectedCustomer, setSelectedCustomer]         = useState(null);
    const [selectedCustomerForNotes, setSelectedCustomerForNotes] = useState(null);
    const [deleteCustomerId, setDeleteCustomerId] = useState(null);

    const navigate = useNavigate();

    const showToast  = (message, type = "info") => setToast({ message, type });
    const clearToast = () => setToast({ message: "", type: "info" });

    /* ── data fetching (unchanged) ── */
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getCustomers(page, 5);
            setCustomers(data.content || []);
            setTotalCustomers(data.totalElements || 0);
        } catch {
            setError("Failed to load customers. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    /* ── auth (unchanged) ── */
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    /* ── form helpers (unchanged) ── */
    const clearForm = () => {
        setName(""); setEmail(""); setPhone(""); setCompany("");
        setEditingCustomer(null);
    };

    const toggleForm = () => {
        setFormOpen((f) => !f);
        if (formOpen) clearForm();
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setName(customer.name);
        setEmail(customer.email);
        setPhone(customer.phone);
        setCompany(customer.company);
        setFormOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ── CRUD (unchanged) ── */
    const handleSubmit = async () => {
        if (!name.trim() || !email.trim()) {
            showToast("Name and email are required.", "error");
            return;
        }
        const payload = { name, email, phone, company };
        setSubmitting(true);
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, payload);
                showToast("Customer updated successfully.", "success");
            } else {
                await addCustomer(payload);
                showToast("Customer added successfully.", "success");
            }
            fetchCustomers();
            clearForm();
            setFormOpen(false);
        } catch {
            showToast("Operation failed. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteCustomerId(id);
    };

    const confirmDelete = async () => {
        try {
            const response = await deleteCustomer(deleteCustomerId);

            if (response.status === 403) {
                showToast("Access denied — only ADMIN can delete.", "error");
                setDeleteCustomerId(null);
                return;
            }

            showToast("Customer deleted.", "info");
            fetchCustomers();
        } catch {
            showToast("Something went wrong.", "error");
        } finally {
            setDeleteCustomerId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteCustomerId(null);
    };

    /* ── search (unchanged) ── */
    const handleSearch = async (val) => {
        setSearch(val);
        if (val.trim() === "") { fetchCustomers(); return; }
        try {
            const data = await searchCustomers(val);
            setCustomers(data);
            setTotalCustomers(data.length);
        } catch {
            showToast("Search failed", "error");
        }
    };

    /* ─── NAV items ─── */
    const navItems = [
        { id: "dashboard", icon: "⊞", label: "Dashboard" },
        { id: "customers", icon: "👥", label: "Customers" },
        { id: "analytics", icon: "📊", label: "Analytics" },
        { id: "settings",  icon: "⚙",  label: "Settings"  },
    ];

    /* ─── render ─── */
    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f4f5f7; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                input:focus { outline: none; border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
                @keyframes fadeIn  { from { opacity:0; transform:translateY(5px);  } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeDown{ from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
            `}</style>

            <div style={{ display: "flex", minHeight: "100vh" }}>

                {/* ═══ SIDEBAR ═══ */}
                <aside style={{
                    width: 230, background: "#fff",
                    borderRight: "1px solid #e5e7eb",
                    display: "flex", flexDirection: "column",
                    padding: "24px 14px",
                    position: "sticky", top: 0, height: "100vh", flexShrink: 0,
                }}>
                    <div style={{ padding: "4px 10px 28px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, background: "#4f46e5",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 15, color: "#fff", fontWeight: 800,
                        }}>S</div>
                        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.4px" }}>Smart CRM</span>
                    </div>

                    <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                        {navItems.map((item) => {
                            const active = activeNav === item.id;
                            return (
                                <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "9px 12px", borderRadius: 8, border: "none",
                                    cursor: "pointer", fontFamily: "inherit", fontSize: 13.5,
                                    fontWeight: active ? 600 : 400,
                                    background: active ? "#eef2ff" : "transparent",
                                    color: active ? "#4f46e5" : "#6b7280",
                                    transition: "all 0.15s ease", textAlign: "left",
                                }}>
                                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                                    {item.label}
                                    {active && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#4f46e5" }} />}
                                </button>
                            );
                        })}
                    </nav>

                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 10,
                        background: "#f9fafb", border: "1px solid #e5e7eb",
                    }}>
                        <Avatar name={role === "ADMIN" ? "Admin" : "User"} size={34} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {role === "ADMIN" ? "Admin User" : "User"}
                            </div>
                            <Badge variant={role === "ADMIN" ? "admin" : "user"}>{role || "USER"}</Badge>
                        </div>
                    </div>
                </aside>

                {/* ═══ MAIN ═══ */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                    {/* top bar */}
                    <header style={{
                        background: "#fff", borderBottom: "1px solid #e5e7eb",
                        padding: "0 28px", height: 60,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        position: "sticky", top: 0, zIndex: 100,
                    }}>
                        <div>
                            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.4px" }}>Dashboard</h1>
                            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>Manage your customer base</p>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Btn variant="primary" onClick={toggleForm}>
                                {formOpen ? "✕  Close form" : "+ Add Customer"}
                            </Btn>
                            <Btn variant="ghost" onClick={handleLogout}>Logout</Btn>
                        </div>
                    </header>

                    {/* page content */}
                    <main style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: 22 }}>

                        {/* stat cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                            {[
                                { label: "Total customers", value: totalCustomers, color: "#4f46e5" },
                                { label: "Current page",    value: page + 1,       color: "#0e7490" },
                                { label: "Role",            value: role || "—",    color: "#92400e" },
                            ].map((s) => (
                                <div key={s.label} style={{
                                    background: "#fff", border: "1px solid #e5e7eb",
                                    borderRadius: 12, padding: "18px 20px",
                                    borderTop: `3px solid ${s.color}`,
                                }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px" }}>{s.label}</p>
                                    <p style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 6, letterSpacing: "-1px" }}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* add / edit form */}
                        {formOpen && (
                            <div style={{
                                background: "#fff", border: "1px solid #e5e7eb",
                                borderRadius: 14, overflow: "hidden",
                                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                                animation: "fadeDown 0.2s ease",
                            }}>
                                <div style={{
                                    padding: "14px 22px", borderBottom: "1px solid #f3f4f6",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    background: "#fafafa",
                                }}>
                                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                                        {editingCustomer ? "✏️  Edit Customer" : "➕  New Customer"}
                                    </span>
                                    {editingCustomer && <Btn small variant="ghost" onClick={clearForm}>Clear</Btn>}
                                </div>
                                <div style={{ padding: "22px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        {[
                                            { label: "Full name *",     value: name,    set: setName,    ph: "Jane Doe",         type: "text"  },
                                            { label: "Email address *", value: email,   set: setEmail,   ph: "jane@company.com", type: "email" },
                                            { label: "Phone",           value: phone,   set: setPhone,   ph: "+91 98765 43210",  type: "tel"   },
                                            { label: "Company",         value: company, set: setCompany, ph: "Acme Corp",        type: "text"  },
                                        ].map((field) => (
                                            <div key={field.label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{field.label}</label>
                                                <input
                                                    type={field.type} value={field.value}
                                                    placeholder={field.ph}
                                                    onChange={(e) => field.set(e.target.value)}
                                                    style={{
                                                        padding: "9px 13px", borderRadius: 8,
                                                        border: "1px solid #d1d5db", fontSize: 13.5,
                                                        color: "#111827", background: "#fff",
                                                        transition: "border-color 0.15s", fontFamily: "inherit",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                                        <Btn variant="ghost" onClick={toggleForm}>Cancel</Btn>
                                        <Btn variant="primary" onClick={handleSubmit} disabled={submitting}>
                                            {submitting ? "Saving…" : (editingCustomer ? "Update Customer" : "Add Customer")}
                                        </Btn>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── customers panel ── */}
                        <div style={{
                            background: "#fff", border: "1px solid #e5e7eb",
                            borderRadius: 14, overflow: "hidden",
                        }}>
                            {/* panel header + search */}
                            <div style={{
                                padding: "14px 20px", borderBottom: "1px solid #f3f4f6",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                gap: 14, flexWrap: "wrap", background: "#fafafa",
                            }}>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>
                                    Customers <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 13 }}>({customers.length})</span>
                                </span>
                                <div style={{ position: "relative", flex: "0 0 260px" }}>
                                    <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14, pointerEvents: "none" }}>🔍</span>
                                    <input
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Search name or email…"
                                        style={{
                                            width: "100%", padding: "8px 12px 8px 34px",
                                            borderRadius: 8, border: "1px solid #d1d5db",
                                            fontSize: 13, fontFamily: "inherit",
                                            color: "#111827", background: "#fff",
                                            transition: "border-color 0.15s",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* ── table head ──
                                5 cols: Customer | Email | Phone | Company | Actions (fixed 52px)
                                minmax prevents any column from squashing its neighbour.         */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "minmax(140px,2fr) minmax(160px,2fr) minmax(110px,1.2fr) minmax(120px,1.2fr) 52px",
                                padding: "10px 20px",
                                background: "#f9fafb", borderBottom: "1px solid #f3f4f6",
                                fontSize: 11, fontWeight: 700, color: "#6b7280",
                                textTransform: "uppercase", letterSpacing: "0.6px",
                            }}>
                                <span>Customer</span>
                                <span>Email</span>
                                <span>Phone</span>
                                <span>Company</span>
                                <span style={{ textAlign: "center" }}>Actions</span>
                            </div>

                            {/* loading / error / empty */}
                            {loading && (
                                <div style={{ padding: "42px 20px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
                                    <div style={{ fontSize: 26, marginBottom: 10 }}>⏳</div>
                                    Loading customers…
                                </div>
                            )}
                            {!loading && error && (
                                <div style={{ padding: "28px 20px", textAlign: "center", color: "#c0395d", fontSize: 14, background: "#fff0f3" }}>
                                    ⚠️ {error}
                                </div>
                            )}
                            {!loading && !error && customers.length === 0 && (
                                <div style={{ padding: "52px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                                    <div style={{ fontSize: 34, marginBottom: 10 }}>👥</div>
                                    No customers found.
                                </div>
                            )}

                            {/* ── rows ── */}
                            {!loading && customers.map((c, i) => (
                                <div
                                    key={c.id}
                                    onMouseEnter={() => setHoveredRow(c.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "minmax(140px,2fr) minmax(160px,2fr) minmax(110px,1.2fr) minmax(120px,1.2fr) 52px",
                                        padding: "13px 20px",
                                        borderBottom: i < customers.length - 1 ? "1px solid #f3f4f6" : "none",
                                        alignItems: "center",
                                        background: hoveredRow === c.id ? "#fafafa" : "#fff",
                                        transition: "background 0.12s ease",
                                        animation: `fadeIn 0.25s ease ${i * 0.04}s both`,
                                    }}
                                >
                                    {/* CUSTOMER */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                                        <Avatar name={c.name} size={36} />
                                        <span style={{ fontWeight: 600, fontSize: 14, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {c.name}
                                        </span>
                                    </div>

                                    {/* EMAIL */}
                                    <span style={{ fontSize: 13, color: "#4b5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                                        {c.email}
                                    </span>

                                    {/* PHONE */}
                                    <span style={{ fontSize: 13, color: "#6b7280" }}>
                                        {c.phone || <em style={{ opacity: 0.4 }}>—</em>}
                                    </span>

                                    {/* COMPANY */}
                                    <span>
                                        {c.company
                                            ? <Badge variant="success">{c.company}</Badge>
                                            : <em style={{ fontSize: 13, color: "#9ca3af", fontStyle: "normal" }}>—</em>
                                        }
                                    </span>

                                    {/* ── ACTIONS — single ⋯ dropdown ── */}
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <ActionMenu
                                            customer={c}
                                            role={role}
                                            onContacts={() => setSelectedCustomer(c)}
                                            onNotes={()    => setSelectedCustomerForNotes(c)}
                                            onEdit={()     => handleEdit(c)}
                                            onDelete={()   => handleDelete(c.id)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* pagination */}
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                gap: 14, padding: "14px 20px",
                                borderTop: "1px solid #f3f4f6", background: "#fafafa",
                            }}>
                                <Btn small variant="ghost" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                                    ← Prev
                                </Btn>
                                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                                    Page <strong style={{ color: "#111827" }}>{page + 1}</strong>
                                </span>
                                <Btn small variant="ghost" onClick={() => setPage((p) => p + 1)}>
                                    Next →
                                </Btn>
                            </div>
                        </div>
                    </main>
                </div>

                {/* modals — unchanged */}
                {selectedCustomer && (
                    <ContactsModal
                        customer={selectedCustomer}
                        onClose={() => setSelectedCustomer(null)}
                    />
                )}
                {selectedCustomerForNotes && (
                    <NotesModal
                        customer={selectedCustomerForNotes}
                        onClose={() => setSelectedCustomerForNotes(null)}
                    />
                )}

                {deleteCustomerId && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>

                            <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>

                            <h3 style={{ marginBottom: 6 }}>Delete Customer</h3>

                            <p style={{ color: "#6b7280", fontSize: 14 }}>
                                This action cannot be undone. This will permanently delete this customer.
                            </p>

                            <div style={{
                                marginTop: 20,
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 10
                            }}>
                                <button onClick={cancelDelete} style={styles.cancelBtn}>
                                    Cancel
                                </button>

                                <button onClick={confirmDelete} style={styles.deleteBtn}>
                                    Delete
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            <Toast message={toast.message} type={toast.type} onClose={clearToast} />
        </>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
    },
    modal: {
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "340px"
    },
    cancelBtn: {
        padding: "8px 14px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "#fff",
        cursor: "pointer"
    },
    deleteBtn: {
        padding: "8px 14px",
        borderRadius: "6px",
        background: "#ef4444",
        color: "#fff",
        border: "none",
        cursor: "pointer"
    }
};