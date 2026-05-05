import React, { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Register() {
    const [user, setUser] = useState({ name: "", email: "", password: "" });
    const [error, setError]     = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    /* ── unchanged logic ── */
    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!user.name || !user.email || !user.password) {
            setError("All fields are required.");
            return;
        }
        if (user.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            await registerUser(user);
            setSuccess("Account created! Redirecting to login…");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            setError("Registration failed. Try a different email.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "10px 14px",
        borderRadius: 9,
        border: "1px solid #d1d5db",
        fontSize: 14,
        color: "#111827",
        background: "#fff",
        transition: "border-color 0.15s",
        fontFamily: "inherit",
    };

    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                input:focus { outline: none; border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
                @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
            `}</style>

            <div style={{
                minHeight: "100vh",
                background: "#f4f5f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}>
                <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.3s ease" }}>

                    {/* brand */}
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: "#4f46e5",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, color: "#fff", fontWeight: 800,
                            marginBottom: 14,
                        }}>S</div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#111827" }}>
                            Create your account
                        </h1>
                        <p style={{ fontSize: 13.5, color: "#6b7280", marginTop: 4 }}>
                            Join Smart CRM today
                        </p>
                    </div>

                    {/* card */}
                    <div style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 16,
                        padding: "32px 30px",
                    }}>

                        {/* error banner */}
                        {error && (
                            <div style={{
                                background: "#fff0f3",
                                border: "1px solid #f9c0ce",
                                borderLeft: "4px solid #c0395d",
                                borderRadius: 8,
                                padding: "11px 14px",
                                marginBottom: 20,
                                fontSize: 13,
                                color: "#c0395d",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                animation: "shake 0.35s ease",
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* success banner */}
                        {success && (
                            <div style={{
                                background: "#d6f5ea",
                                border: "1px solid #6edbb4",
                                borderLeft: "4px solid #1a7a4a",
                                borderRadius: 8,
                                padding: "11px 14px",
                                marginBottom: 20,
                                fontSize: 13,
                                color: "#1a7a4a",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}>
                                ✅ {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>

                            {/* name */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                    Full name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Jane Doe"
                                    value={user.name}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* email */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@company.com"
                                    value={user.email}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            {/* password */}
                            <div style={{ marginBottom: 10 }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="At least 6 characters"
                                    value={user.password}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                                {/* password strength hint */}
                                {user.password.length > 0 && (
                                    <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
                                        {[1, 2, 3].map((level) => {
                                            const strength = user.password.length < 6 ? 1 : user.password.length < 10 ? 2 : 3;
                                            const colors = { 1: "#c0395d", 2: "#d97706", 3: "#1a7a4a" };
                                            return (
                                                <div key={level} style={{
                                                    flex: 1, height: 4, borderRadius: 99,
                                                    background: level <= strength ? colors[strength] : "#e5e7eb",
                                                    transition: "background 0.2s",
                                                }} />
                                            );
                                        })}
                                    </div>
                                )}
                                {user.password.length > 0 && (
                                    <p style={{
                                        fontSize: 11.5, marginTop: 5, fontWeight: 500,
                                        color: user.password.length < 6 ? "#c0395d" : user.password.length < 10 ? "#d97706" : "#1a7a4a",
                                    }}>
                                        {user.password.length < 6 ? "Too short" : user.password.length < 10 ? "Good" : "Strong"}
                                    </p>
                                )}
                            </div>

                            {/* submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "11px",
                                    marginTop: 18,
                                    borderRadius: 9,
                                    background: loading ? "#a5a0f0" : "#4f46e5",
                                    color: "#fff",
                                    border: "none",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontFamily: "inherit",
                                    letterSpacing: "0.2px",
                                    transition: "background 0.15s",
                                }}
                            >
                                {loading ? "Creating account…" : "Create account →"}
                            </button>
                        </form>

                        {/* divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 20px" }}>
                            <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>or</span>
                            <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
                        </div>

                        {/* login link */}
                        <p style={{ textAlign: "center", fontSize: 13.5, color: "#6b7280" }}>
                            Already have an account?{" "}
                            <Link to="/" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <p style={{ textAlign: "center", fontSize: 12.5, color: "#9ca3af", marginTop: 20 }}>
                        Smart CRM · Secure registration
                    </p>
                </div>
            </div>
        </>
    );
}