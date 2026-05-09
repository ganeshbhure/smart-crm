import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    const navigate = useNavigate();

    /* ── unchanged logic ── */
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError("Please enter your email and password.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const data = await loginUser(email, password);
            localStorage.setItem("token", data.data);
            navigate("/dashboard");
        } catch (err) {
            console.log(err);
            setError("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
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
                {/* card */}
                <div style={{
                    width: "100%",
                    maxWidth: 420,
                    animation: "fadeUp 0.3s ease",
                }}>

                    {/* logo + brand */}
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: "#4f46e5",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, color: "#fff", fontWeight: 800,
                            marginBottom: 14,
                        }}>S</div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#111827" }}>
                            Smart CRM
                        </h1>
                        <p style={{ fontSize: 13.5, color: "#6b7280", marginTop: 4 }}>
                            Sign in to your account
                        </p>
                    </div>

                    {/* form card */}
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

                        {/* email */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: "block",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#374151",
                                marginBottom: 6,
                            }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                onKeyDown={handleKeyDown}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: 9,
                                    border: "1px solid #d1d5db",
                                    fontSize: 14,
                                    color: "#111827",
                                    background: "#fff",
                                    transition: "border-color 0.15s",
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>

                        {/* password */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: "block",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#374151",
                                marginBottom: 6,
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                onKeyDown={handleKeyDown}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: 9,
                                    border: "1px solid #d1d5db",
                                    fontSize: 14,
                                    color: "#111827",
                                    background: "#fff",
                                    transition: "border-color 0.15s",
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>

                        {/* submit */}
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "11px",
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
                            {loading ? "Signing in…" : "Sign in →"}
                        </button>
                    </div>

                    {/* footer note */}
                    <p style={{ textAlign: "center", fontSize: 12.5, color: "#9ca3af", marginTop: 20 }}>
                        Smart CRM · Secure login
                    </p>
                    <p>
            Don't have an account?{" "}
            <span
                onClick={() => navigate("/register")}
                style={{ color: "blue", cursor: "pointer" }}
            >
                Register
            </span>
        </p>
                </div>
            </div>
        </>
    );
}