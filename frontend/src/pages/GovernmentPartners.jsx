import PartnerCard from "../components/PartnerCard";

export default function GovernmentPartners() {
    const partners = [
        {
            id: 1,
            title: "Skill India Mission",
            icon: "bi-award-fill",
            description: "National skill development initiative under Government of India."
        },
        {
            id: 2,
            title: "NSDC",
            icon: "bi-bank",
            description: "National Skill Development Corporation training partner."
        },
        {
            id: 3,
            title: "MSDE",
            icon: "bi-building",
            description: "Ministry of Skill Development & Entrepreneurship."
        },
        {
            id: 4,
            title: "Digital India",
            icon: "bi-laptop-fill",
            description: "Promoting digital skills and employment opportunities."
        }
    ];

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold text-primary">Government Recognition</h2>
                    <p className="text-secondary">Acharya Skill Mission works with various national skill development initiatives.</p>
                </div>
                <div className="row g-4">
                    {
                        partners.map((partner) => {
                            return (
                                <PartnerCard key={partner.id} title={partner.title} icon={partner.icon} description={partner.description} />
                            );
                        })
                    }
                </div>
            </div>
        </section>
    );
}