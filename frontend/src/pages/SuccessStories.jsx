import SuccessCard from "../components/SuccessCard";
import "../styles/successstories.css";
import student1 from "../assets/success-stories/student1.jpg";
import student2 from "../assets/success-stories/student2.jpg";
import student3 from "../assets/success-stories/student3.jpg";
import student4 from "../assets/success-stories/student4.jpg";

export default function SuccessStories() {

    const students = [
        {
            id: 1,
            name: "Priya Kumari",
            course: "Python Full Stack Development",
            story: "Placed in a software company after completing training.",
            image: student1
        },
        {
            id: 2,
            name: "Rahul Sharma",
            course: "Web Development",
            story: "Started working as a frontend developer.",
            image: student2
        },
        {
            id: 3,
            name: "Anjali Verma",
            course: "Digital Marketing",
            story: "Working as a social media marketing executive.",
            image: student3
        },
        {
            id: 4,
            name: "Vikas Kumar",
            course: "Data Analytics",
            story: "Selected for an internship through ASM placement support.",
            image: student4
        }
    ];

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="text-primary fw-bold">Student Success Stories</h2>
                    <p className="text-secondary">Hear from students who transformed their careers through Acharya Skill Mission.</p>
                </div>
                <div id="successCarousel" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        {/* Slide 1 */}
                        <div className="carousel-item active">
                            <div className="row">
                                <SuccessCard name={students[0].name} course={students[0].course} story={students[0].story} image={students[0].image} />
                                <SuccessCard name={students[1].name} course={students[1].course} story={students[1].story} image={students[1].image} />
                            </div>
                        </div>
                        {/* Slide 2 */}
                        <div className="carousel-item">
                            <div className="row">
                                <SuccessCard name={students[2].name} course={students[2].course} story={students[2].story} image={students[2].image} />
                                <SuccessCard name={students[3].name} course={students[3].course} story={students[3].story} image={students[3].image} />
                            </div>
                        </div>
                    </div>
                    {/* Previous Button */}
                    <button className="carousel-control-prev" type="button" data-bs-target="#successCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon"></span></button>
                    {/* Next Button */}
                    <button className="carousel-control-next" type="button" data-bs-target="#successCarousel" data-bs-slide="next"><span className="carousel-control-next-icon"></span></button>
                </div>
            </div>
        </section>
    )
}