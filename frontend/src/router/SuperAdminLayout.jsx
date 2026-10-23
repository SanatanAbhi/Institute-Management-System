import { useNavigate } from "react-router-dom";

export default function SuperAdminLayout({ active, children }) {
    const navigate = useNavigate();

    const menuItems = [
        {
            id: "dashboard",
            label: "Overview",
            icon: "bi-grid-1x2",
            path: "/super-admin-dashboard",
        },
        {
            id: "users",
            label: "User Management",
            icon: "bi-people",
            path: "/super-admin-users",
        },
        {
            id: "centers",
            label: "Training Centers",
            icon: "bi-building",
            path: "/centers",
        },
        {
            id: "students",
            label: "Students",
            icon: "bi-mortarboard",
            path: "/center-students",
        },
        {
            id: "courses",
            label: "Courses",
            icon: "bi-book",
            path: "/super-admin-courses",
        },
        {
            id: "batches",
            label: "Batches",
            icon: "bi-collection",
            path: "/super-admin-batches",
        },
        {
            id: "admissions",
            label: "Admissions",
            icon: "bi-person-plus",
            path: "/center-admissions",
        },
        {
            id: "fees",
            label: "Fees",
            icon: "bi-currency-rupee",
            path: "/center-fees",
        },
        {
            id: "attendance",
            label: "Attendance",
            icon: "bi-calendar-check",
            path: "/center-attendance",
        },
        {
            id: "exams",
            label: "Exams",
            icon: "bi-pencil-square",
            path: "/center-exams",
        },
        {
            id: "results",
            label: "Results",
            icon: "bi-bar-chart",
            path: "/center-results",
        },
        {
            id: "certificates",
            label: "Certificates",
            icon: "bi-award",
            path: "/center-certificates",
        },
    ];

    function handleLogout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        navigate("/super-admin-login", { replace: true });
    }

    return (
        <div
            className="min-vh-100"
            style={{ backgroundColor: "#F5F7FB" }}
        >
            {/* Desktop sidebar */}
            <aside
                className="d-none d-lg-flex flex-column position-fixed top-0 start-0 h-100"
                style={{
                    width: "260px",
                    backgroundColor: "#111827",
                    color: "#FFFFFF",
                    zIndex: 1000,
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                <div
                    className="px-4 py-4"
                    style={{ borderBottom: "1px solid #374151" }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="d-flex align-items-center justify-content-center rounded-3"
                            style={{
                                width: "46px",
                                height: "46px",
                                backgroundColor: "#16A34A",
                            }}
                        >
                            <i className="bi bi-building fs-4"></i>
                        </div>

                        <div>
                            <h5 className="fw-bold mb-0">IMS</h5>
                            <small style={{ color: "#9CA3AF" }}>
                                Administration
                            </small>
                        </div>
                    </div>
                </div>

                <div className="px-3 pt-4">
                    <small
                        className="px-3 text-uppercase fw-semibold"
                        style={{
                            color: "#9CA3AF",
                            letterSpacing: "1px",
                        }}
                    >
                        Main Menu
                    </small>

                    <div className="mt-3">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => navigate(item.path)}
                                className="btn w-100 text-start d-flex align-items-center mb-2"
                                style={{
                                    backgroundColor:
                                        active === item.id
                                            ? "#166534"
                                            : "transparent",
                                    color: "#FFFFFF",
                                    border: "1px solid transparent",
                                    borderRadius: "10px",
                                    padding: "12px 14px",
                                }}
                            >
                                <i
                                    className={`bi ${item.icon} me-3`}
                                ></i>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-3">
                    <div
                        className="p-3 mb-3 rounded-3"
                        style={{ backgroundColor: "#1F2937" }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-shield-lock fs-4 text-success"></i>
                            <div>
                                <div className="fw-semibold">
                                    Super Admin
                                </div>
                                <small style={{ color: "#9CA3AF" }}>
                                    System administrator
                                </small>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn w-100 text-start text-white"
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right me-3"></i>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <main
                style={{
                    marginLeft: "0",
                    minHeight: "100vh",
                }}
                className="p-3 p-lg-4"
            >
                <div
                    style={{ marginLeft: "0" }}
                    className="d-lg-none mb-3 d-flex align-items-center justify-content-between bg-white p-3 rounded-3 shadow-sm"
                >
                    <div>
                        <div className="fw-bold">IMS Admin</div>
                        <small className="text-muted">
                            Super Admin Portal
                        </small>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

                <div
                    className="d-none d-lg-block"
                    style={{ marginLeft: "260px" }}
                >
                    <div
                        className="d-flex align-items-center justify-content-between mb-4"
                    >
                        <div>
                            <div
                                className="text-muted"
                                style={{ fontSize: "13px" }}
                            >
                                Institute Management System
                            </div>
                            <div className="fw-bold fs-4">
                                Super Admin Portal
                            </div>
                        </div>

                        <div
                            className="d-flex align-items-center gap-2 bg-white rounded-pill px-3 py-2 shadow-sm"
                        >
                            <i className="bi bi-shield-check text-success"></i>
                            <span className="small fw-semibold">
                                Secure Administration
                            </span>
                        </div>
                    </div>

                    {children}
                </div>

                <div className="d-lg-none">{children}</div>

                {/* Mobile navigation */}
                <div
                    className="d-lg-none position-fixed bottom-0 start-0 end-0 bg-white border-top"
                    style={{ zIndex: 1000 }}
                >
                    <div
                    className="d-flex py-2"
                    style={{
                        overflowX: "auto",
                        overflowY: "hidden",
                        whiteSpace: "nowrap",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className="btn border-0 d-flex flex-column align-items-center flex-shrink-0"
                                style={{
                                    color:
                                        active === item.id
                                            ? "#16A34A"
                                            : "#6B7280",
                                }}
                                onClick={() => navigate(item.path)}
                            >
                                <i className={`bi ${item.icon} fs-5`}></i>
                                <small
                                    style={{
                                        fontSize: "11px",
                                        maxWidth: "65px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {item.label === "Overview" ? "Home" : item.label}
                                </small>
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    className="d-lg-none"
                    style={{ height: "60px" }}
                ></div>
            </main>
        </div>
    );
}