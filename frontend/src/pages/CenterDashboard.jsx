
    import { useState } from "react";
    import { useNavigate } from "react-router-dom";

    export default function CenterDashboard() {

        const navigate = useNavigate();

        const [activeSection, setActiveSection] = useState("dashboard");

        function handleLogout() {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            navigate("/center-login", { replace: true });
        }

        const menuItems = [
            {
                id: "dashboard",
                label: "Dashboard",
                icon: "bi-grid"
            },
            {
                id: "students",
                label: "Students",
                icon: "bi-people"
            },
            {
                id: "courses",
                label: "Courses",
                icon: "bi-book"
            },
            {
                id: "batches",
                label: "Batches",
                icon: "bi-collection"
            },
            {
                id: "admissions",
                label: "Admissions",
                icon: "bi-person-plus"
            },
            {
                id: "fees",
                label: "Fees",
                icon: "bi-currency-rupee"
            },
            {
                id: "attendance",
                label: "Attendance",
                icon: "bi-calendar-check"
            },
            {
                id: "exams",
                label: "Exams",
                icon: "bi-pencil-square"
            },
            {
                id: "results",
                label: "Results",
                icon: "bi-bar-chart"
            },
            {
                id: "certificates",
                label: "Certificates",
                icon: "bi-award"
            }
        ];

        const stats = [
            {
                title: "Total Students",
                value: "120",
                icon: "bi-people-fill",
                iconColor: "#2563EB",
                iconBackground: "#DBEAFE",
                description: "Registered students"
            },
            {
                title: "Active Courses",
                value: "8",
                icon: "bi-book-fill",
                iconColor: "#16A34A",
                iconBackground: "#DCFCE7",
                description: "Currently running"
            },
            {
                title: "Active Batches",
                value: "12",
                icon: "bi-collection-fill",
                iconColor: "#9333EA",
                iconBackground: "#F3E8FF",
                description: "Running batches"
            },
            {
                title: "Pending Fees",
                value: "₹45,000",
                icon: "bi-currency-rupee",
                iconColor: "#EA580C",
                iconBackground: "#FFEDD5",
                description: "To be collected"
            }
        ];

        const activities = [
            {
                icon: "bi-person-plus-fill",
                title: "New student registered",
                description: "Rahul Kumar joined Python Full Stack",
                time: "10 minutes ago",
                iconColor: "#2563EB",
                background: "#DBEAFE"
            },
            {
                icon: "bi-cash-stack",
                title: "Fee payment received",
                description: "₹10,000 received from Priya Sharma",
                time: "1 hour ago",
                iconColor: "#16A34A",
                background: "#DCFCE7"
            },
            {
                icon: "bi-collection-fill",
                title: "New batch created",
                description: "Python Full Stack - Batch 12",
                time: "3 hours ago",
                iconColor: "#9333EA",
                background: "#F3E8FF"
            },
            {
                icon: "bi-calendar-check-fill",
                title: "Attendance updated",
                description: "Python Full Stack attendance marked",
                time: "Today",
                iconColor: "#EA580C",
                background: "#FFEDD5"
            }
        ];

        const quickActions = [
            {
                title: "Add Student",
                icon: "bi-person-plus",
                color: "#2563EB",
                background: "#DBEAFE",
                section: "students"
            },
            {
                title: "View Courses",
                icon: "bi-book",
                color: "#16A34A",
                background: "#DCFCE7",
                section: "courses"
            },
            {
                title: "View Batches",
                icon: "bi-collection",
                color: "#9333EA",
                background: "#F3E8FF",
                section: "batches"
            },
            {
                title: "Collect Fee",
                icon: "bi-currency-rupee",
                color: "#EA580C",
                background: "#FFEDD5",
                section: "fees"
            }
        ];

        return (

            <div
                className="min-vh-100"
                style={{
                    backgroundColor: "#F8FAFC"
                }}
            >

                {/* ========================= */}
                {/* DESKTOP SIDEBAR */}
                {/* ========================= */}

                <aside
                    className="d-none d-lg-flex flex-column position-fixed top-0 start-0 h-100"
                    style={{
                        width: "260px",
                        backgroundColor: "#FFFFFF",
                        borderRight: "1px solid #E5E7EB",
                        zIndex: 1000
                    }}
                >

                    {/* Logo */}

                    <div
                        className="px-4 py-4"
                        style={{
                            borderBottom: "1px solid #E5E7EB"
                        }}
                    >

                        <div className="d-flex align-items-center">

                            <div
                                className="d-flex align-items-center justify-content-center rounded-3 me-3"
                                style={{
                                    width: "45px",
                                    height: "45px",
                                    backgroundColor: "#DCFCE7"
                                }}
                            >

                                <i
                                    className="bi bi-building fs-4"
                                    style={{
                                        color: "#16A34A"
                                    }}
                                ></i>

                            </div>

                            <div>

                                <h5
                                    className="fw-bold mb-0"
                                    style={{
                                        color: "#1F2937"
                                    }}
                                >
                                    IMS
                                </h5>

                                <small className="text-muted">
                                    Center Portal
                                </small>

                            </div>

                        </div>

                    </div>


                    {/* Navigation */}

                    <div className="p-3 flex-grow-1">

                        <small
                            className="text-uppercase fw-semibold px-3"
                            style={{
                                color: "#9CA3AF",
                                fontSize: "11px"
                            }}
                        >
                            Main Menu
                        </small>


                        <div className="mt-2">

                            {menuItems.map((item) => (

                                <button
                                    key={item.id}
                                    type="button"

                                    onClick={() => {
                                        if (item.id === "dashboard") {
                                            setActiveSection("dashboard");
                                        } else if (item.id === "students") {
                                            navigate("/center-students");
                                        } else if (item.id === "courses") {
                                            navigate("/center-courses");
                                        } else if (item.id === "batches") {
                                            navigate("/center-batches");
                                        } else if (item.id === "admissions") {
                                            navigate("/center-admissions");
                                        } else if (item.id === "fees") {
                                            navigate("/center-fees");
                                        } else if (item.id === "attendance") {
                                            navigate("/center-attendance");
                                        } else if (item.id === "exams") {
                                            navigate("/center-exams");
                                        } else if (item.id === "results") {
                                            navigate("/center-results");
                                        } else if (item.id === "certificates") {
                                            navigate("/center-certificates");
                                        }
                                    }}

                                    className="btn w-100 text-start mb-1"
                                    style={{
                                        backgroundColor:
                                            activeSection === item.id
                                                ? "#F0FDF4"
                                                : "transparent",

                                        color:
                                            activeSection === item.id
                                                ? "#16A34A"
                                                : "#4B5563",

                                        border:
                                            activeSection === item.id
                                                ? "1px solid #DCFCE7"
                                                : "1px solid transparent",

                                        borderRadius: "10px",
                                        padding: "10px 14px"
                                    }}
                                >

                                    <i
                                        className={`bi ${item.icon} me-3`}
                                    ></i>

                                    <span className="fw-medium">
                                        {item.label}
                                    </span>

                                </button>

                            ))}

                        </div>

                    </div>


                    {/* Logout */}

                    <div
                        className="p-3"
                        style={{
                            borderTop: "1px solid #E5E7EB"
                        }}
                    >

                        <button
                            type="button"
                            className="btn btn-light w-100 text-start text-danger"
                            onClick={handleLogout}
                        >

                            <i className="bi bi-box-arrow-right me-3"></i>

                            Logout

                        </button>

                    </div>

                </aside>


                {/* ========================= */}
                {/* MAIN CONTENT */}
                {/* ========================= */}

                <main
                    className="p-3 p-lg-4"
                    style={{
                        marginLeft: "260px"
                    }}
                >

                    {/* Header */}

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>

                            <h3
                                className="fw-bold mb-1"
                                style={{
                                    color: "#1F2937"
                                }}
                            >
                                Center Dashboard
                            </h3>

                            <p className="text-muted mb-0">
                                Welcome back! Here's what's happening at your center.
                            </p>

                        </div>


                        <div className="d-flex align-items-center">

                            <button
                                type="button"
                                className="btn btn-light me-2"
                                title="Notifications"
                            >
                                <i className="bi bi-bell"></i>
                            </button>


                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle"
                                style={{
                                    width: "42px",
                                    height: "42px",
                                    backgroundColor: "#DCFCE7",
                                    color: "#16A34A"
                                }}
                            >

                                <i className="bi bi-person-fill"></i>

                            </div>

                        </div>

                    </div>


                    {/* ========================= */}
                    {/* INNER DASHBOARD SECTION BACK BUTTON */}
                    {/* ========================= */}

                    {activeSection !== "dashboard" && (

                        <div className="mb-4">

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setActiveSection("dashboard")}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Dashboard
                            </button>

                        </div>
                    )}


                    {/* ========================= */}
                    {/* WELCOME BANNER */}
                    {/* ========================= */}

                    <div
                        className="rounded-4 p-4 p-md-5 mb-4"
                        style={{
                            backgroundColor: "#F0FDF4",
                            border: "1px solid #DCFCE7"
                        }}
                    >

                        <div className="row align-items-center">

                            <div className="col-md-8">

                                <span
                                    className="badge rounded-pill mb-3"
                                    style={{
                                        backgroundColor: "#DCFCE7",
                                        color: "#15803D"
                                    }}
                                >
                                    Center Portal
                                </span>

                                <h2
                                    className="fw-bold mb-2"
                                    style={{
                                        color: "#1F2937"
                                    }}
                                >
                                    Welcome to your Center Dashboard 👋
                                </h2>

                                <p
                                    className="mb-0"
                                    style={{
                                        color: "#4B5563"
                                    }}
                                >
                                    Manage students, courses, batches, admissions,
                                    fees and academic activities from one place.
                                </p>

                            </div>


                            <div className="col-md-4 text-md-end mt-4 mt-md-0">

                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: "110px",
                                        height: "110px",
                                        backgroundColor: "#DCFCE7"
                                    }}
                                >

                                    <i
                                        className="bi bi-building"
                                        style={{
                                            fontSize: "50px",
                                            color: "#16A34A"
                                        }}
                                    ></i>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ========================= */}
                    {/* STAT CARDS */}
                    {/* ========================= */}

                    <div className="row g-4 mb-4">

                        {stats.map((stat) => (

                            <div
                                className="col-sm-6 col-xl-3"
                                key={stat.title}
                            >

                                <div
                                    className="card border-0 shadow-sm h-100 rounded-4"
                                >

                                    <div className="card-body p-4">

                                        <div className="d-flex justify-content-between align-items-start">

                                            <div>

                                                <p
                                                    className="text-muted mb-2"
                                                    style={{
                                                        fontSize: "14px"
                                                    }}
                                                >
                                                    {stat.title}
                                                </p>

                                                <h3
                                                    className="fw-bold mb-1"
                                                    style={{
                                                        color: "#1F2937"
                                                    }}
                                                >
                                                    {stat.value}
                                                </h3>

                                                <small className="text-muted">
                                                    {stat.description}
                                                </small>

                                            </div>


                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-3"
                                                style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    backgroundColor: stat.iconBackground,
                                                    color: stat.iconColor
                                                }}
                                            >

                                                <i
                                                    className={`bi ${stat.icon} fs-5`}
                                                ></i>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>


                    {/* ========================= */}
                    {/* LOWER SECTION */}
                    {/* ========================= */}

                    <div className="row g-4">

                        {/* Recent Activities */}

                        <div className="col-lg-7">

                            <div
                                className="card border-0 shadow-sm rounded-4 h-100"
                            >

                                <div className="card-body p-4">

                                    <div className="d-flex justify-content-between align-items-center mb-4">

                                        <div>

                                            <h5
                                                className="fw-bold mb-1"
                                                style={{
                                                    color: "#1F2937"
                                                }}
                                            >
                                                Recent Activities
                                            </h5>

                                            <small className="text-muted">
                                                Latest activities from your center
                                            </small>

                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-light"
                                        >
                                            View All
                                        </button>

                                    </div>


                                    {activities.map((activity, index) => (

                                        <div
                                            key={index}
                                            className="d-flex align-items-center mb-4"
                                        >

                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0"
                                                style={{
                                                    width: "44px",
                                                    height: "44px",
                                                    backgroundColor: activity.background,
                                                    color: activity.iconColor
                                                }}
                                            >

                                                <i
                                                    className={`bi ${activity.icon}`}
                                                ></i>

                                            </div>


                                            <div className="flex-grow-1">

                                                <h6
                                                    className="fw-semibold mb-1"
                                                    style={{
                                                        color: "#1F2937"
                                                    }}
                                                >
                                                    {activity.title}
                                                </h6>

                                                <p
                                                    className="text-muted mb-0"
                                                    style={{
                                                        fontSize: "13px"
                                                    }}
                                                >
                                                    {activity.description}
                                                </p>

                                            </div>


                                            <small
                                                className="text-muted ms-2"
                                                style={{
                                                    whiteSpace: "nowrap"
                                                }}
                                            >
                                                {activity.time}
                                            </small>

                                        </div>

                                    ))}

                                </div>

                            </div>

                        </div>


                        {/* Quick Actions */}

                        <div className="col-lg-5">

                            <div
                                className="card border-0 shadow-sm rounded-4 h-100"
                            >

                                <div className="card-body p-4">

                                    <div className="mb-4">

                                        <h5
                                            className="fw-bold mb-1"
                                            style={{
                                                color: "#1F2937"
                                            }}
                                        >
                                            Quick Actions
                                        </h5>

                                        <small className="text-muted">
                                            Frequently used actions
                                        </small>

                                    </div>


                                    <div className="row g-3">

                                        {quickActions.map((action) => (

                                            <div
                                                className="col-6"
                                                key={action.title}
                                            >

                                                <button
                                                    type="button"

                                                    onClick={() => {
                                                        if (action.section === "students") {
                                                            navigate("/center-students");
                                                        } else if (action.section === "courses") {
                                                            navigate("/center-courses");
                                                        } else if (action.section === "batches") {
                                                            navigate("/center-batches");
                                                        } else if (action.section === "fees") {
                                                            navigate("/center-fees");
                                                        } else if (action.section === "attendance") {
                                                            navigate("/center-attendance");
                                                        } else if (action.section === "exams") {
                                                            navigate("/center-exams");
                                                        } else if (action.section === "results") {
                                                            navigate("/center-results");
                                                        }
                                                    }}

                                                    className="btn w-100 text-start p-3"
                                                    style={{
                                                        backgroundColor: "#FFFFFF",
                                                        border: "1px solid #E5E7EB",
                                                        borderRadius: "12px"
                                                    }}
                                                >

                                                    <div
                                                        className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                                                        style={{
                                                            width: "42px",
                                                            height: "42px",
                                                            backgroundColor: action.background,
                                                            color: action.color
                                                        }}
                                                    >

                                                        <i
                                                            className={`bi ${action.icon}`}
                                                        ></i>

                                                    </div>


                                                    <span
                                                        className="fw-semibold"
                                                        style={{
                                                            color: "#374151",
                                                            fontSize: "14px"
                                                        }}
                                                    >
                                                        {action.title}
                                                    </span>

                                                </button>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ========================= */}
                    {/* FOOTER */}
                    {/* ========================= */}

                    <div
                        className="text-center py-4 mt-4"
                    >

                        <small className="text-muted">
                            © 2026 Institute Management System · Center Portal
                        </small>

                    </div>

                </main>


                {/* ========================= */}
                {/* MOBILE BOTTOM NAVIGATION */}
                {/* ========================= */}

                <div
                    className="d-lg-none fixed-bottom bg-white border-top shadow-sm"
                    style={{
                        zIndex: 1000
                    }}
                >

                    <div className="d-flex justify-content-around py-2">

                        {menuItems.slice(0, 5).map((item) => (

                            <button
                                key={item.id}
                                type="button"
                                className="btn border-0 d-flex flex-column align-items-center"

                                onClick={() => {
                                    if (item.id === "dashboard") {
                                        navigate("/center-dashboard");
                                    } else if (item.id === "students") {
                                        navigate("/center-students");
                                    } else if (item.id === "courses") {
                                        navigate("/center-courses");
                                    } else if (item.id === "batches") {
                                        navigate("/center-batches");
                                    } else if (item.id === "admissions") {
                                        navigate("/center-admissions");
                                    }
                                }}
                                style={{
                                    color:
                                        activeSection === item.id
                                            ? "#16A34A"
                                            : "#6B7280"
                                }}
                            >

                                <i
                                    className={`bi ${item.icon}`}
                                    style={{
                                        fontSize: "18px"
                                    }}
                                ></i>

                                <small
                                    style={{
                                        fontSize: "10px"
                                    }}
                                >
                                    {item.label}
                                </small>

                            </button>

                        ))}

                    </div>

                </div>

            </div>
        );
    }
