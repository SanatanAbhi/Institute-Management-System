
export default function DownloadCard({ title, description }) {
    return (
        <div className="col-12">
            <div className="card border-0 shadow-sm p-3 h-100">
                <div className="row align-items-center g-3">
                    <div className="col-12 col-sm-8 d-flex align-items-start align-items-sm-center">
                        <i
                            className="bi bi-file-earmark-pdf-fill text-danger me-3 flex-shrink-0"
                            aria-hidden="true"
                            style={{ fontSize: "38px" }}
                        ></i>

                        <div className="min-w-0">
                            <h5 className="fw-bold mb-1">{title}</h5>
                            <p className="small text-muted mb-0">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4 d-grid d-sm-flex justify-content-sm-end">
                        <button type="button" className="btn btn-danger">
                            <i className="bi bi-download me-2" aria-hidden="true"></i>
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
