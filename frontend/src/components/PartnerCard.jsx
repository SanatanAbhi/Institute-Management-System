
export default function PartnerCard({ icon, title, description }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 text-center p-3">
                <div className="mb-3">
                    <i
                        className={`bi ${icon} text-primary`}
                        aria-hidden="true"
                        style={{ fontSize: "40px" }}
                    ></i>
                </div>

                <h5 className="fw-bold">{title}</h5>

                <p className="small text-secondary mb-0">
                    {description}
                </p>
            </div>
        </div>
    );
}
