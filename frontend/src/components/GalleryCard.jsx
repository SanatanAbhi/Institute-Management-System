export default function GalleryCard(props) {
    return (
        <div className="col-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="bg-light d-flex justify-content-center align-items-center" style={{height: "180px"}}>
                    {
                        props.image ? (
                            <img src={props.image} alt={props.title} className="img-fluid" />
                        ) : (
                            <i className="bi bi-image-fill text-secondary" style={{fontSize: "60px"}}></i>
                        )
                    }
                </div>
                <div className="card-body">
                    <h5 className="fw-bold text-primary">{props.title}</h5>
                    <p className="small text-muted">{props.date}</p>
                    <p className="small">{props.description}</p>
                </div>
            </div>
        </div>
    );
}