
export default function FeatureCard({ icon, title, description }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="card shadow-sm h-100 text-center p-3 border-0">
                <i
                    className={icon}
                    aria-hidden="true"
                    style={{ fontSize: "45px", color: "#003B95" }}
                ></i>

                <h5 className="fw-bold mt-3">{title}</h5>

                <p className="small text-muted mb-0">{description}</p>
            </div>
        </div>
    );
}
