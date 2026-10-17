
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import NavbarMenu from "../components/layout/NavbarMenu";
import api from "../services/api";

export default function SuperAdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();
        setError("");

        if (!username.trim() || !password) {
            setError("Please enter username and password.");
            return;
        }

        setLoading(true);

        // Remove any previous user's tokens.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        try {
            // Step 1: Authenticate with Django JWT.
            const loginResponse = await api.post("/token/", {
                username: username.trim(),
                password,
            });

            const accessToken = loginResponse.data.access;
            const refreshToken = loginResponse.data.refresh;

            if (!accessToken || !refreshToken) {
                throw new Error("Authentication tokens were not returned.");
            }

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            // Step 2: Verify the logged-in user's role.
            const profileResponse = await api.get("/students/profile/");
            const role = profileResponse.data.role;

            if (role !== "SUPER_ADMIN") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                setError(
                    "Access denied. This account is not a Super Admin account."
                );
                return;
            }

            // Step 3: Open the existing Super Admin dashboard.
            navigate("/super-admin-dashboard", { replace: true });
        } catch (err) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            if (err.response?.status === 401) {
                setError("Invalid username or password.");
            } else if (err.response) {
                setError(
                    "Unable to verify your account. Please try again."
                );
            } else {
                setError(
                    "Unable to connect to the server. Please check that Django is running."
                );
            }
        } finally {
            setLoading(false);
        }
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
                            backgroundColor: "#FFFFFF",
                        }}
                    >
                        {/* Left side: Super Admin information */}
                        <div
                            className="col-md-5 p-5 d-flex flex-column justify-content-center"
                            style={{ backgroundColor: "#EFF6FF" }}
                        >
                            <div>
                                <div
                                    className="mb-4 d-flex align-items-center justify-content-center rounded-3"
                                    style={{
                                        width: "64px",
                                        height: "64px",
                                        backgroundColor: "#DBEAFE",
                                    }}
                                >
                                    <i
                                        className="bi bi-shield-lock-fill fs-2"
                                        style={{ color: "#2563EB" }}
                                    ></i>
                                </div>

                                <h1
                                    className="fw-bold mb-3"
                                    style={{ color: "#1F2937" }}
                                >
                                    Super Admin Portal
                                </h1>

                                <p
                                    className="fs-5 mb-4"
                                    style={{ color: "#4B5563" }}
                                >
                                    Manage institute operations, user
                                    accounts, and administrative activities
                                    from one place.
                                </p>

                                <div className="mb-3">
                                    {[
                                        "Manage User Accounts",
                                        "Oversee Institute Operations",
                                        "Manage Centers and Access",
                                        "Monitor Administrative Activities",
                                    ].map((feature) => (
                                        <div
                                            key={feature}
                                            className="d-flex align-items-center mb-3"
                                        >
                                            <i
                                                className="bi bi-check-circle-fill me-3"
                                                style={{ color: "#2563EB" }}
                                            ></i>
                                            <span className="text-secondary">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <hr className="my-4" />

                                <h6 className="fw-bold mb-1">
                                    Acharya Skill Mission
                                </h6>

                                <small className="text-muted">
                                    Learn Skills. Build Career. Grow Together.
                                </small>
                            </div>
                        </div>

                        {/* Right side: Login form */}
                        <div className="col-md-7 p-4 p-md-5 d-flex align-items-center">
                            <div
                                className="w-100 mx-auto"
                                style={{ maxWidth: "460px" }}
                            >
                                <div className="mb-4">
                                    <h2
                                        className="fw-bold mb-2"
                                        style={{ color: "#1F2937" }}
                                    >
                                        Super Admin Login
                                    </h2>

                                    <p className="text-muted mb-0">
                                        Sign in to access your administrative
                                        dashboard.
                                    </p>
                                </div>

                                {error && (
                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleLogin}>
                                    <div className="mb-3">
                                        <label
                                            htmlFor="superAdminUsername"
                                            className="form-label fw-semibold"
                                        >
                                            Username
                                        </label>

                                        <div className="input-group">
                                            <span className="input-group-text bg-white">
                                                <i
                                                    className="bi bi-person"
                                                    style={{ color: "#2563EB" }}
                                                ></i>
                                            </span>

                                            <input
                                                id="superAdminUsername"
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter username"
                                                value={username}
                                                onChange={(event) =>
                                                    setUsername(
                                                        event.target.value
                                                    )
                                                }
                                                autoComplete="username"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label
                                            htmlFor="superAdminPassword"
                                            className="form-label fw-semibold"
                                        >
                                            Password
                                        </label>

                                        <div className="input-group">
                                            <span className="input-group-text bg-white">
                                                <i
                                                    className="bi bi-lock"
                                                    style={{ color: "#2563EB" }}
                                                ></i>
                                            </span>

                                            <input
                                                id="superAdminPassword"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                className="form-control"
                                                placeholder="Enter password"
                                                value={password}
                                                onChange={(event) =>
                                                    setPassword(
                                                        event.target.value
                                                    )
                                                }
                                                autoComplete="current-password"
                                                required
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
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

                                    <button
                                        type="submit"
                                        className="btn w-100 fw-semibold py-2"
                                        style={{
                                            backgroundColor: "#2563EB",
                                            borderColor: "#2563EB",
                                            color: "#FFFFFF",
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    aria-hidden="true"
                                                ></span>
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Login
                                            </>
                                        )}
                                    </button>
                                </form>

                                <hr className="my-4" />

                                <div className="text-center">
                                    <Link
                                        to="/"
                                        className="text-decoration-none fw-semibold"
                                        style={{ color: "#2563EB" }}
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
