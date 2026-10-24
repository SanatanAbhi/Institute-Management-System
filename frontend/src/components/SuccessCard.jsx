
export default function SuccessCard({ name, course, story, image }) {
    return (
        <div className="col-12 col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100 p-3 p-md-4 text-center">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="rounded-circle mx-auto border border-3 border-warning"
                        width="90"
                        height="90"
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div
                        className="rounded-circle bg-light border border-3 border-warning d-flex justify-content-center align-items-center mx-auto"
                        style={{ width: "90px", height: "90px" }}
                    >
                        <i
                            className="bi bi-person-fill text-primary"
                            aria-hidden="true"
                            style={{ fontSize: "42px" }}
                        ></i>
                    </div>
                )}

                <h5 className="fw-bold text-primary mt-3 mb-1">
                    {name}
                </h5>

                <p className="text-warning fw-semibold mb-2">
                    {course}
                </p>

                <p className="small text-muted mb-0">
                    {story}
                </p>
            </div>
        </div>
    );
}
