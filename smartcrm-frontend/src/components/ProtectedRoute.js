import {Navigate, useNavigate} from "react-router-dom";


function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");


    if (!token) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;