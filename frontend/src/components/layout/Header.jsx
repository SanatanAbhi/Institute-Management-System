
import { Link } from "react-router-dom";
import logo from "../../assets/logo/ACHARYA_SKILLS_MISISON_LOGO.png";

export default function Header() {
    return (
        <header className="bg-white py-3 border-bottom">
            <div className="container">
                <div className="row align-items-center g-3">
                    {/* Logo and institute name */}
                    <div className="col-12 col-lg-7">
                        <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 gap-sm-3">
                            <Link
                                to="/"
                                aria-label="Go to Home"
                                className="flex-shrink-0"
                            >
                                <img
                                    src={logo}
                                    alt="Acharya Skill Mission Logo"
                                    className="img-fluid"
                                    style={{
                                        width: "clamp(65px, 13vw, 110px)",
                                        height: "auto",
                                        maxHeight: "95px",
                                        objectFit: "contain",
                                    }}
                                />
                            </Link>

                            <div className="min-w-0">
                                <h1
                                    className="fw-bold mb-0 text-primary"
                                    style={{
                                        fontSize: "clamp(1.25rem, 4vw, 2.5rem)",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    ACHARYA
                                </h1>

                                <h2
                                    className="fw-bold mb-1"
                                    style={{
                                        color: "#F97316",
                                        fontSize: "clamp(1rem, 3.2vw, 2rem)",
                                        lineHeight: 1.15,
                                    }}
                                >
                                    SKILL MISSION
                                </h2>

                                <p
                                    className="small text-muted mb-0"
                                    style={{
                                        fontSize: "clamp(0.65rem, 1.8vw, 0.875rem)",
                                    }}
                                >
                                    Learn Skills • Build Careers • Create Entrepreneurs
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Login and application buttons */}
                    <div className="col-12 col-lg-5">
                        <div className="d-flex flex-wrap justify-content-center justify-content-lg-end gap-2">
                            <Link
                                to="/student-login"
                                className="btn btn-outline-primary"
                            >
                                Student Login
                            </Link>

                            <Link
                                to="/center-login"
                                className="btn btn-outline-success"
                            >
                                Center Login
                            </Link>

                            <Link
                                to="/apply-now"
                                className="btn btn-warning"
                            >
                                Apply Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
