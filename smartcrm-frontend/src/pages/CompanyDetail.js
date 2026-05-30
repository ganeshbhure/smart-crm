import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ContactsModal from "../components/ContactsModal";
import NotesModal from "../components/NotesModal";
import { updateCustomer, deleteCustomer, updateNoteStatus } from "../services/api";

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
const STATUS_MAP = {
    RESOLVED:    { bg: "#d6f5ea", color: "#1a7a4a", border: "#a7f3d0", label: "Resolved" },
    IN_PROGRESS: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", label: "In Progress" },
    OPEN:        { bg: "#fff0f3", color: "#c0395d", border: "#f9c0ce", label: "Open" },
};

function NoteStatusBadge({ status }) {
    const s = STATUS_MAP[status?.toUpperCase()] || STATUS_MAP.OPEN;
    return (
        <span style={{
            fontSize: 11, fontWeight: 700,
            background: s.bg, color: s.color,
            padding: "3px 10px", borderRadius: 20,
            border: `1px solid ${s.border}`,
            letterSpacing: "0.3px",
            textTransform: "uppercase",
        }}>
            {s.label}
        </span>
    );
}

/* ─── Edit Customer Modal ────────────────────────────────── */
function EditCustomerModal({ customer, onClose, onSaved }) {
    const [name, setName]     = useState(customer.name || "");
    const [email, setEmail]   = useState(customer.email || "");
    const [phone, setPhone]   = useState(customer.phone || "");
    const [company, setCompany] = useState(customer.company || "");
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState("");

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) { setError("Name and email are required."); return; }
        setSaving(true);
        try {
            await updateCustomer(customer.id, { name, email, phone, company });
            onSaved();
            onClose();
        } catch (e) {
            setError("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: "100%", padding: "9px 13px", borderRadius: 8,
        border: "1px solid #d1d5db", fontSize: 13.5,
        color: "#111827", background: "#fff", fontFamily: "inherit",
        outline: "none", boxSizing: "border-box",
        transition: "border-color 0.15s, box-shadow 0.15s",
    };

    return (
        <>
            <style>{`
                .edit-input:focus { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12) !important; }
                @keyframes editModalIn { from { opacity:0; transform:translateY(-10px) scale(0.98); } to { opacity:1; transform:none; } }
            `}</style>
            <div
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(15,15,20,0.45)", backdropFilter: "blur(4px)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 1100, padding: 20,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
            >
                <div style={{
                    background: "#fff", width: "100%", maxWidth: 440,
                    borderRadius: 18,
                    boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
                    animation: "editModalIn 0.22s ease",
                    overflow: "hidden",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "18px 22px", borderBottom: "1px solid #f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "#fafafa",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Avatar name={customer.name} size={36} />
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Edit Customer</p>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", margin: 0 }}>{customer.name}</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb",
                                background: "#fff", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16, color: "#6b7280",
                            }}
                        >✕</button>
                    </div>

                    {/* Form */}
                    <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 14 }}>
                        {[
                            { label: "Name *", value: name, setter: setName, placeholder: "Full name" },
                            { label: "Email *", value: email, setter: setEmail, placeholder: "email@example.com" },
                            { label: "Phone", value: phone, setter: setPhone, placeholder: "+91 XXXXX XXXXX" },
                            { label: "Company", value: company, setter: setCompany, placeholder: "Company name" },
                        ].map(({ label, value, setter, placeholder }) => (
                            <div key={label}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
                                <input
                                    className="edit-input"
                                    value={value}
                                    onChange={(e) => setter(e.target.value)}
                                    placeholder={placeholder}
                                    style={inputStyle}
                                />
                            </div>
                        ))}

                        {error && (
                            <div style={{ background: "#fff0f3", color: "#c0395d", borderLeft: "4px solid #c0395d", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: "9px 20px", borderRadius: 9, border: "1px solid #e5e7eb",
                                    background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
                                }}
                            >Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: "9px 22px", borderRadius: 9, border: "none",
                                    background: saving ? "#a5b4fc" : "#4f46e5",
                                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
                                }}
                            >{saving ? "Saving…" : "Save Changes"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Actions Dropdown (portal-based, escapes overflow:hidden) ── */
function ActionsDropdown({ customer, onViewContacts, onViewNotes, onEdit, onDelete }) {
    const [open, setOpen]     = useState(false);
    const [coords, setCoords] = useState({});
    const btnRef  = useRef(null);
    const menuRef = useRef(null);

    const MENU_WIDTH  = 188;
    const MENU_HEIGHT = 176; // 4 items × ~44px

    const handleOpen = (e) => {
        e.stopPropagation();
        if (open) { setOpen(false); return; }

        const rect = btnRef.current.getBoundingClientRect();

        // align right edge of menu with right edge of button
        const left = Math.max(8, rect.right - MENU_WIDTH);

        // open below if room, otherwise above
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        const top = spaceBelow >= MENU_HEIGHT
            ? rect.bottom + 6
            : rect.top - MENU_HEIGHT - 6;

        setCoords({ top: Math.max(8, top), left });
        setOpen(true);
    };

    // close on outside click
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

    // close on any scroll (same as Dashboard)
    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        window.addEventListener("scroll", close, true);
        return () => window.removeEventListener("scroll", close, true);
    }, [open]);

    const actions = [
        { icon: "📋", label: "View Contacts",  handler: onViewContacts },
        { icon: "📝", label: "View Notes",      handler: onViewNotes },
        { icon: "✏️", label: "Edit Customer",  handler: onEdit },
        { icon: "🗑",  label: "Delete Customer", handler: onDelete, danger: true },
    ];

    const menu = open ? (
        <div
            ref={menuRef}
            style={{
                position:  "fixed",          // fixed to viewport — immune to any ancestor overflow/clip
                top:       coords.top,
                left:      coords.left,
                width:     MENU_WIDTH,
                background: "#fff",
                border:    "1px solid #e5e7eb",
                borderRadius: 11,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                zIndex:    99999,            // above everything
                padding:   "5px",
                animation: "dropIn 0.15s ease",
            }}
        >
            {actions.map(({ icon, label, handler, danger }) => (
                <button
                    key={label}
                    onClick={(e) => { e.stopPropagation(); setOpen(false); handler(); }}
                    style={{
                        display: "flex", alignItems: "center", gap: 9,
                        width: "100%", padding: "9px 12px",
                        background: "none", border: "none",
                        fontSize: 13, fontWeight: 500,
                        color: danger ? "#c0395d" : "#374151",
                        cursor: "pointer", borderRadius: 7,
                        textAlign: "left", fontFamily: "inherit",
                        transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "#fff0f3" : "#f3f4f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                >
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    {label}
                </button>
            ))}
        </div>
    ) : null;

    return (
        <>
            <button
                ref={btnRef}
                onClick={handleOpen}
                style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 8,
                    border: "1px solid #e5e7eb", background: open ? "#f3f4f6" : "#fff",
                    fontSize: 12.5, fontWeight: 600, color: "#374151",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "background 0.12s, border-color 0.12s",
                    whiteSpace: "nowrap",
                }}
            >
                Actions
                <span style={{
                    display: "inline-block",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                    fontSize: 10, lineHeight: 1, color: "#9ca3af",
                }}>▼</span>
            </button>

            {ReactDOM.createPortal(menu, document.body)}
        </>
    );
}

