
import { Link } from "react-router-dom";
import heroStudents from "../../assets/images/hero-students.png";

export default function HeroSection() {
    return (
        <section className="hero-section py-4 py-md-5" id="home">
            <div className="container">
                <div className="row align-items-center g-4 g-lg-5">
                    {/* Hero content */}
                    <div className="col-12 col-md-6 text-center text-md-start">
                        <h1 className="fw-bold text-primary hero-title">
                            EMPOWERING SKILLS
                        </h1>

                        <h2 className="fw-bold hero-orange hero-subtitle">
                            ENRICHING LIVES
                        </h2>

                        <h2 className="fw-bold hero-green hero-subtitle">
                            BUILDING GLOBAL FUTURE
                        </h2>

                        <p className="text-white mt-3 hero-description">
                            Join Acharya Skill Mission and unlock your potential
                            with world-class skill development programs.
                        </p>

                        <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-md-start align-items-stretch align-items-sm-center gap-2 mt-4">
                            <Link
                                to="/courses"
                                className="btn btn-light"
                            >
                                Explore Courses
                            </Link>

                            <Link
                                to="/apply-now"
                                className="btn btn-warning"
                            >
                                Apply Now
                            </Link>
                        </div>
                    </div>

                    {/* Hero image */}
                    <div className="col-12 col-md-6 text-center">
                        <img
                            className="img-fluid rounded-4 shadow hero-image"
                            src={heroStudents}
                            alt="Students learning new skills"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
