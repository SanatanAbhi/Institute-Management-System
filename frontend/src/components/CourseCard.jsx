
export default function CourseCard({ icon, title, description }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="card shadow-lg h-100 text-center p-3 course-card">
                <i
                    className={icon}
                    aria-hidden="true"
                    style={{ fontSize: "45px", color: "#003B95" }}
                />

                <h5 className="fw-bold mt-3">{title}</h5>

                <p className="small text-muted flex-grow-1">
                    {description}
                </p>

                <button type="button" className="btn btn-outline-primary">
                    View Details
                </button>
            </div>
        </div>
    );
}
