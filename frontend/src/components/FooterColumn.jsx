export default function FooterColumn(props) {
    return (
        <div className="col-3">
            <h5 className="text-warning fw-bold mb-3">{props.heading}</h5>
            {
                props.links.map((link) => {
                    return (
                        <p key={link} className="footer-link mb-2"><i className="bi bi-chevron-right me-2"></i>{link}</p>
                    );
                })
            }
        </div>
    );
}