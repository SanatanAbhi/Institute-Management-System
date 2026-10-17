import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import StudentLogin from "../pages/StudentLogin";
import CenterLogin from "../pages/CenterLogin";
import SuperAdminLogin from "../pages/SuperAdminLogin";

import ProtectedRoute from "../routes/ProtectedRoute";
import CenterModuleLayout from "./CenterModuleLayout";

import StudentDashboard from "../pages/StudentDashboard";
import CenterDashboard from "../pages/CenterDashboard";
import CenterStudents from "../pages/CenterStudents";
import CenterAdmissions from "../pages/CenterAdmissions";
import CenterFees from "../pages/CenterFees";
import CenterAttendance from "../pages/CenterAttendance";
import CenterExams from "../pages/CenterExams";
import CenterResults from "../pages/CenterResults";
import CenterCertificates from "../pages/CenterCertificates";
import ApplyNow from "../pages/ApplyNow";
import SuperAdminDashboard from "../pages/SuperAdminDashboard";
import SuperAdminUsers from "../pages/SuperAdminUsers";


export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/"
                element={<HomePage />}
            />

            <Route
                path="/student-login"
                element={<StudentLogin />}
            />

            <Route
                path="/center-login"
                element={<CenterLogin />}
            />

            <Route path="/apply-now" element={<ApplyNow />} />

            <Route
                path="/super-admin-login"
                element={<SuperAdminLogin />}
            />


            {/* Student */}
            <Route
                path="/student-dashboard"
                element={
                    <ProtectedRoute>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />


            {/* Center dashboard */}
            <Route
                path="/center-dashboard"
                element={
                    <ProtectedRoute>
                        <CenterDashboard />
                    </ProtectedRoute>
                }
            />


            {/* Center modules with shared Back button */}
            <Route
                path="/center-students"
                element={
                    <ProtectedRoute>
                        <CenterModuleLayout>
                            <CenterStudents />
                        </CenterModuleLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/center-admissions"
                element={
                    <ProtectedRoute>
                        <CenterModuleLayout>
                            <CenterAdmissions />
                        </CenterModuleLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/center-fees"
                element={
                    <ProtectedRoute>
                        <CenterModuleLayout>
                            <CenterFees />
                        </CenterModuleLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/center-attendance"
                element={
                    <ProtectedRoute>
                        <CenterModuleLayout>
                            <CenterAttendance />
                        </CenterModuleLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/center-exams"
                element={
                    <ProtectedRoute>
                        <CenterModuleLayout>
                            <CenterExams />
                        </CenterModuleLayout>
                    </ProtectedRoute>
                }
            />


            {/* Results has its own Back button */}
            <Route
                path="/center-results"
                element={
                    <ProtectedRoute>
                        <CenterResults />
                    </ProtectedRoute>
                }
            />


            {/* Certificates has its own Back button */}
            <Route
                path="/center-certificates"
                element={
                    <ProtectedRoute>
                        <CenterCertificates />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/super-admin-dashboard"
                element={
                    <ProtectedRoute>
                        <SuperAdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/super-admin-users"
                element={
                    <ProtectedRoute>
                        <SuperAdminUsers />
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}