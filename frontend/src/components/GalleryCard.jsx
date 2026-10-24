
export default function GalleryCard({ title, date, description, image }) {
    return (
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
                <div
                    className="bg-light d-flex justify-content-center align-items-center overflow-hidden"
                    style={{ height: "clamp(140px, 22vw, 200px)" }}
                >
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                        />
                    ) : (
                        <i
                            className="bi bi-image-fill text-secondary"
                            aria-hidden="true"
                            style={{ fontSize: "clamp(40px, 8vw, 60px)" }}
                        ></i>
                    )}
                </div>

                <div className="card-body d-flex flex-column p-3">
                    <h5 className="fw-bold text-primary">{title}</h5>
                    <p className="small text-muted mb-2">{date}</p>
                    <p className="small mb-0">{description}</p>
                </div>
            </div>
        </div>
    );
}
