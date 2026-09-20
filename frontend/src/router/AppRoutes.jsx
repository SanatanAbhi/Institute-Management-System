import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import StudentLogin from "../pages/StudentLogin";
import CenterLogin from "../pages/CenterLogin";
import SuperAdminLogin from "../pages/SuperAdminLogin";
import ProtectedRoute from "../routes/ProtectedRoute";
import StudentDashboard from "../pages/StudentDashboard";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/center-login" element={<CenterLogin />} />
            <Route path="/super-admin-login" element={<SuperAdminLogin />} />
            <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        </Routes>
    );
}