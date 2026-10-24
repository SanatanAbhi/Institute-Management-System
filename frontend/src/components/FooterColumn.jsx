
export default function FooterColumn({ heading, links }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3 mb-4">
            <h5 className="text-warning fw-bold mb-3">
                {heading}
            </h5>

            {links.map((link) => (
                <p key={link} className="footer-link mb-2">
                    <i
                        className="bi bi-chevron-right me-2"
                        aria-hidden="true"
                    ></i>
                    {link}
                </p>
            ))}
        </div>
    );
}
