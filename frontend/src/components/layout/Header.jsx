import { Link } from "react-router-dom";
import logo from "../../assets/logo/ACHARYA_SKILLS_MISISON_LOGO.png";

export default function Header() {
    return (
        <header className="bg-white py-3 border-bottom">
            <div className="container">
                <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-7 d-flex align-items-center">
                        <Link to="/" aria-label="Go to Home">
                            <img
                                src={logo}
                                alt="Acharya Skill Mission Logo"
                                width="110"
                                height="95"
                                style={{ objectFit: "contain" }}
                            />
                        </Link>

                        <div className="ms-3">
                            <h1 className="fw-bold mb-0 text-primary">
                                ACHARYA
                            </h1>

                            <h2
                                className="fw-bold mb-1"
                                style={{ color: "#F97316" }}
                            >
                                SKILL MISSION
                            </h2>

                            <p className="small text-muted mb-0">
                                Learn Skills • Build Careers • Create Entrepreneurs
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-lg-5">
                        <div className="d-flex flex-wrap justify-content-lg-end justify-content-center gap-2">
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