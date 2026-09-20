export default function PartnerCard(props) {
    return (
        <div className="col-3">
            <div className="card shadow-sm border-0 h-100 text-center p-3">
                <div className="mb-3">
                    <i className={`bi ${props.icon} text-primary`} style={{fontSize: "40px"}}></i>
                </div>
                <h5 className="fw-bold">{props.title}</h5>
                <p className="small text-secondary mb-0">{props.description}</p>
            </div>
        </div>
    )
}