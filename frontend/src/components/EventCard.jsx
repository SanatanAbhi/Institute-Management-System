
export default function EventCard({ title, date, location, icon, description }) {
    return (
        <div className="col-12 col-sm-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100 p-3 p-md-4">
                <div className="mb-3">
                    <i
                        className={`bi ${icon} text-warning`}
                        aria-hidden="true"
                        style={{ fontSize: "38px" }}
                    ></i>
                </div>

                <span className="badge bg-primary mb-3 align-self-start">
                    {date}
                </span>

                <h5 className="fw-bold">{title}</h5>

                <p className="text-secondary small mb-2">
                    <i
                        className="bi bi-geo-alt-fill text-warning me-2"
                        aria-hidden="true"
                    ></i>
                    {location}
                </p>

                <p className="text-secondary">{description}</p>

                <button
                    type="button"
                    className="btn btn-outline-primary mt-auto w-100"
                >
                    Read More
                </button>
            </div>
        </div>
    );
}
