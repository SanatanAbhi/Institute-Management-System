import CourseCard from "../CourseCard";

export default function PopularCourses() {
    const courses = [
        {
            icon: "bi bi-laptop",
            title: "Computer Skills",
            description: "Learn Python, MS Office, Web Development and more."
        },
        {
            icon: "bi bi-people",
            title: "Soft Skills",
            description: "Improve communication, interview and personality skills."
        },
        {
            icon: "bi bi-graph-up-arrow",
            title: "Entrepreneurship",
            description: "Start and grow your own business with practical guidance."
        },
        {
            icon: "bi bi-heart-pulse",
            title: "Yoga & Wellness",
            description: "Develop physical and mental wellness through yoga."
        }
    ];

    return (
        <section className="py-5 bg-light" id="courses">
            <div className="container">
                <h2 className="text-center fw-bold text-primary mb-4">Popular Courses</h2>
                <div className="row g-4">
                    {
                        courses.map((course) => {
                            return (
                                <CourseCard key={course.title} icon={course.icon} title={course.title} description={course.description} />
                            );
                        })
                    }
                </div>
            </div>
        </section>
    )
}