import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <Analytics />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/companies"
                    element={
                        <ProtectedRoute>
                            <Companies />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/companies/:name"
                    element={
                        <ProtectedRoute>
                            <CompanyDetail />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;