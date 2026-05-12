import { useEffect } from "react";
import Sidebar from "./Sidebar";

/* ─── Global styles injected once ──────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans','Segoe UI',sans-serif; background: #f4f5f7; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeDown{ from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes menuIn  { from { opacity:0; transform:scale(0.96) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }

  .an-card  { animation: fadeUp 0.38s ease both; }
  .an-card:nth-child(1){ animation-delay:.05s; }
  .an-card:nth-child(2){ animation-delay:.12s; }
  .an-card:nth-child(3){ animation-delay:.19s; }
  .an-chart { animation: fadeUp 0.42s .26s ease both; }

  .s-card  { animation: fadeUp 0.35s ease both; }
  .s-card:nth-child(1) { animation-delay: .04s; }
  .s-card:nth-child(2) { animation-delay: .10s; }
  .s-card:nth-child(3) { animation-delay: .16s; }

  .s-input:focus {
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.11) !important;
    outline: none;
  }
  .s-save:hover:not(:disabled) { background: #4338ca !important; transform: translateY(-1px); }
  .s-save:disabled              { opacity: .55; cursor: not-allowed; }
  .s-logout:hover               { background: #fff0f3 !important; border-color: #f9c0ce !important; color: #c0395d !important; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
`;

/**
 * Layout
 * ──────
 * Wraps every authenticated page with:
 *   • Persistent sidebar (left)
 *   • Topbar (right side: title + optional slot for page actions)
 *   • Scrollable page body
 *
 * Props:
 *   title       – page title shown in topbar (string, optional)
 *   topbarRight – React node for action buttons in topbar (optional)
 *   children    – page content
 */
export default function Layout({ title, topbarRight, children }) {
    /* Inject global CSS once */
    useEffect(() => {
        const existing = document.getElementById("crm-global-styles");
        if (existing) return;
        const tag = document.createElement("style");
        tag.id = "crm-global-styles";
        tag.innerHTML = GLOBAL_CSS;
        document.head.appendChild(tag);
        // Don't remove on unmount — we want it persistent
    }, []);

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            overflow: "hidden",
            fontFamily: "'DM Sans','Segoe UI',sans-serif",
            background: "#f4f5f7",
        }}>
            {/* ── Sidebar ── */}
            <Sidebar />

            {/* ── Main column ── */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minWidth: 0,
            }}>
                {/* ── Topbar ── */}
                <header style={{
                    height: 56,
                    minHeight: 56,
                    background: "#fff",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 24px",
                    gap: 16,
                    flexShrink: 0,
                    zIndex: 50,
                }}>
                    <span style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#111827",
                        letterSpacing: "-0.2px",
                    }}>
                        {title}
                    </span>

                    {topbarRight && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {topbarRight}
                        </div>
                    )}
                </header>

                {/* ── Page body ── */}
                <main style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}