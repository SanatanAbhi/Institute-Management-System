export default function DownloadCard(props) {
    return (
        <div className="col-12">
            <div className="card border-0 shadow-sm p-3">
                <div className="row align-items-center">
                    <div className="col-8 d-flex align-items-center">
                        <i className="bi bi-file-earmark-pdf-fill text-danger me-3" style={{ fontSize: "38px" }}></i>
                        <div>
                            <h5 className="fw-bold mb-1">{props.title}</h5>
                            <p className="small text-muted mb-0">{props.description}</p>
                        </div>
                    </div>
                    <div className="col-4 text-end">
                        <button className="btn btn-danger">Download</button>
                    </div>
                </div>
            </div>
        </div>
    );
}