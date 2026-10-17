import { useNavigate } from "react-router-dom";

export default function CenterModuleLayout({ children }) {
    const navigate = useNavigate();

    return (
        <>
            <div className="container-fluid px-3 px-lg-4 pt-3">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => navigate("/center-dashboard")}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                </button>
            </div>

            {children}
        </>
    );
}