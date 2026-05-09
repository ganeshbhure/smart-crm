import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8080";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

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
    margin: "4px 0 0 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "24px",
    maxWidth: "900px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px 32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
    boxSizing: "border-box",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 20px 0",
    paddingBottom: "14px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  avatarWrap: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
    letterSpacing: "-0.5px",
  },
  avatarInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  avatarName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
  },
  avatarEmail: {
    fontSize: "13px",
    color: "#64748b",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  value: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e293b",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "9px 14px",
  },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "600",
    background: "#ede9fe",
    color: "#6d28d9",
    padding: "4px 12px",
    borderRadius: "20px",
    alignSelf: "flex-start",
  },
  input: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e293b",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    padding: "9px 14px",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    width: "100%",
    boxSizing: "border-box",
  },
  saveBtn: {
    marginTop: "6px",
    width: "100%",
    padding: "11px",
    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.15s ease, transform 0.15s ease",
    letterSpacing: "0.01em",
  },
  logoutBtn: {
    marginTop: "6px",
    width: "100%",
    padding: "11px",
    background: "#fff",
    color: "#ef4444",
    border: "1.5px solid #fecaca",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
  },
  toast: (type) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "14px",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    background: type === "success" ? "#d1fae5" : "#fee2e2",
    color: type === "success" ? "#065f46" : "#991b1b",
    border: `1px solid ${type === "success" ? "#a7f3d0" : "#fca5a5"}`,
  }),
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
    width: "38px",
    height: "38px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
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
  divider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "20px 0",
  },
};

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .settings-card { animation: fadeUp 0.4s ease both; }
      .settings-card:nth-child(1) { animation-delay: 0.04s; }
      .settings-card:nth-child(2) { animation-delay: 0.12s; }
      .settings-card:nth-child(3) { animation-delay: 0.20s; }
      .settings-input:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
      }
      .settings-save-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      .settings-save-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      .settings-logout-btn:hover { background: #fff5f5 !important; border-color: #ef4444 !important; }
    `;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: authHeaders(),
        });
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

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  const getInitials = (n) =>
    (n || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Loading settings…</span>
      </div>
    );
  }

  if (fetchError) {
    return <div style={styles.errorWrap}>⚠️ {fetchError}</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Settings</h1>
        <p style={styles.headerSub}>Manage your profile and account preferences.</p>
      </div>

      <div style={styles.grid}>
        {/* Profile Overview */}
        <div style={styles.card} className="settings-card">
          <h2 style={styles.cardTitle}>
            <span>👤</span> Profile Overview
          </h2>

          <div style={styles.avatarWrap}>
            <div style={styles.avatar}>{getInitials(profile?.name)}</div>
            <div style={styles.avatarInfo}>
              <span style={styles.avatarName}>{profile?.name}</span>
              <span style={styles.avatarEmail}>{profile?.email}</span>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.field}>
              <span style={styles.label}>Email</span>
              <div style={styles.value}>{profile?.email}</div>
            </div>
            <div style={styles.field}>
              <span style={styles.label}>Role</span>
              <div>
                <span style={styles.roleBadge}>{profile?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div style={styles.card} className="settings-card">
          <h2 style={styles.cardTitle}>
            <span>✏️</span> Edit Profile
          </h2>

          <div style={styles.fieldGroup}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="settings-name">
                Full Name
              </label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                className="settings-input"
                placeholder="Enter your name"
                autoComplete="off"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="settings-password">
                New Password
              </label>
              <input
                id="settings-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                className="settings-input"
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={styles.saveBtn}
              className="settings-save-btn"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            {saveStatus && (
              <div style={styles.toast(saveStatus.type)}>
                <span>{saveStatus.type === "success" ? "✅" : "⚠️"}</span>
                {saveStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Account */}
        <div style={styles.card} className="settings-card">
          <h2 style={styles.cardTitle}>
            <span>🔐</span> Account
          </h2>

          <div style={styles.fieldGroup}>
            <div style={styles.field}>
              <span style={styles.label}>Session</span>
              <div style={styles.value}>Signed in as {profile?.email}</div>
            </div>
          </div>

          <div style={styles.divider} />

          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            className="settings-logout-btn"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}