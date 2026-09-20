import Header from "../components/layout/Header";
import NavbarMenu from "../components/layout/NavbarMenu";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function StudentLogin() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function handleLogin() {

        setError("");

        if(username.trim() === "" || password.trim() === "") {
            setError("Please enter username and password");
            return;
        }

        api.post("/token/", {
            username: username,
            password: password,
        })
        .then((response) => {
            const accessToken = response.data.access;
            const refreshToken = response.data.refresh;

            localStorage.setItem("accessToken", accessToken);
            localStorage.getItem("refreshToken", refreshToken);

            navigate("/student-dashboard");
        })
        .catch((error) => {
            console.log(error);
            setError("Invalid Username and Password.");
        });
    }

    return (
        <>
            <Header />
            <NavbarMenu />

            <section className="login-section py-5">
                <div className="container">

                    <div className="row align-items-center shadow-lg rounded-4 overflow-hidden">

                        {/* Left Side */}

                        <div className="col-md-5 bg-primary text-white p-5 m-5 rounded">

                            <h1 className="fw-bold mb-3">Welcome Student 👋</h1>
                            <p className="fs-5">Login to access your dashboard, courses, attendance, fees, certificates and results.</p>

                            <hr className="border-light my-4" />

                            <h5 className="text-warning fw-bold">Acharya Skill Mission</h5>
                            <p className="mb-0">Learn Skills. Build Career. Grow Together.</p>

                        </div>

                        {/* Right Side */}

                        <div className="col-md-6 bg-white p-5">

                            <h2 className="fw-bold text-primary mb-4 text-center">Student Login</h2>

                            {
                                error && ( <div className="alert alert-danger">{error}</div> )
                            }

                            <form>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Username</label>
                                    <input type="text" className="form-control" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Password</label>
                                    <div className="input-group">
                                        <input type={showPassword ? "text": "password"} className="form-control" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}><i className={showPassword ? "bi bi-eye-slash-fill": "bi bi-eye-fill"}></i></button>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                        <label className="form-check-label" htmlFor="rememberMe" > Remember Me </label>
                                    </div>

                                    <a href="#" className="text-decoration-none"> Forgot Password? </a>

                                </div>

                                <button type="button" className="btn btn-warning w-100 fw-bold py-2" onClick={handleLogin} > Login </button>
                            </form>

                            <hr className="my-4" />

                            <p className="text-center mb-0"> <Link to="/" className="text-decoration-none fw-semibold text-primary" > ← Back to Home </Link> </p>

                        </div>

                    </div>

                </div>
            </section>
        </>
    );
}