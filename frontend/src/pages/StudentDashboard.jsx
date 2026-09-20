import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import StatCard from "../components/dashboard/StatCard";

export default function StudentDashboard() {

    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState("dashboard");
    
    const [student, setStudent] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const dashboardStats = [
        {
            id: 1,
            title: "My Courses",
            value: stats?.total_courses ?? 0,
            icon: "bi-book-fill",
            color: "primary",
            section: "courses"
        },
        {
            id: 2,
            title: "My Batches",
            value: stats?.total_batches ?? 0,
            icon: "bi-people-fill",
            color: "success",
            section: "batches"
        },
        {
            id: 3,
            title: "Attendance",
            value: `${stats?.attendance_percentage ?? 0}%`,
            icon: "bi-calendar-check-fill",
            color: "warning",
            section: "attendance"
        },
        {
            id: 4,
            title: "Certificates",
            value: stats?.total_certificates ?? 0,
            icon: "bi-award-fill",
            color: "danger",
            section: "certificates"
        }
    ];

    function handleLogout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/student-login");
    }

    useEffect(() => {

        api.get("/students/profile/")
            .then((response) => {
                setStudent(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });

        api.get("/students/dashboard/")
            .then((response) => {
                setStats(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            })

    }, []);

    return (
        <section className="dashboard-page">
            <div className="container-fluid">
                <div className="row">

                    {/* Desktop Sidebar */}

                    <div className="col-lg-3 col-md-4 dashboard-sidebar d-none d-md-block">
                        <h4 className="text-white fw-bold mb-4">Student Panel</h4>

                        <NavLink to="/student-dashboard" className="dashboard-link"><button className={`dashboard-link ${activeSection === "dashboard" ? "active-dashboard-link" : ""}`} onClick={() => setActiveSection("dashboard")}><i className="bi bi-speedometer me-2"></i> Dashboard </button></NavLink>
                        
                        <button className={`dashboard-link ${activeSection === "courses" ? "active-dashboard-link": ""}`}  onClick={() => setActiveSection("courses")}><i className="bi bi-book me-2"></i> My Courses </button>
                        <button className={`dashboard-link ${activeSection === "attendance" ? "active-dashboard-link": ""}`} onClick={() => setActiveSection("attendance")}><i className="bi bi-calendar-check me-2"></i> Attendance </button>
                        <button className={`dashboard-link ${activeSection === "fees" ? "active-dashboard-link": ""}`} onClick={() => setActiveSection("fees")}><i className="bi bi-cash-stack me-2"></i> Fees </button>
                        <button className={`dashboard-link ${activeSection === "certificates" ? "active-dashboard-link": ""}`} onClick={() => setActiveSection("certificates")}><i className="bi bi-award me-2"></i> Certificates </button>
                        <button className="dashboard-link logout-btn mt-4" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Logout </button>
                    </div>

                    {/* Main Content */}

                    <div className="col-lg-9 col-md-8 dashboard-content">

                        {/* Mobile Menu Button */}

                        <button className="btn btn-primary d-md-none mb-3" data-bs-toggle="offcanvas" data-bs-target="#studentSidebar"><i className="bi bi-list me-2"></i> Menu </button>

                        {/* Welcome Card */}

                        {
                            loading ? (

                                <div className="card border-0 shadow-sm p-5 mb-4 text-center d-flex align-items-center justify-content-center">
                                    <div className="spinner-border text-primary"></div>
                                    <p className="mt-3">Loading Student Profile...</p>
                                </div>

                            ) : student ? (

                                <div className="card border-0 shadow-sm p-4 mb-4">

                                    <h2 className="text-primary fw-bold">
                                        Welcome, {student.name} 👋
                                    </h2>

                                    <p><strong>Username:</strong> {student.username}</p>

                                    <p><strong>Role:</strong> {student.role}</p>

                                </div>

                            ) : (
                                <div className="card border-0 shadow-sm p-4 mb-4">
                                    <p className="text-danger">Failed to load student profile.</p>
                                </div>
                            )
                        }

                        {activeSection === "courses" && (
                            <div className="card border-0 shadow-sm p-4 mt-4">
                                <h4 className="text-primary">📚 My Courses</h4>
                                <p>Python Programming</p>
                                <p>Django</p>
                                <p>React.js</p>
                            </div>
                        )}

                        {activeSection === "attendance" && (
                            <div className="card border-0 shadow-sm p-4 mt-4">
                                <h4 className="text-warning">📅 Attendance</h4>
                                <p>Overall Attendance: 92%</p>
                            </div>
                        )}

                        {activeSection === "certificates" && (
                            <div className="card border-0 shadow-sm p-4 mt-4">
                                <h4 className="text-danger">🏆 Certificates</h4>
                                <p>Python Certificate - Completed</p>
                            </div>
                        )}

                        {/* Statistics */}

                        <div className="row g-4">
                            {
                                dashboardStats.map((stat) => {
                                    return (
                                        <StatCard key={stat.id} stat={stat} onClick={setActiveSection} />
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
                
                {/* Mobile Offcanvas */}

                <div className="offcanvas offcanvas-start dashboard-sidebar d-md-none" id="studentSidebar" tabIndex="-1">

                    <div className="offcanvas-header border-bottom">

                        <h5 className="text-white fw-bold mb-0"> Student Panel </h5>

                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>

                    </div>

                    <div className="offcanvas-body">

                        <NavLink to="/student-dashboard" className="dashboard-link">
                            <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </NavLink>

                        <button className="dashboard-link">
                            <i className="bi bi-book me-2"></i> My Courses
                        </button>

                        <button className="dashboard-link">
                            <i className="bi bi-calendar-check me-2"></i> Attendance
                        </button>

                        <button className="dashboard-link">
                            <i className="bi bi-cash-stack me-2"></i> Fees
                        </button>

                        <button className="dashboard-link">
                            <i className="bi bi-award me-2"></i> Certificates
                        </button>

                        <button
                            className="dashboard-link logout-btn mt-3"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </button>

                    </div>

                </div>
            </div>
        </section>
    );
}