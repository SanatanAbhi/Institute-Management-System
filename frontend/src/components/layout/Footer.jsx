import FooterColumn from "../FooterColumn";

export default function Footer() {
    const footerLinks = {

        "Student Zone": [
            "Student Login",
            "Certificates",
            "Downloads"
        ],

        "Centre Zone": [
            "Centre Login",
            "New Centre Registration",
            "Centre Support"
        ],

        "Quick Links": [
            "About Us",
            "Courses",
            "Events",
            "Gallery"
        ],

        "Contact Us": [
            "Hyderabad Office",
            "Patna Office",
            "Email Support",
            "Help Desk"
        ]
    };

    return (
        <footer className="footer-section py-5" id="contact">
            <div className="container">
                <div className="row">
                    {
                        Object.entries(footerLinks).map(([heading, links]) => {
                            return (
                                <FooterColumn key={heading} heading={heading} links={links} />
                            );
                        })
                    }
                </div>
                <hr className="border-secondary my-4" />
                <div className="text-center text-white small">© 2026 Acharya Skill Mission. All Rights Reserved.</div>
            </div>
        </footer>
    );
}