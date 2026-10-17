import Header from "../components/layout/Header";
import NavbarMenu from "../components/layout/NavbarMenu";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CenterLogin() {

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
const [error, setError] = useState("");

const navigate = useNavigate();

function handleLogin() {

    setError("");

    if (username.trim() === "" || password.trim() === "") {
        setError("Please enter username and password");
        return;
    }

    // Remove old login tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Login
    api.post("/token/", {
        username: username,
        password: password,
    })
    .then((response) => {

        console.log("CENTER LOGIN RESPONSE:", response.data);

        const accessToken = response.data.access;
        const refreshToken = response.data.refresh;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Get logged-in user's profile and role
        return api.get("/students/profile/");
    })
    .then((response) => {

        console.log("CENTER PROFILE RESPONSE:", response.data);
        console.log("CENTER PROFILE ROLE:", response.data.role);

        const role = response.data.role;

        if (role === "CENTER") {

            navigate("/center-dashboard");

        } else {

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            setError("This account is not a Center account.");
        }
    })
    .catch((error) => {

        console.log("CENTER LOGIN ERROR:", error);
        console.log("ERROR RESPONSE:", error.response?.data);
        console.log("STATUS:", error.response?.status);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        if (error.response?.status === 401) {

            setError("Invalid username or password.");

        } else {

            setError(
                "Login succeeded, but we could not load your profile. Check the browser console."
            );
        }
    });
}

return (
    <>
        <Header />
        <NavbarMenu />

        <section
            className="py-5"
            style={{ backgroundColor: "#F8FAFC" }}
        >

            <div className="container">

                <div
                    className="row shadow-sm rounded-4 overflow-hidden"
                    style={{
                        minHeight: "520px",
                        backgroundColor: "#FFFFFF"
                    }}
                >

                    {/* ============================= */}
                    {/* Left Side */}
                    {/* ============================= */}

                    <div
                        className="col-md-5 p-5 d-flex flex-column justify-content-center"
                        style={{
                            backgroundColor: "#F0FDF4"
                        }}
                    >

                        <div>

                            {/* Icon */}

                            <div
                                className="mb-4 d-flex align-items-center justify-content-center rounded-3"
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    backgroundColor: "#DCFCE7"
                                }}
                            >
                                <i
                                    className="bi bi-building fs-2"
                                    style={{
                                        color: "#16A34A"
                                    }}
                                ></i>
                            </div>

                            <h1
                                className="fw-bold mb-3"
                                style={{
                                    color: "#1F2937"
                                }}
                            >
                                Center Portal
                            </h1>

                            <p
                                className="fs-5 mb-4"
                                style={{
                                    color: "#4B5563"
                                }}
                            >
                                Manage your center and keep your
                                institute activities organized in
                                one place.
                            </p>

                            {/* Features */}

                            <div className="mb-3">

                                <div className="d-flex align-items-center mb-3">

                                    <i
                                        className="bi bi-check-circle-fill me-3"
                                        style={{
                                            color: "#16A34A"
                                        }}
                                    ></i>

                                    <span className="text-secondary">
                                        Manage Students
                                    </span>

                                </div>

                                <div className="d-flex align-items-center mb-3">

                                    <i
                                        className="bi bi-check-circle-fill me-3"
                                        style={{
                                            color: "#16A34A"
                                        }}
                                    ></i>

                                    <span className="text-secondary">
                                        Manage Courses & Batches
                                    </span>

                                </div>

                                <div className="d-flex align-items-center mb-3">

                                    <i
                                        className="bi bi-check-circle-fill me-3"
                                        style={{
                                            color: "#16A34A"
                                        }}
                                    ></i>

                                    <span className="text-secondary">
                                        Manage Admissions
                                    </span>

                                </div>

                                <div className="d-flex align-items-center">

                                    <i
                                        className="bi bi-check-circle-fill me-3"
                                        style={{
                                            color: "#16A34A"
                                        }}
                                    ></i>

                                    <span className="text-secondary">
                                        Manage Fees & Attendance
                                    </span>

                                </div>

                            </div>

                            <hr className="my-4" />

                            <h6
                                className="fw-bold mb-1"
                                style={{
                                    color: "#1F2937"
                                }}
                            >
                                Acharya Skill Mission
                            </h6>

                            <small className="text-muted">
                                Learn Skills. Build Career. Grow Together.
                            </small>

                        </div>

                    </div>


                    {/* ============================= */}
                    {/* Right Side */}
                    {/* ============================= */}

                    <div
                        className="col-md-7 p-5 d-flex align-items-center"
                        style={{
                            backgroundColor: "#FFFFFF"
                        }}
                    >

                        <div
                            className="w-100 mx-auto"
                            style={{
                                maxWidth: "460px"
                            }}
                        >

                            {/* Heading */}

                            <div className="mb-4">

                                <h2
                                    className="fw-bold mb-2"
                                    style={{
                                        color: "#1F2937"
                                    }}
                                >
                                    Welcome Back
                                </h2>

                                <p className="text-muted mb-0">
                                    Sign in to access your Center Dashboard.
                                </p>

                            </div>


                            {/* Error */}

                            {
                                error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )
                            }


                            <form>

                                {/* Username */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Username
                                    </label>

                                    <div className="input-group">

                                        <span className="input-group-text bg-white">
                                            <i
                                                className="bi bi-person"
                                                style={{
                                                    color: "#16A34A"
                                                }}
                                            ></i>
                                        </span>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Username"
                                            value={username}
                                            onChange={(e) =>
                                                setUsername(e.target.value)
                                            }
                                        />

                                    </div>

                                </div>


                                {/* Password */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Password
                                    </label>

                                    <div className="input-group">

                                        <span className="input-group-text bg-white">
                                            <i
                                                className="bi bi-lock"
                                                style={{
                                                    color: "#16A34A"
                                                }}
                                            ></i>
                                        </span>

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className="form-control"
                                            placeholder="Enter Password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            <i
                                                className={
                                                    showPassword
                                                        ? "bi bi-eye-slash"
                                                        : "bi bi-eye"
                                                }
                                            ></i>
                                        </button>

                                    </div>

                                </div>


                                {/* Remember Me */}

                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    <div className="form-check">

                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="centerRememberMe"
                                            checked={rememberMe}
                                            onChange={(e) =>
                                                setRememberMe(e.target.checked)
                                            }
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor="centerRememberMe"
                                        >
                                            Remember Me
                                        </label>

                                    </div>

                                    <a
                                        href="#"
                                        className="text-decoration-none"
                                        style={{
                                            color: "#16A34A"
                                        }}
                                    >
                                        Forgot Password?
                                    </a>

                                </div>


                                {/* Login Button */}

                                <button
                                    type="button"
                                    className="btn w-100 fw-semibold py-2"
                                    style={{
                                        backgroundColor: "#16A34A",
                                        borderColor: "#16A34A",
                                        color: "#FFFFFF"
                                    }}
                                    onClick={handleLogin}
                                >
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                    Login
                                </button>

                            </form>


                            {/* Back to Home */}

                            <hr className="my-4" />

                            <div className="text-center">

                                <Link
                                    to="/"
                                    replace
                                    className="text-decoration-none fw-semibold"
                                    style={{ color: "#16A34A" }}
                                >
                                    ← Back to Home
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    </>
);

}
