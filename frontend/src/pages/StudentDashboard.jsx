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
    const [courses, setCourses] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [attendancePercentage, setAttendancePercentage] = useState(0);
    const [fees, setFees] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [marksheet, setMarksheet] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [certificate, setCertificate] = useState(null);

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

    async function handleCertificateDownload() {

        try {

            const response = await api.get(
                "/students/certificate/download/",
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(response.data);

            const link = document.createElement("a");
            link.href = url;
            link.download = "certificate.pdf";
            link.click();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.log(error);

        }

    }

    useEffect(() => {

        api.get("/students/profile/")
            .then((response) => {
                console.log("Dashboard Stats:", response.data);   
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
            });

        api.get("/students/courses/")
            .then((response) => {
                setCourses(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

        api.get("/students/attendance/")
            .then((response) => {
                setAttendance(response.data.records);
                setAttendancePercentage(response.data.attendance_percentage);
            })
            .catch((error) => {
                console.log(error);
            });

        api.get("/students/fees/")
            .then((response) => {
                setFees(response.data);
                setPaymentHistory(response.data.history)
            })
            .catch((error) => {
                console.log(error);
            });

        api.get("/students/marksheet/")
            .then((response) => {
                setMarksheet(response.data);
                setSubjects(response.data.subjects);
            })
            .catch((error) => {
                console.log(error);
            });

        api.get("/students/certificate/")
            .then((response) => {
                setCertificate(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

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
                        <button className={`dashboard-link ${activeSection === "marksheet" ? "active-dashboard-link" : ""}`} onClick={() => setActiveSection("marksheet")}><i className="bi bi-file-earmark-text me-2"></i> Marksheet</button>
                        <button className={`dashboard-link ${activeSection === "certificate" ? "active-dashboard-link": ""}`} onClick={() => setActiveSection("certificate")}><i className="bi bi-award me-2"></i> Certificate </button>
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

                            <div className="card border-0 shadow-sm p-4 mt-4 mb-4">

                                <h4 className="text-primary mb-4"> 📚 My Courses </h4>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-primary">

                                            <tr>
                                                <th>#</th>
                                                <th>Course</th>
                                                <th>Duration</th>
                                                <th>Status</th>
                                                <th>Progress</th>
                                            </tr>

                                        </thead>
                                        <tbody>
                                            {
                                                courses.map((course, index) => {
                                                    return (
                                                        <tr key={course.id}>

                                                            <td>{index + 1}</td>
                                                            <td>{course.course_name}</td>
                                                            <td>{course.duration}</td>
                                                            <td><span className={`badge ${course.status === "Active" ? "bg-success": "bg-secondary"}`}>{course.status}</span></td>

                                                            <td>
                                                                <div className="progress" style={{height:"8px"}}>
                                                                    <div className="progress-bar bg-primary" style={{width:`${course.progress}%`}}></div>
                                                                </div>

                                                                <small>{course.progress}%</small>
                                                            </td>

                                                        </tr>
                                                    );
                                                })
                                            }

                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        )}

                        {activeSection === "attendance" && (

                            <div className="card border-0 shadow-sm p-4 mt-4">

                                <h4 className="text-warning mb-3">📅 Attendance</h4>

                                <div className="mb-4">

                                    <div className="d-flex justify-content-between">
                                        <strong>Overall Attendance</strong>
                                        <strong>{attendancePercentage}%</strong>
                                    </div>

                                    <div className="progress mt-2" style={{ height: "10px" }}>

                                        <div className="progress-bar bg-success" style={{ width: `${attendancePercentage}%` }}></div>

                                    </div>

                                </div>

                                <div className="table-responsive">

                                    <table className="table table-hover align-middle">

                                        <thead className="table-warning">

                                            <tr>
                                                <th>Date</th>
                                                <th>Subject</th>
                                                <th>Status</th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {attendance.map((record) => {

                                                return (
                                                    <tr key={record.id}>

                                                        <td>{record.date}</td>
                                                        <td>{record.subject}</td>
                                                        <td><span className={`badge ${record.status === "Present" ? "bg-success": "bg-danger"}`}>{record.status}</span></td>

                                                    </tr>
                                                );

                                            })}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        )}

                        {activeSection === "fees" && (

                            <div className="mt-4">

                                {/* Fee Summary Cards */}

                                <div className="row g-4 mb-4">

                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm p-4 text-center">
                                            <i className="bi bi-wallet2 text-primary fs-1 mb-2"></i>
                                            <h5>Total Fee</h5>
                                            <h3 className="text-primary">
                                                ₹ {fees?.total_fee ?? 0}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm p-4 text-center">
                                            <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
                                            <h5>Paid Amount</h5>
                                            <h3 className="text-success">
                                                ₹ {fees?.paid_amount ?? 0}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm p-4 text-center">
                                            <i className="bi bi-exclamation-circle-fill text-danger fs-1 mb-2"></i>
                                            <h5>Pending Amount</h5>
                                            <h3 className="text-danger">
                                                ₹ {fees?.pending_amount ?? 0}
                                            </h3>
                                        </div>
                                    </div>

                                </div>

                                {/* Payment History */}

                                <div className="card border-0 shadow-sm p-4">

                                    <h4 className="text-primary mb-4">💳 Payment History</h4>

                                    <div className="table-responsive">

                                        <table className="table table-hover align-middle">

                                            <thead className="table-primary">

                                                <tr>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Mode</th>
                                                    <th>Status</th>
                                                    <th>Receipt</th>
                                                </tr>

                                            </thead>

                                            <tbody>

                                                {paymentHistory.map((payment) => {

                                                    return (
                                                        <tr key={payment.id}>

                                                            <td>{payment.date}</td>
                                                            <td className="fw-bold">₹ {payment.amount}</td>
                                                            <td>{payment.mode}</td>
                                                            <td><span className="badge bg-success">{payment.status}</span></td>
                                                            <td><button className="btn btn-sm btn-outline-primary"><i className="bi bi-download me-1"></i>Receipt</button></td>

                                                        </tr>
                                                    );

                                                })}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                            </div>

                        )}

                        {activeSection === "marksheet" && marksheet && (

                            <div className="card border-0 shadow-sm p-4 mt-4">

                                <h4 className="text-primary mb-4">📄 My Marksheet</h4>

                                {/* Summary Cards */}

                                <div className="row g-3 mb-4">

                                    <div className="col-md-3">
                                        <div className="border rounded p-3 text-center">
                                            <small className="text-muted">Exam</small>
                                            <h6>{marksheet.exam_name}</h6>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="border rounded p-3 text-center">
                                            <small className="text-muted">Marks</small>
                                            <h5 className="text-success">{marksheet.obtained_marks}/{marksheet.total_marks}</h5>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="border rounded p-3 text-center">
                                            <small className="text-muted">Percentage</small>
                                            <h5 className="text-primary">{marksheet.percentage}%</h5>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="border rounded p-3 text-center">
                                            <small className="text-muted">Grade</small>
                                            <h5 className="text-warning">{marksheet.grade}</h5>
                                        </div>
                                    </div>

                                </div>

                                {/* Subject Table */}

                                <div className="table-responsive">

                                    <table className="table table-hover">

                                        <thead className="table-primary">
                                            <tr>
                                                <th>#</th>
                                                <th>Subject</th>
                                                <th>Marks</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {subjects.map((subject, index) => (
                                                <tr key={subject.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{subject.subject}</td>
                                                    <td className="fw-bold">{subject.marks}</td>
                                                </tr>
                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                                <div className="text-end">
                                    <button className="btn btn-warning">
                                        <i className="bi bi-download me-2"></i>
                                        Download Marksheet
                                    </button>
                                </div>

                            </div>

                        )}

                        {activeSection === "certificate" && certificate && (

                            <div className="card border-0 shadow-sm p-4 mt-4">

                                <h4 className="text-success mb-4">
                                    🏆 Course Completion Certificate
                                </h4>

                                <div className="border rounded p-4 bg-light text-center">

                                    <h3 className="text-primary fw-bold mb-3">
                                        Institute Management System
                                    </h3>

                                    <p>This Certificate is proudly presented to</p>

                                    <h2 className="text-success fw-bold">
                                        {certificate.student_name}
                                    </h2>

                                    <p>for successfully completing</p>

                                    <h4 className="text-primary">
                                        {certificate.course_name}
                                    </h4>

                                    <hr />

                                    <div className="row text-start">

                                        <div className="col-md-6">
                                            <p><strong>Certificate ID:</strong> {certificate.certificate_id}</p>
                                            <p><strong>Grade:</strong> {certificate.grade}</p>
                                        </div>

                                        <div className="col-md-6">
                                            <p><strong>Status:</strong> {certificate.status}</p>
                                            <p><strong>Completion Date:</strong> {certificate.completion_date}</p>
                                        </div>

                                    </div>

                                </div>

                                <div className="text-end mt-4">

                                    <button className="btn btn-success" onClick={handleCertificateDownload}>
                                        <i className="bi bi-download me-2"></i>
                                        Download Certificate
                                    </button>

                                </div>

                            </div>

                        )}

                        {/* Statistics */}

                        {activeSection === "dashboard" && (
                            <div className="row g-4">
                                {
                                    dashboardStats.map((stat) => {
                                        return (
                                            <StatCard key={stat.id} stat={stat} onClick={setActiveSection} />
                                        );
                                    })
                                }
                            </div>
                        )}
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