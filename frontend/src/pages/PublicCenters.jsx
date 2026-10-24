
import { useEffect, useState } from "react";
import api from "../services/api";
import CenterCard from "../components/CenterCard";
import logo from "../assets/logo/ACHARYA_SKILLS_MISISON_LOGO.png";
import "../styles/public-centers.css";

export default function PublicCenters() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadCenters() {
            try {
                const response = await api.get("/centers/");

                if (!cancelled) {
                    setCenters(
                        Array.isArray(response.data) ? response.data : []
                    );
                }
            } catch (err) {
                console.error("Unable to load public centers:", err);

                if (!cancelled) {
                    setError("Unable to load training centers at this time.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadCenters();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="py-5" id="centers">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="text-primary fw-bold">
                        Our Training Centers
                    </h2>
                    <p className="text-secondary">
                        Explore our training centers and locations.
                    </p>
                </div>

                {loading && (
                    <div className="text-center py-4">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading centers...
                            </span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-warning text-center">
                        {error}
                    </div>
                )}

                {!loading && !error && centers.length === 0 && (
                    <p className="text-center text-secondary">
                        Training center information will be available soon.
                    </p>
                )}

                {!loading && !error && centers.length > 0 && (
                    
                    <div className="row g-4">
                        {centers.map((center) => (
                            <div
                                className="col-12 col-sm-6 col-lg-4"
                                key={center.id}
                            >
                                <div className="card public-center-card h-100 border-0">
                                    <div className="public-center-logo-area">
                                        <span className="public-center-label">
                                            TRAINING CENTER
                                        </span>

                                        <img
                                            src={center.logo || logo}
                                            alt={`${center.center_name} logo`}
                                            className="public-institute-logo"
                                            />
                                    </div>

                                    <div className="card-body p-4 d-flex flex-column">
                                        <h5 className="public-center-name">
                                            {center.center_name}
                                        </h5>

                                        <div className="public-center-location">
                                            <i className="bi bi-geo-alt-fill me-2"></i>
                                            <span>
                                                {[center.city, center.state]
                                                    .filter(Boolean)
                                                    .join(", ") || "Location not available"}
                                            </span>
                                        </div>

                                        {center.center_code && (
                                            <div className="public-center-code">
                                                <i className="bi bi-patch-check-fill me-2"></i>
                                                Center Code: {center.center_code}
                                            </div>
                                        )}

                                        <div className="public-center-divider"></div>

                                        <div className="mt-auto">
                                            <div className="d-flex align-items-center gap-2 text-success small">
                                                <i className="bi bi-check-circle-fill"></i>
                                                <span>Part of Acharya Skills Mission</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                )}
            </div>
        </section>
    );
}
