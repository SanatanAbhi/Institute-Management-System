
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../services/api";

function getExpectedRole(path) {
    if (path.startsWith("/student")) {
        return "STUDENT";
    }

    if (path.startsWith("/center")) {
        return "CENTER";
    }

    if (path.startsWith("/super-admin")) {
        return "SUPER_ADMIN";
    }

    return null;
}

function getDashboardPath(role) {
    const dashboards = {
        STUDENT: "/student-dashboard",
        CENTER: "/center-dashboard",
        SUPER_ADMIN: "/super-admin-dashboard",
    };

    return dashboards[role] || null;
}

function getLoginPath(path) {
    if (path.startsWith("/center")) {
        return "/center-login";
    }

    if (path.startsWith("/super-admin")) {
        return "/super-admin-login";
    }

    return "/student-login";
}

export default function ProtectedRoute({ children }) {
    const location = useLocation();

    const [status, setStatus] = useState("loading");
    const [userRole, setUserRole] = useState(null);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    const token = localStorage.getItem("accessToken");
    const expectedRole = getExpectedRole(location.pathname);

    useEffect(() => {
        let active = true;

        async function verifyUser() {
            setStatus("loading");
            setError("");

            if (!localStorage.getItem("accessToken")) {
                setStatus("unauthenticated");
                return;
            }

            try {
                const response = await api.get("/students/profile/");

                if (active) {
                    setUserRole(response.data.role);
                    setStatus("verified");
                }
            } catch (err) {
                if (active) {
                    setError(
                        "Unable to verify your account. Check the backend connection and try again."
                    );
                    setStatus("error");
                }
            }
        }

        verifyUser();

        return () => {
            active = false;
        };
    }, [location.pathname, retryCount, token]);

    if (!expectedRole) {
        return children;
    }

    if (status === "loading") {
        return (
            <div className="container text-center mt-5">
                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Verifying your account...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <Navigate
                to={getLoginPath(location.pathname)}
                replace
                state={{ from: location }}
            />
        );
    }

    if (status === "error") {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    {error}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => setRetryCount((count) => count + 1)}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (userRole !== expectedRole) {
        const dashboard = getDashboardPath(userRole);

        if (dashboard) {
            return <Navigate to={dashboard} replace />;
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        return (
            <Navigate
                to={getLoginPath(location.pathname)}
                replace
            />
        );
    }

    return children;
}
