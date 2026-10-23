
import { useState } from "react";
import api from "../services/api";
import logo from "../assets/logo/ACHARYA_SKILLS_MISISON_LOGO.png";
import "../styles/centercard.css";

export default function CenterCard(props) {
    const [showDetails, setShowDetails] = useState(false);
    const [center, setCenter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleViewDetails() {
        setShowDetails(true);
        setLoading(true);
        setError("");
        setCenter(null);

        try {
            const response = await api.get(`/centers/${props.id}/`);
            setCenter(response.data);
        } catch (err) {
            console.error("Unable to load center details:", err);
            setError("Unable to load center details. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function closeDetails() {
        setShowDetails(false);
    }

    return (
        <div className="col-12 col-md-6 col-xl-4">
            <div className="card center-card h-100">
                <div className="text-center py-3 center-card-top">
                    <img
                        src={logo}
                        alt="ASM Logo"
                        width="60"
                        height="55"
                    />
                </div>

                <div className="card-body text-center">
                    <h5 className="fw-bold text-primary">
                        {props.center_name}
                    </h5>

                    <span className="badge bg-warning text-dark mb-3">
                        {props.center_code}
                    </span>

                    <p className="mb-2 text-secondary">
                        <i className="bi bi-geo-alt-fill text-warning me-2"></i>
                        {props.city}, {props.state}
                    </p>

                    <div className="d-grid gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleViewDetails}
                        >
                            <i className="bi bi-eye me-2"></i>
                            View Details
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => props.onEdit(props.id)}
                        >
                            <i className="bi bi-pencil-square me-2"></i>
                            Edit Center
                        </button>
                    </div>

                </div>
            </div>

            {showDetails && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    role="dialog"
                    aria-modal="true"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={closeDetails}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        role="document"
                    >
                        <div
                            className="modal-content"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Training Center Details
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={closeDetails}
                                ></button>
                            </div>

                            <div className="modal-body text-start">
                                {loading && (
                                    <p>Loading center details...</p>
                                )}

                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}

                                {center && (
                                    <>
                                        {center.logo && (
                                            <div className="text-center mb-3">
                                                <img
                                                    src={center.logo}
                                                    alt="Center logo"
                                                    style={{
                                                        maxWidth: "120px",
                                                        maxHeight: "100px",
                                                        objectFit: "contain",
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {center.owner_photo && (
                                            <div className="text-center mb-3">
                                                <img
                                                    src={center.owner_photo}
                                                    alt="Center owner"
                                                    className="rounded-circle"
                                                    width="90"
                                                    height="90"
                                                    style={{
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <strong>Center Name:</strong>
                                                <div>{center.center_name || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>Center Code:</strong>
                                                <div>{center.center_code || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>Owner Name:</strong>
                                                <div>{center.owner_name || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>Email:</strong>
                                                <div>{center.email || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>Phone:</strong>
                                                <div>{center.phone || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>City:</strong>
                                                <div>{center.city || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>District:</strong>
                                                <div>{center.district || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>State:</strong>
                                                <div>{center.state || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>PIN Code:</strong>
                                                <div>{center.pincode || "—"}</div>
                                            </div>

                                            <div className="col-12">
                                                <strong>Address:</strong>
                                                <div>{center.address || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>Status:</strong>
                                                <div>{center.status || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>Registration Date:</strong>
                                                <div>{center.registration_date || "—"}</div>
                                            </div>

                                            <div className="col-md-6">
                                                <strong>Expiry Date:</strong>
                                                <div>
                                                    {center.is_lifetime
                                                        ? "Lifetime"
                                                        : center.expiry_date || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeDetails}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
