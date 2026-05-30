import { useEffect, useState } from "react";
import { getNotes, addNote, updateNoteStatus, deleteNote } from "../services/api";

/* ─── status config ──────────────────────────────────────── */
const STATUS_CONFIG = {
    OPEN:        { bg: "#fff0f0", color: "#c0395d", dot: "#ef4444" },
    IN_PROGRESS: { bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
    RESOLVED:    { bg: "#d6f5ea", color: "#1a7a4a", dot: "#10b981" },
};

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

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
    const label = status === "IN_PROGRESS" ? "In Progress" : status.charAt(0) + status.slice(1).toLowerCase();
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: cfg.bg, color: cfg.color,
            padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.3px", textTransform: "uppercase",
            whiteSpace: "nowrap",
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
            {label}
        </span>
    );
}

export default function NotesModal({ customer, onClose }) {
    const [notes, setNotes]     = useState([]);
    const [content, setContent] = useState("");
    const [status, setStatus]   = useState("OPEN");
    const [hoveredId, setHoveredId] = useState(null);

    const fetchNotes = async () => {
        try {
            const data = await getNotes(customer.id);
            setNotes(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchNotes(); }, [customer]);

    const handleAdd = async () => {
        if (!content.trim()) return;
        await addNote(customer.id, { content, status });
        setContent("");
        setStatus("OPEN");
        fetchNotes();
    };

    const handleStatusChange = async (id, newStatus) => {
        await updateNoteStatus(id, newStatus);
        fetchNotes();
    };

    const handleDelete = async (id) => {
        await deleteNote(id);
        fetchNotes();
    };

    const ac = avatarColor(customer.name);

    return (
        <>
            <style>{`
                @keyframes modalIn { from { opacity:0; transform:translateY(-10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes noteIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                .notes-textarea:focus { outline:none; border-color:#4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important; }
                .notes-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:30px !important; }
                .notes-select:focus { outline:none; border-color:#4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important; }
                .add-btn:hover  { background:#4338ca !important; }
                .del-btn:hover  { background:#fff0f3 !important; color:#c0395d !important; border-color:#f9c0ce !important; }
                .close-btn:hover { background:#f3f4f6 !important; }
                .note-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
            `}</style>

            {/* overlay */}
            <div
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(15,15,20,0.45)",
                    backdropFilter: "blur(4px)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 1000, padding: 20,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    overflow: "hidden",
                }}
            >
                {/* modal */}
                <div style={{
                    background: "#fff",
                    width: "100%", maxWidth: 500,
                    borderRadius: 18,
                    boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
                    maxHeight: "90vh",
                    height: "auto",
                    display: "flex", flexDirection: "column",
                    animation: "modalIn 0.22s ease",
                    overflow: "hidden",
                }}>

                    {/* ── HEADER ── */}
                    <div style={{
                        padding: "18px 22px",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "#fafafa", flexShrink: 0,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: ac.bg, color: ac.text,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700, fontSize: 15,
                            }}>
                                {getInitial(customer.name)}
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Notes</p>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>
                                    {customer.name}
                                </h2>
                            </div>
                        </div>
                        <button
                            className="close-btn"
                            onClick={onClose}
                            style={{
                                width: 32, height: 32, borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                background: "#fff", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16, color: "#6b7280",
                                transition: "background 0.15s",
                            }}
                        >✕</button>
                    </div>

                    {/* ── ADD NOTE FORM (fixed, never scrolls away) ── */}
                    <div style={{ padding: "20px 22px 0", flexShrink: 0 }}>
                        <div style={{
                            background: "#fafafa",
                            border: "1px solid #e5e7eb",
                            borderRadius: 12, overflow: "hidden",
                        }}>
                            <div style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid #f3f4f6",
                                display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <span style={{ fontSize: 14 }}>📝</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Add Note</span>
                            </div>
                            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                                <textarea
                                    className="notes-textarea"
                                    placeholder="Write a note about this customer…"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: 90,
                                        padding: "10px 13px",
                                        borderRadius: 9,
                                        border: "1px solid #d1d5db",
                                        fontSize: 13.5,
                                        color: "#111827",
                                        background: "#fff",
                                        resize: "vertical",
                                        fontFamily: "inherit",
                                        lineHeight: 1.6,
                                        transition: "border-color 0.15s",
                                        boxSizing: "border-box",
                                    }}
                                />
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <select
                                        className="notes-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: "9px 13px",
                                            borderRadius: 9,
                                            border: "1px solid #d1d5db",
                                            fontSize: 13,
                                            color: "#374151",
                                            background: "#fff",
                                            fontFamily: "inherit",
                                            cursor: "pointer",
                                            transition: "border-color 0.15s",
                                        }}
                                    >
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                    </select>
                                    <button
                                        className="add-btn"
                                        onClick={handleAdd}
                                        style={{
                                            padding: "9px 22px",
                                            borderRadius: 9,
                                            background: "#4f46e5",
                                            color: "#fff",
                                            border: "none",
                                            fontWeight: 600,
                                            fontSize: 13,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            transition: "background 0.15s",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Add Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── NOTES LIST (scrolls internally) ── */}
                    <div style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "16px 22px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            marginBottom: 12,
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>All Notes</span>
                            <span style={{
                                background: "#f3f4f6", color: "#6b7280",
                                padding: "2px 9px", borderRadius: 20,
                                fontSize: 11, fontWeight: 600,
                            }}>
                                {notes.length}
                            </span>
                        </div>

                        {notes.length === 0 && (
                            <div style={{
                                padding: "36px 20px", textAlign: "center",
                                color: "#9ca3af", fontSize: 13,
                                background: "#fafafa", borderRadius: 10,
                                border: "1px dashed #e5e7eb",
                            }}>
                                <div style={{ fontSize: 26, marginBottom: 8 }}>📭</div>
                                No notes yet. Add one above.
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {notes.map((n, i) => (
                                <div
                                    key={n.id}
                                    className="note-card"
                                    onMouseEnter={() => setHoveredId(n.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #f3f4f6",
                                        borderRadius: 11,
                                        padding: "14px 16px",
                                        display: "flex", flexDirection: "column", gap: 10,
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                        transition: "box-shadow 0.15s",
                                        animation: `noteIn 0.2s ease ${i * 0.05}s both`,
                                    }}
                                >
                                    {/* top row: badge + delete */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                        <StatusBadge status={n.status} />
                                        <button
                                            className="del-btn"
                                            onClick={() => handleDelete(n.id)}
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: 7,
                                                background: "#fff",
                                                color: "#9ca3af",
                                                border: "1px solid #e5e7eb",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                fontFamily: "inherit",
                                                transition: "all 0.15s",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>

                                    {/* note content */}
                                    <p style={{
                                        fontSize: 13.5,
                                        color: "#374151",
                                        lineHeight: 1.65,
                                        margin: 0,
                                    }}>
                                        {n.content}
                                    </p>

                                    {/* status changer */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Change status:</span>
                                        <select
                                            className="notes-select"
                                            value={n.status}
                                            onChange={(e) => handleStatusChange(n.id, e.target.value)}
                                            style={{
                                                padding: "5px 28px 5px 10px",
                                                borderRadius: 7,
                                                border: "1px solid #e5e7eb",
                                                fontSize: 12,
                                                color: "#374151",
                                                background: "#f9fafb",
                                                fontFamily: "inherit",
                                                cursor: "pointer",
                                                transition: "border-color 0.15s",
                                            }}
                                        >
                                            <option value="OPEN">Open</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}