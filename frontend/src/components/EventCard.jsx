export default function EventCard(props) {
    return (
        <div className="col-4">
            <div className="card border-0 shadow-sm h-100 p-4">
                <div className="mb-3">
                    <i className={`bi ${props.icon} text-warning`} style={{fontSize: "38px"}}></i>
                </div>
                <span className="badge bg-primary mb-3">{props.date}</span>
                <h5>{props.title}</h5>
                <p className="text-secondary small mb-2">
                    <i className="bi bi-geo-alt-fill text-warning me-2"></i>
                    {props.location}
                </p>
                <p>{props.description}</p>
                <button className="btn btn-outline-primary mt-auto">Read More</button>
            </div>
        </div>
    );
}