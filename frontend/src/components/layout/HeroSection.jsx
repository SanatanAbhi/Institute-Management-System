import heroStudents from "../../assets/images/hero-students.png";

export default function HeroSection() {
    return (
        <section className="hero-section py-5" id="home">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-6">
                        <h1 className="fw-bold text-primary">EMPOWERING SKILLS</h1>
                        <h2 className="fw-bold hero-orange">ENRICHING LIVES</h2>
                        <h2 className="fw-bold hero-green">BUILDING GLOBAL FUTURE</h2>
                        <p className="text-white mt-3">Join Acharya Skill Mission and unlock your potential with world-class skill development programs.</p>
                        <button className="btn btn-light me-3">Explore Courses</button>
                        <button className="btn btn-warning">Apply Now</button>
                    </div>
                    <div className="col-6 text-center">
                        <img className="img-fluid rounded-4 shadow" src={heroStudents} alt="Students" />
                    </div>
                </div>
            </div>
        </section>
    )
}