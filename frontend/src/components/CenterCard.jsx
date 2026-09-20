import logo from "../assets/logo/ACHARYA_SKILLS_MISISON_LOGO.png";
import "../styles/centercard.css";

export default function CenterCard(props) {
    return (
        <div className="col-4">
            <div className="card center-card h-100">
                {/* Top Section */}
                <div className="text-center py-3 center-card-top">
                    <img src={logo} alt="ASM Logo" width="60" height="55" />
                </div>
                {/* Card Body */}
                <div className="card-body text-center">
                    <h5 className="fw-bold text-primary">{props.center_name}</h5>
                    <span className="badge bg-warning text-dark mb-3">{props.center_code}</span>
                    <p className="mb-2 text-secondary"><icon className="bi bi-geo-alt-fill text-warning me-2" color="#F97316" />{props.city}, {props.state}</p>
                    <button className="btn btn-outline-primary w-100">View Details</button>
                </div>
            </div>
        </div>
    );
}