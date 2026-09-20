import SuccessCard from "../SuccessCard";

export default function GovernmentSection() {

    const projects = [
        "Skill Development Programs",
        "Women Empowerment",
        "Digital Literacy Mission",
        "Rural Development",
        "Entrepreneurship Development"
    ];

    return (
        <section className="government-section py-5">
            <div className="container">

                <h2 className="text-center text-white fw-bold mb-5">Government Projects & Student Success</h2>

                <div className="row">

                    <div className="col-6 text-white">
                        <h4 className="text-warning fw-bold mb-4">Government Projects</h4>

                        {
                            projects.map((project) => {
                                return (
                                    <div className="mb-3" key={project}>

                                        <i className="bi bi-check-circle-fill text-warning me-2"></i>

                                        {project}

                                    </div>
                                );
                            })
                        }

                        <button className="btn btn-warning mt-3">Learn More</button>
                    </div>

                    <div className="col-6">
                        <SuccessCard name="Rohit Sharma" course="Digital Marketing Expert" story="Acharya Skill Mission helped me gain practical skills and start my career with confidence." />
                    </div>

                </div>
            </div>
        </section>
    );
}