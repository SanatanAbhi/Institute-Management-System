import DownloadCard from "../components/DownloadCard";

export default function DownloadsSection() {
    const downloads = [
        {
            id: 1,
            title: "Python Full Stack Syllabus",
            description: "Latest syllabus for Python Full Stack Development.",
            file: "python-fullstack.pdf"
        },
        {
            id: 2,
            title: "Admission Form",
            description: "Official Acharya Skill Mission admission form.",
            file: "admission-form.pdf"
        },
        {
            id: 3,
            title: "Fee Structure",
            description: "Course-wise fee structure and payment details.",
            file: "fee-structure.pdf"
        },
        {
            id: 4,
            title: "Placement Brochure",
            description: "Placement assistance and hiring partner details.",
            file: "placement-brochure.pdf"
        }
    ];

    return (
        <section className="py-5">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold text-primary">Downloads</h2>
                    <p className="text-secondary">Download syllabus, admission forms and important documents.</p>
                </div>
                <div className="row g-3">
                    {
                        downloads.map((download) => {
                            return (
                                <DownloadCard key={download.id} title={download.title} description={download.description} />
                            );
                        })
                    }
                </div>
            </div>
        </section>
    )
}