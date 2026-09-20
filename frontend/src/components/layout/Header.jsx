import logo from "../../assets/logo/ACHARYA_SKILLS_MISISON_LOGO.png";

export default function Header() {
    return (
        <header className="bg-white py-3 border-bottom">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-7 d-flex align-items-center">

                        <img src={logo} alt="ASM LOGO" width="110" height="95" />

                        <div className="ms-3">
                            <h1 className="fw-bold mb-0 text-primary">ACHARYA</h1>
                            <h2 className="fw-bold mb-1" style={{ color: "#F97316" }}>SKILL MISSION</h2>
                            <p className="small text-muted mb-0">Learn Skills • Build Careers • Create Entrepreneurs</p>
                        </div>

                    </div>

                    <div className="col-5 text-end">

                        <button className="btn btn-outline-primary me-2">Student Login</button>
                        <button className="btn btn-outline-success me-2">Center Login</button>
                        <button className="btn btn-warning">Apply Now</button>

                    </div>
                </div>
            </div>
        </header>
    );
}