/* ─── Note Status Selector ───────────────────────────────── */
/* Replaces the plain <select> with CRM-themed segmented pill buttons.
   Each option uses the same STATUS_MAP colours as NoteStatusBadge so the
   control is visually consistent with the rest of the page.
   The onChange API is identical — no logic changes in the parent. */
function NoteStatusSelector({ note, onChange }) {
    const [updating, setUpdating] = useState(false);

    const handleChange = async (newStatus) => {
        if (newStatus === note.status || updating) return;
        setUpdating(true);
        try {
            await onChange(note.id, newStatus);
        } finally {
            setUpdating(false);
        }
    };

    const OPTIONS = [
        { value: "OPEN",        label: "Open" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "RESOLVED",    label: "Resolved" },
    ];

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, flexShrink: 0 }}>
                Set status:
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {OPTIONS.map(({ value, label }) => {
                    const active = note.status === value;
                    const s      = STATUS_MAP[value];
                    return (
                        <button
                            key={value}
                            onClick={() => handleChange(value)}
                            disabled={updating}
                            style={{
                                padding: "3px 11px",
                                borderRadius: 20,
                                border: active ? `1.5px solid ${s.border}` : "1.5px solid #e5e7eb",
                                background: active ? s.bg : "#fff",
                                color:      active ? s.color : "#9ca3af",
                                fontSize: 11.5, fontWeight: active ? 700 : 500,
                                cursor: updating ? "wait" : "pointer",
                                fontFamily: "inherit",
                                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                                opacity: updating ? 0.6 : 1,
                            }}
                        >
                            {active && (
                                <span style={{
                                    display: "inline-block",
                                    width: 6, height: 6,
                                    borderRadius: "50%",
                                    background: s.color,
                                    marginRight: 5,
                                    verticalAlign: "middle",
                                }} />
                            )}
                            {label}
                        </button>
                    );
                })}
            </div>
            {updating && (
                <span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>Saving…</span>
            )}
        </div>
    );
}

