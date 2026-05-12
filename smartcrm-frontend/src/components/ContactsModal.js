import { useEffect, useState } from "react";
import { getContacts, addContact } from "../services/api";

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

function ContactsModal({ customer, onClose }) {

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast]       = useState({ msg: "", type: "" });
    const [hoveredId, setHoveredId] = useState(null);

    const [name, setName]       = useState("");
    const [email, setEmail]     = useState("");
    const [phone, setPhone]     = useState("");
    const [company, setCompany] = useState("");

    // 🔐 GET ROLE FROM TOKEN
    const token = localStorage.getItem("token");
    let role = "";
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role;
    }

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "" }), 3000);
    };

    // 📥 FETCH CONTACTS
    const fetchContacts = async () => {
        setLoading(true);
        try {
            const data = await getContacts(customer.id);
            setContacts(data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [customer]);

    // ➕ ADD CONTACT (ADMIN ONLY)
    const handleAddContact = async () => {
        setSubmitting(true);
        try {
            const newContact = {
                name,
                email,
                phone,
                company,
                customerId: customer.id
            };

            await addContact(newContact);

            setName("");
            setEmail("");
            setPhone("");
            setCompany("");

            showToast("Contact added successfully.", "success");
            fetchContacts();

        } catch (err) {
            console.log(err);
            showToast("Failed to add contact.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "9px 13px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        fontSize: 13.5,
        color: "#111827",
        background: "#fff",
        fontFamily: "inherit",
        transition: "border-color 0.15s, box-shadow 0.15s",
        outline: "none",
    };

    return (
        <>
            <style>{`
                @keyframes fadeIn    { from { opacity:0; transform:translateY(-10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes cardIn   { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                @keyframes slideUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .crm-input:focus    { border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12) !important; }
                .crm-close:hover    { background: #f3f4f6 !important; }
                .crm-overlay        { animation: none; }
                .crm-contact-list::-webkit-scrollbar       { width: 5px; }
                .crm-contact-list::-webkit-scrollbar-track { background: transparent; }
                .crm-contact-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .crm-contact-list::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>

            {/* overlay */}
            <div
                className="crm-overlay"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(15,15,20,0.45)",
                    backdropFilter: "blur(4px)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 1000, padding: 20,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
            >
                {/* modal — fixed height, flex column, never grows past viewport */}
                <div style={{
                    background: "#fff",
                    width: "100%", maxWidth: 480,
                    borderRadius: 18,
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
                    maxHeight: "88vh",
                    height: "88vh",
                    display: "flex", flexDirection: "column",
                    animation: "fadeIn 0.22s ease",
                    overflow: "hidden",
                }}>

                    {/* ── HEADER — fixed, never scrolls ── */}
                    <div style={{
                        padding: "18px 22px",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "#fafafa",
                        flexShrink: 0,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: avatarColor(customer.name).bg,
                                color: avatarColor(customer.name).text,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700, fontSize: 15,
                            }}>
                                {getInitial(customer.name)}
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contacts</p>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>
                                    {customer.name}
                                </h2>
                            </div>
                        </div>
                        <button
                            className="crm-close"
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

                    {/* ── BODY — flex column, fills remaining height, clips overflow ── */}
                    <div
                        style={{
                            flex: 1,
                            minHeight: 0,           /* critical: allows flex child to shrink below content size */
                            padding: "20px 22px 0 22px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                            overflow: "hidden",
                        }}
                    >

                        {/* ── ADD CONTACT FORM — fixed, never scrolls ── */}
                        {role === "ADMIN" && (
                            <div style={{
                                background: "#fafafa",
                                border: "1px solid #e5e7eb",
                                borderRadius: 12, overflow: "hidden",
                                flexShrink: 0,
                                marginBottom: 22,
                            }}>
                                <div style={{
                                    padding: "12px 16px",
                                    borderBottom: "1px solid #f3f4f6",
                                    display: "flex", alignItems: "center", gap: 8,
                                }}>
                                    <span style={{ fontSize: 14 }}>➕</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Add Contact</span>
                                </div>
                                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        {[
                                            { label: "Name",    value: name,    set: setName,    ph: "Jane Doe",         type: "text"  },
                                            { label: "Email",   value: email,   set: setEmail,   ph: "jane@company.com", type: "email" },
                                            { label: "Phone",   value: phone,   set: setPhone,   ph: "+91 98765 43210",  type: "tel"   },
                                            { label: "Company", value: company, set: setCompany, ph: "Acme Corp",        type: "text"  },
                                        ].map((f) => (
                                            <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                                    {f.label}
                                                </label>
                                                <input
                                                    className="crm-input"
                                                    type={f.type}
                                                    placeholder={f.ph}
                                                    value={f.value}
                                                    onChange={(e) => f.set(e.target.value)}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleAddContact}
                                        disabled={submitting}
                                        style={{
                                            marginTop: 4,
                                            padding: "9px 18px",
                                            borderRadius: 8,
                                            background: submitting ? "#a5a0f0" : "#4f46e5",
                                            color: "#fff", border: "none",
                                            fontWeight: 600, fontSize: 13,
                                            cursor: submitting ? "not-allowed" : "pointer",
                                            fontFamily: "inherit",
                                            alignSelf: "flex-end",
                                            transition: "background 0.15s",
                                        }}
                                    >
                                        {submitting ? "Adding…" : "Add Contact"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── CONTACT LIST SECTION — fills remaining space, scrolls independently ── */}
                        <div style={{
                            flex: 1,
                            minHeight: 0,           /* critical: allows this section to shrink and scroll */
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            {/* list header — fixed within section */}
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                marginBottom: 12,
                                flexShrink: 0,
                            }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                                    Contact List
                                </span>
                                <span style={{
                                    background: "#f3f4f6", color: "#6b7280",
                                    padding: "2px 9px", borderRadius: 20,
                                    fontSize: 11, fontWeight: 600,
                                }}>
                                    {contacts.length}
                                </span>
                            </div>

                            {/* loading */}
                            {loading && (
                                <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                                    <div style={{ fontSize: 22, marginBottom: 8 }}>⏳</div>
                                    Loading contacts…
                                </div>
                            )}

                            {/* empty */}
                            {!loading && contacts.length === 0 && (
                                <div style={{
                                    padding: "36px 20px", textAlign: "center",
                                    color: "#9ca3af", fontSize: 13,
                                    background: "#fafafa", borderRadius: 10,
                                    border: "1px dashed #e5e7eb",
                                }}>
                                    <div style={{ fontSize: 26, marginBottom: 8 }}>📭</div>
                                    No contacts found for this customer.
                                </div>
                            )}

                            {/* scrollable list — ONLY this area scrolls */}
                            <div
                                className="crm-contact-list"
                                style={{
                                    flex: 1,
                                    minHeight: 0,       /* critical: enables overflow scroll within flex */
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                    paddingRight: 4,
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "#e5e7eb transparent",
                                }}
                            >
                                {contacts.map((c, i) => {
                                    const ac = avatarColor(c.name);
                                    const isHovered = hoveredId === c.id;
                                    return (
                                        <div
                                            key={c.id}
                                            onMouseEnter={() => setHoveredId(c.id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 13,
                                                padding: "13px 15px",
                                                border: "1px solid #f3f4f6",
                                                borderRadius: 10,
                                                background: isHovered ? "#fafafa" : "#fff",
                                                transition: "background 0.12s, box-shadow 0.12s",
                                                boxShadow: isHovered ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                                                animation: `cardIn 0.2s ease ${i * 0.05}s both`,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {/* avatar */}
                                            <div style={{
                                                width: 38, height: 38, borderRadius: "50%",
                                                background: ac.bg, color: ac.text,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontWeight: 700, fontSize: 15, flexShrink: 0,
                                            }}>
                                                {getInitial(c.name)}
                                            </div>

                                            {/* info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 600, fontSize: 13.5, color: "#111827", marginBottom: 2 }}>
                                                    {c.name}
                                                </p>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px" }}>
                                                    {c.email && (
                                                        <span style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            ✉ {c.email}
                                                        </span>
                                                    )}
                                                    {c.phone && (
                                                        <span style={{ fontSize: 12, color: "#6b7280" }}>
                                                            📞 {c.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* company badge */}
                                            {c.company && (
                                                <span style={{
                                                    background: "#d6f5ea", color: "#1a7a4a",
                                                    padding: "3px 10px", borderRadius: 20,
                                                    fontSize: 11, fontWeight: 600,
                                                    whiteSpace: "nowrap", flexShrink: 0,
                                                }}>
                                                    {c.company}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── TOAST — fixed at bottom, never scrolls ── */}
                    {toast.msg && (
                        <div style={{
                            margin: "12px 22px 18px",
                            padding: "11px 16px",
                            borderRadius: 9,
                            fontSize: 13, fontWeight: 500,
                            display: "flex", alignItems: "center", gap: 8,
                            flexShrink: 0,
                            animation: "slideUp 0.2s ease",
                            ...(toast.type === "success"
                                    ? { background: "#d6f5ea", color: "#1a7a4a", borderLeft: "4px solid #1a7a4a" }
                                    : { background: "#fff0f3", color: "#c0395d", borderLeft: "4px solid #c0395d" }
                            ),
                        }}>
                            {toast.type === "success" ? "✅" : "⚠️"} {toast.msg}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

export default ContactsModal;