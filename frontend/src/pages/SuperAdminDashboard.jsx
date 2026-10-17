import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import SuperAdminLayout from "../router/SuperAdminLayout";


const dashboardCards = [
    {
        key: "total_centers",
        label: "Training Centers",
        icon: "bi-building",
        color: "#2563EB",
        background: "#DBEAFE",
    },
    {
        key: "total_students",
        label: "Students",
        icon: "bi-people",
        color: "#059669",
        background: "#D1FAE5",
    },
    {
        key: "total_courses",
        label: "Courses",
        icon: "bi-book",
        color: "#7C3AED",
        background: "#EDE9FE",
    },
    {
        key: "total_batches",
        label: "Batches",
        icon: "bi-collection",
        color: "#D97706",
        background: "#FEF3C7",
    },
    {
        key: "total_admissions",
        label: "Admissions",
        icon: "bi-person-plus",
        color: "#0891B2",
        background: "#CFFAFE",
    },
    {
        key: "total_fee_records",
        label: "Fee Records",
        icon: "bi-currency-rupee",
        color: "#DC2626",
        background: "#FEE2E2",
    },
    {
        key: "total_attendance_records",
        label: "Attendance Records",
        icon: "bi-calendar-check",
        color: "#4F46E5",
        background: "#E0E7FF",
    },
    {
        key: "total_exams",
        label: "Exams",
        icon: "bi-pencil-square",
        color: "#9333EA",
        background: "#F3E8FF",
    },
    {
        key: "total_results",
        label: "Results",
        icon: "bi-bar-chart",
        color: "#0D9488",
        background: "#CCFBF1",
    },
    {
        key: "total_certificates",
        label: "Certificates",
        icon: "bi-award",
        color: "#CA8A04",
        background: "#FEF9C3",
    },
    {
        key: "total_applications",
        label: "Applications",
        icon: "bi-file-earmark-text",
        color: "#DB2777",
        background: "#FCE7F3",
    },
    {
        key: "total_users",
        label: "System Users",
        icon: "bi-person-gear",
        color: "#475569",
        background: "#E2E8F0",
    },
];


function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString();
}


export default function SuperAdminDashboard() {
    const navigate = useNavigate();

    const [metrics, setMetrics] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            try {
                setLoading(true);
                setErrorMessage("");

                const response = await api.get(
                    "/accounts/dashboard/"
                );

                if (!cancelled) {
                    setMetrics(response.data.metrics || {});
                    setRecentUsers(
                        response.data.recent_users || []
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    setErrorMessage(
                        error.response?.data?.detail ||
                        "Unable to load dashboard data. Check your Super Admin session and backend permissions."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <SuperAdminLayout active="dashboard">
            <div className="mb-4">
                <div className="fw-bold fs-3 mb-1">
                    Executive Overview
                </div>
                <p className="text-muted mb-0">
                    Monitor your institute's centers, academic activity,
                    system users and records from one place.
                </p>
            </div>

            {errorMessage && (
                <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {errorMessage}
                </div>
            )}

            <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-4">
                    <div
                        className="card border-0 shadow-sm h-100"
                        style={{
                            borderRadius: "16px",
                            background: "#111827",
                            color: "#FFFFFF",
                        }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div
                                        className="small mb-2"
                                        style={{ color: "#D1D5DB" }}
                                    >
                                        Active Accounts
                                    </div>
                                    <div className="display-6 fw-bold">
                                        {loading
                                            ? "—"
                                            : metrics?.active_users ?? 0}
                                    </div>
                                    <small style={{ color: "#D1D5DB" }}>
                                        Enabled system accounts
                                    </small>
                                </div>

                                <div
                                    className="rounded-3 p-3"
                                    style={{ background: "#374151" }}
                                >
                                    <i className="bi bi-shield-check fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-4">
                    <div className="card border-0 shadow-sm h-100"
                        style={{ borderRadius: "16px" }}>
                        <div className="card-body p-4">
                            <div className="text-muted small mb-2">
                                Super Admin Accounts
                            </div>
                            <div className="display-6 fw-bold">
                                {loading
                                    ? "—"
                                    : metrics?.super_admins ?? 0}
                            </div>
                            <small className="text-muted">
                                Active administrative accounts
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-4">
                    <div className="card border-0 shadow-sm h-100"
                        style={{ borderRadius: "16px" }}>
                        <div className="card-body p-4">
                            <div className="text-muted small mb-2">
                                Center Login Accounts
                            </div>
                            <div className="display-6 fw-bold">
                                {loading
                                    ? "—"
                                    : metrics?.center_accounts ?? 0}
                            </div>
                            <small className="text-muted">
                                Accounts assigned to the CENTER role
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h5 className="fw-bold mb-1">
                        Institute Records
                    </h5>
                    <small className="text-muted">
                        Counts from your existing database
                    </small>
                </div>

                <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => navigate("/super-admin-users")}
                >
                    <i className="bi bi-people me-2"></i>
                    Manage Users
                </button>
            </div>

            <div className="row g-3 mb-4">
                {dashboardCards.map((card) => (
                    <div
                        className="col-6 col-md-4 col-xl-3"
                        key={card.key}
                    >
                        <div
                            className="card border-0 shadow-sm h-100"
                            style={{ borderRadius: "14px" }}
                        >
                            <div className="card-body p-3 p-lg-4">
                                <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div className="flex-grow-1">
                                        <small className="text-muted">
                                            {card.label}
                                        </small>

                                        <div className="fs-3 fw-bold mt-2">
                                            {loading
                                                ? "—"
                                                : metrics?.[card.key] ?? 0}
                                        </div>
                                    </div>

                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                        style={{
                                            width: "42px",
                                            height: "42px",
                                            color: card.color,
                                            backgroundColor: card.background,
                                        }}
                                    >
                                        <i
                                            className={`bi ${card.icon} fs-5`}
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div
                className="card border-0 shadow-sm"
                style={{ borderRadius: "16px" }}
            >
                <div className="card-body p-0">
                    <div className="d-flex justify-content-between align-items-center p-4">
                        <div>
                            <h5 className="fw-bold mb-1">
                                Recently Created Accounts
                            </h5>
                            <small className="text-muted">
                                Latest six system accounts
                            </small>
                        </div>

                        <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() => navigate("/super-admin-users")}
                        >
                            View All
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4">Username</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th className="pe-4">Joined</th>
                                </tr>
                            </thead>

                            <tbody>
                                {!loading && recentUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center p-4 text-muted">
                                            No account records available.
                                        </td>
                                    </tr>
                                )}

                                {recentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 fw-semibold">
                                            {user.username}
                                        </td>
                                        <td>
                                            {[user.first_name, user.last_name]
                                                .filter(Boolean)
                                                .join(" ") || "—"}
                                        </td>
                                        <td>
                                            <span className="badge text-bg-light border">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    user.is_active
                                                        ? "text-bg-success"
                                                        : "text-bg-secondary"
                                                }`}
                                            >
                                                {user.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="pe-4">
                                            {formatDate(user.date_joined)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {loading && (
                        <div className="p-4 text-center text-muted">
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Loading live database records...
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center text-muted small py-4">
                © {new Date().getFullYear()} Institute Management System ·
                Super Admin
            </div>
        </SuperAdminLayout>
    );
}