/* ─── Main Component ────────────────────────────────────── */
export default function CompanyDetail() {
    const { name } = useParams();
    const navigate = useNavigate();
    const companyName = decodeURIComponent(name);

    const [data, setData]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [notesFilter, setNotesFilter] = useState("all");
    const [activeTab, setActiveTab]   = useState("customers");
    const [hoveredRow, setHoveredRow] = useState(null);

    /* modal state */
    const [contactsCustomer, setContactsCustomer] = useState(null);
    const [notesCustomer, setNotesCustomer]       = useState(null);
    const [editCustomer, setEditCustomer]         = useState(null);
    const [deleteConfirm, setDeleteConfirm]       = useState(null);
    const [deleting, setDeleting]                 = useState(false);

    /* ── fetch company data ── */
    const fetchData = useCallback(async () => {
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
    }, [companyName]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── note status change handler ── */
    const handleNoteStatusChange = async (noteId, newStatus) => {
        await updateNoteStatus(noteId, newStatus);
        // optimistic local update + refresh stats from server
        setData((prev) => {
            if (!prev) return prev;
            const updatedNotes = prev.notes.map((n) =>
                n.id === noteId ? { ...n, status: newStatus } : n
            );
            // recount
            const openCount      = updatedNotes.filter((n) => n.status === "OPEN").length;
            const inProgressCount = updatedNotes.filter((n) => n.status === "IN_PROGRESS").length;
            const resolvedCount  = updatedNotes.filter((n) => n.status === "RESOLVED").length;
            return { ...prev, notes: updatedNotes, openCount, inProgressCount, resolvedCount };
        });
        // also do a background full refresh to keep counts accurate
        fetchData();
    };

    /* ── delete handler ── */
    const handleDelete = async (customer) => {
        setDeleting(true);
        try {
            await deleteCustomer(customer.id);
            setDeleteConfirm(null);
            fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setDeleting(false);
        }
    };

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

    const customers     = data?.customers || [];
    const notes         = data?.notes || [];
    const openCount     = data?.openCount ?? 0;
    const inProgCount   = data?.inProgressCount ?? 0;
    const resolvedCount = data?.resolvedCount ?? 0;
    const totalNotes    = data?.totalNotes ?? notes.length;
    const priority      = data?.priority || "LOW";

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
                @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes confirmIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: none; } }
            `}</style>

            {/* ── Modals ── */}
            {contactsCustomer && (
                <ContactsModal
                    customer={contactsCustomer}
                    onClose={() => setContactsCustomer(null)}
                />
            )}
            {notesCustomer && (
                <NotesModal
                    customer={notesCustomer}
                    onClose={() => setNotesCustomer(null)}
                />
            )}
            {editCustomer && (
                <EditCustomerModal
                    customer={editCustomer}
                    onClose={() => setEditCustomer(null)}
                    onSaved={fetchData}
                />
            )}

            {/* ── Delete Confirmation ── */}
            {deleteConfirm && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(15,15,20,0.45)", backdropFilter: "blur(4px)",
                        display: "flex", justifyContent: "center", alignItems: "center",
                        zIndex: 1100, padding: 20,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    }}
                >
                    <div style={{
                        background: "#fff", borderRadius: 16, padding: "28px 32px",
                        maxWidth: 380, width: "100%", textAlign: "center",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.16)",
                        animation: "confirmIn 0.2s ease",
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                            Delete Customer?
                        </h3>
                        <p style={{ fontSize: 13.5, color: "#6b7280", marginBottom: 22, lineHeight: 1.6 }}>
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{
                                    padding: "9px 22px", borderRadius: 9, border: "1px solid #e5e7eb",
                                    background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
                                }}
                            >Cancel</button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={deleting}
                                style={{
                                    padding: "9px 22px", borderRadius: 9, border: "none",
                                    background: deleting ? "#fca5a5" : "#ef4444",
                                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer",
                                }}
                            >{deleting ? "Deleting…" : "Yes, Delete"}</button>
                        </div>
                    </div>
                </div>
            )}

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
                    <StatCard icon="👥" label="Customers"    value={customers.length}  iconBg="#eef2ff"  valueColor="#4f46e5" borderColor="#4f46e5" />
                    <StatCard icon="📝" label="Total Notes"  value={totalNotes}         iconBg="#f3f4f6"  valueColor="#374151" borderColor="#9ca3af" />
                    <StatCard icon="🔔" label="Open Issues"  value={openCount}           iconBg="#fff0f3"  valueColor="#c0395d" borderColor="#f9c0ce" />
                    <StatCard icon="🔄" label="In Progress"  value={inProgCount}         iconBg="#fffbeb"  valueColor="#92400e" borderColor="#f59e0b" />
                    <StatCard icon="✅" label="Resolved"     value={resolvedCount}       iconBg="#d6f5ea"  valueColor="#1a7a4a" borderColor="#10b981" />
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
                        padding: "0 20px", flexWrap: "wrap", gap: 8,
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
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "8px 0" }}>
                                {[
                                    { key: "all",         label: "All",         activeBg: "#eef2ff", activeColor: "#4f46e5", activeBorder: "#c7d2fe" },
                                    { key: "open",        label: "Open",        activeBg: "#fff0f3", activeColor: "#c0395d", activeBorder: "#f9c0ce" },
                                    { key: "in_progress", label: "In Progress", activeBg: "#fffbeb", activeColor: "#92400e", activeBorder: "#fde68a" },
                                    { key: "resolved",    label: "Resolved",    activeBg: "#d6f5ea", activeColor: "#1a7a4a", activeBorder: "#a7f3d0" },
                                ].map((f) => {
                                    const active = notesFilter === f.key;
                                    return (
                                        <button
                                            key={f.key}
                                            onClick={() => setNotesFilter(f.key)}
                                            style={{
                                                padding: "5px 13px", borderRadius: 20,
                                                border: active ? `1.5px solid ${f.activeBorder}` : "1px solid #e5e7eb",
                                                background: active ? f.activeBg : "#fff",
                                                color: active ? f.activeColor : "#6b7280",
                                                fontSize: 12, fontWeight: active ? 700 : 500,
                                                cursor: "pointer", fontFamily: "inherit",
                                                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                                            }}
                                        >
                                            {f.label}
                                        </button>
                                    );
                                })}
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
                                    {/* Table header */}
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "minmax(150px,2fr) minmax(180px,2fr) minmax(120px,1.2fr) auto",
                                        padding: "10px 22px",
                                        background: "#f9fafb", borderBottom: "1px solid #f3f4f6",
                                        fontSize: 11, fontWeight: 700, color: "#6b7280",
                                        textTransform: "uppercase", letterSpacing: "0.6px",
                                        alignItems: "center",
                                    }}>
                                        <span>Customer</span>
                                        <span>Email</span>
                                        <span>Phone</span>
                                        <span style={{ textAlign: "right" }}>Actions</span>
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
                                                    gridTemplateColumns: "minmax(150px,2fr) minmax(180px,2fr) minmax(120px,1.2fr) auto",
                                                    padding: "13px 22px",
                                                    borderBottom: i < customers.length - 1 ? "1px solid #f3f4f6" : "none",
                                                    alignItems: "center", gap: 12,
                                                    background: isHov ? "#fafafa" : "#fff",
                                                    transition: "background 0.12s",
                                                    animation: `fadeIn 0.25s ${i * 0.04}s ease both`,
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <Avatar name={c.name} size={34} />
                                                    <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{c.name}</span>
                                                </div>
                                                <span style={{ fontSize: 13, color: "#4b5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</span>
                                                <span style={{ fontSize: 13, color: "#6b7280" }}>
                                                    {c.phone || <em style={{ opacity: 0.4, fontStyle: "normal" }}>—</em>}
                                                </span>
                                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                    <ActionsDropdown
                                                        customer={c}
                                                        onViewContacts={() => setContactsCustomer(c)}
                                                        onViewNotes={() => setNotesCustomer(c)}
                                                        onEdit={() => setEditCustomer(c)}
                                                        onDelete={() => setDeleteConfirm(c)}
                                                    />
                                                </div>
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
                                    {filteredNotes.map((note, i) => {
                                        const sm = STATUS_MAP[note.status?.toUpperCase()] || STATUS_MAP.OPEN;
                                        return (
                                            <div
                                                key={note.id}
                                                style={{
                                                    padding: "18px 22px",
                                                    borderBottom: i < filteredNotes.length - 1 ? "1px solid #f3f4f6" : "none",
                                                    animation: `fadeIn 0.25s ${i * 0.04}s ease both`,
                                                    display: "flex", alignItems: "flex-start", gap: 14,
                                                    // Status-coloured left accent strip — instant visual hierarchy
                                                    borderLeft: `3px solid ${sm.border}`,
                                                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                                                }}
                                            >
                                                <Avatar name={note.customerName} size={34} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {/* top row — name · badge · date */}
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
                                                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{note.customerName}</span>
                                                        <NoteStatusBadge status={note.status} />
                                                        {note.createdAt && (
                                                            <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto" }}>
                                                            {new Date(note.createdAt).toLocaleDateString("en-IN", {
                                                                day: "numeric", month: "short", year: "numeric",
                                                            })}
                                                        </span>
                                                        )}
                                                    </div>
                                                    {/* note content — stronger contrast, tighter line height */}
                                                    <p style={{
                                                        fontSize: 13, color: "#374151",
                                                        margin: "0 0 12px", lineHeight: 1.65,
                                                        fontStyle: note.content ? "normal" : "italic",
                                                        opacity: note.content ? 1 : 0.5,
                                                    }}>
                                                        {note.content || "No content"}
                                                    </p>
                                                    {/* status selector */}
                                                    <NoteStatusSelector
                                                        note={note}
                                                        onChange={handleNoteStatusChange}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}