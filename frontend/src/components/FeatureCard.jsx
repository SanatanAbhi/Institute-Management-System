export default function FeatureCard({icon, title, description}) {
    return (
        <div className="col-3">
            <div className="card shadow-sm h-100 text-center p-3 border-0">
                <i className={icon} style={{fontSize: "45px", color: "#003B95"}}></i>
                <h5 className="fw-bold mt-3">{title}</h5>
                <p className="small text-muted">{description}</p>
            </div>
        </div>
    );
}