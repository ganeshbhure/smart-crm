import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const BASE_URL = "http://localhost:8080";

const getToken    = () => localStorage.getItem("token");
const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

export default function Settings() {
    /* ── state (unchanged) ── */
    const [profile,    setProfile]    = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [name,       setName]       = useState("");
    const [password,   setPassword]   = useState("");
    const [saving,     setSaving]     = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    /* ── fetch profile (unchanged) ── */
    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`${BASE_URL}/api/auth/profile`, { headers: authHeaders() });
                if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
                const data = await res.json();
                setProfile(data);
                setName(data.name || "");
            } catch (err) {
                setFetchError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    /* ── save handler (unchanged) ── */
    async function handleSave() {
        if (!name.trim()) {
            setSaveStatus({ type: "error", message: "Name cannot be empty." });
            return;
        }
        setSaving(true);
        setSaveStatus(null);
        const body = { name: name.trim() };
        if (password.trim()) body.password = password.trim();
        try {
            const res = await fetch(`${BASE_URL}/api/auth/profile`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`Update failed (${res.status})`);
            const updated = await res.json();
            setProfile((prev) => ({ ...prev, name: updated.name || name }));
            setPassword("");
            setSaveStatus({ type: "success", message: "Profile updated successfully." });
        } catch (err) {
            setSaveStatus({ type: "error", message: err.message || "Update failed." });
        } finally {
            setSaving(false);
        }
    }

    /* ── logout (unchanged) ── */
    function handleLogout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    /* ── helpers ── */
    const getInitials = (n) =>
        (n || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    const AVATAR_COLORS = [
        { bg: "#e8e4ff", text: "#5b4fcf" },
        { bg: "#fde8ef", text: "#c0395d" },
        { bg: "#d6f5ea", text: "#1a7a4a" },
        { bg: "#fff3cd", text: "#856404" },
        { bg: "#e3f0ff", text: "#1557a0" },
    ];
    const ac = AVATAR_COLORS[(profile?.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

    /* ── shared sub-styles ── */
    const inputStyle = {
        width: "100%",
        padding: "9px 13px",
        borderRadius: 9,
        border: "1px solid #d1d5db",
        fontSize: 13.5,
        fontWeight: 500,
        color: "#111827",
        background: "#fff",
        fontFamily: "inherit",
        transition: "border-color 0.15s, box-shadow 0.15s",
    };

    const labelStyle = {
        fontSize: 11,
        fontWeight: 700,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.55px",
        marginBottom: 5,
        display: "block",
    };

    const panelHeader = (icon, title) => (
        <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex", alignItems: "center", gap: 8,
            background: "#fafafa",
        }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#374151" }}>{title}</span>
        </div>
    );

    /* ── loading ── */
    if (loading) {
        return (
            <Layout title="Settings">
                <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    minHeight: "60vh", gap: 16,
                }}>
                    <div style={{
                        width: 38, height: 38,
                        border: "3px solid #e5e7eb", borderTop: "3px solid #4f46e5",
                        borderRadius: "50%", animation: "spin 0.75s linear infinite",
                    }} />
                    <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>Loading settings…</span>
                </div>
            </Layout>
        );
    }

    /* ── error ── */
    if (fetchError) {
        return (
            <Layout title="Settings">
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
                        <p style={{ color: "#c0395d", fontWeight: 600, fontSize: 14 }}>{fetchError}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    /* ── render ── */
    return (
        <Layout title="Settings">
            <div style={{ padding: "28px 32px" }}>
                {/* Page subtitle */}
                <p style={{ fontSize: 13.5, color: "#6b7280", marginBottom: 24 }}>
                    Manage your profile and account preferences.
                </p>

                {/* MAIN LAYOUT — 2 cols on wide, stacked on narrow */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 18,
                    alignItems: "start",
                }}>
                    {/* ── CARD 1: Profile Info ── */}
                    <div
                        className="s-card"
                        style={{
                            background: "#fff",
                            borderRadius: 14,
                            border: "1px solid #e5e7eb",
                            overflow: "hidden",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        }}
                    >
                        {panelHeader("👤", "Profile")}

                        <div style={{ padding: "20px" }}>
                            {/* Avatar + name */}
                            <div style={{
                                display: "flex", alignItems: "center", gap: 14,
                                padding: "14px 16px",
                                background: "#f9fafb",
                                borderRadius: 10,
                                border: "1px solid #f3f4f6",
                                marginBottom: 18,
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    background: ac.bg, color: ac.text,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800, fontSize: 18,
                                    flexShrink: 0, letterSpacing: "-0.5px",
                                }}>
                                    {getInitials(profile?.name)}
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                                        {profile?.name}
                                    </div>
                                    <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 1 }}>
                                        {profile?.email}
                                    </div>
                                </div>
                            </div>

                            {/* fields */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <span style={labelStyle}>Email</span>
                                    <div style={{
                                        padding: "9px 13px",
                                        borderRadius: 9,
                                        border: "1px solid #f3f4f6",
                                        background: "#f9fafb",
                                        fontSize: 13.5, fontWeight: 500, color: "#374151",
                                    }}>
                                        {profile?.email}
                                    </div>
                                </div>
                                <div>
                                    <span style={labelStyle}>Role</span>
                                    <div>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: "#e8e4ff", color: "#5b4fcf",
                        padding: "3px 12px", borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                        letterSpacing: "0.4px", textTransform: "uppercase",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5b4fcf", display: "inline-block" }} />
                        {profile?.role}
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── CARD 2: Edit Profile ── */}
                    <div
                        className="s-card"
                        style={{
                            background: "#fff",
                            borderRadius: 14,
                            border: "1px solid #e5e7eb",
                            overflow: "hidden",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        }}
                    >
                        {panelHeader("✏️", "Edit Profile")}

                        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                            {/* name */}
                            <div>
                                <label htmlFor="settings-name" style={labelStyle}>Full Name</label>
                                <input
                                    id="settings-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={inputStyle}
                                    className="s-input"
                                    placeholder="Enter your name"
                                    autoComplete="off"
                                />
                            </div>

                            {/* password */}
                            <div>
                                <label htmlFor="settings-password" style={labelStyle}>New Password</label>
                                <input
                                    id="settings-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={inputStyle}
                                    className="s-input"
                                    placeholder="Leave blank to keep current"
                                    autoComplete="new-password"
                                />
                                <p style={{ fontSize: 11.5, color: "#9ca3af", margin: "5px 0 0" }}>
                                    Only fill this if you want to change your password.
                                </p>
                            </div>

                            {/* save button */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="s-save"
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: 9,
                                    background: "#4f46e5",
                                    color: "#fff",
                                    border: "none",
                                    fontWeight: 700,
                                    fontSize: 13.5,
                                    cursor: saving ? "not-allowed" : "pointer",
                                    fontFamily: "inherit",
                                    transition: "background 0.15s, transform 0.15s",
                                    letterSpacing: "0.1px",
                                    width: "100%",
                                }}
                            >
                                {saving ? "Saving…" : "Save Changes"}
                            </button>

                            {/* status toast */}
                            {saveStatus && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "10px 14px",
                                    borderRadius: 9,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    ...(saveStatus.type === "success"
                                            ? { background: "#d6f5ea", color: "#1a7a4a", borderLeft: "4px solid #1a7a4a" }
                                            : { background: "#fff0f3", color: "#c0395d", borderLeft: "4px solid #c0395d" }
                                    ),
                                }}>
                                    <span>{saveStatus.type === "success" ? "✅" : "⚠️"}</span>
                                    {saveStatus.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── CARD 3: Account ── */}
                    <div
                        className="s-card"
                        style={{
                            background: "#fff",
                            borderRadius: 14,
                            border: "1px solid #e5e7eb",
                            overflow: "hidden",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            gridColumn: "1 / -1",
                            maxWidth: 440,
                        }}
                    >
                        {panelHeader("🔐", "Account")}

                        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                            {/* session info */}
                            <div>
                                <span style={labelStyle}>Session</span>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "10px 14px",
                                    borderRadius: 9,
                                    background: "#f9fafb",
                                    border: "1px solid #f3f4f6",
                                    fontSize: 13.5, fontWeight: 500, color: "#374151",
                                }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: ac.bg, color: ac.text,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                                    }}>
                                        {getInitials(profile?.name)}
                                    </div>
                                    <span>Signed in as <strong>{profile?.email}</strong></span>
                                </div>
                            </div>

                            {/* divider */}
                            <div style={{ height: 1, background: "#f3f4f6" }} />

                            {/* sign out */}
                            <button
                                onClick={handleLogout}
                                className="s-logout"
                                style={{
                                    padding: "9px 20px",
                                    borderRadius: 9,
                                    background: "#fff",
                                    color: "#6b7280",
                                    border: "1px solid #e5e7eb",
                                    fontWeight: 600,
                                    fontSize: 13.5,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "all 0.15s",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    width: "100%",
                                }}
                            >
                                <span style={{ fontSize: 15 }}>🚪</span>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}