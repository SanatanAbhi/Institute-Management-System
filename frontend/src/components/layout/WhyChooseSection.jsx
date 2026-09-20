import FeatureCard from "../FeatureCard";

export default function WhyChooseSection() {
    const features = [
        {
            icon: "bi bi-award",
            title: "Industry Expert Trainers",
            description: "Experienced trainers with practical industry knowledge."
        },
        {
            icon: "bi bi-briefcase",
            title: "Placement Assistance",
            description: "Career guidance and placement support for students."
        },
        {
            icon: "bi bi-laptop",
            title: "Practical Learning",
            description: "Hands-on training with real projects and assignments."
        },
        {
            icon: "bi bi-patch-check",
            title: "Government Certification",
            description: "Nationally recognized certification after course completion."
        }
    ];

    return (
        <section className="py-5">
            <div className="container">
                <h2 className="text-center text-primary fw-bold mb-5">Why Choose Acharya Skill Mission?</h2>
                <div className="row g-4">
                    {
                        features.map((features) => {
                            return (
                                <FeatureCard key={features.title} icon={features.icon} title={features.title} description={features.description} />
                            )
                        })
                    }
                </div>
            </div>
        </section>
    )
}