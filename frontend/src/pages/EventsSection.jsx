
import EventCard from "../components/EventCard";

export default function EventsSection() {

    const events = [
        {
            id: 1,
            title: "Python Full Stack Workshop",
            date: "15 Sep 2026",
            location: "Ameerpet, Hyderabad",
            icon: "bi-calendar-event-fill",
            description: "Free workshop on Python Full Stack Development for beginners."
        },
        {
            id: 2,
            title: "Job Placement Drive",
            date: "20 Sep 2026",
            location: "Hyderabad Center",
            icon: "bi-briefcase-fill",
            description: "Top companies will participate in placement interviews."
        },
        {
            id: 3,
            title: "Digital Marketing Seminar",
            date: "25 Sep 2026",
            location: "Patna Center",
            icon: "bi-megaphone-fill",
            description: "Learn modern digital marketing skills from industry experts."
        }
    ];

    return (
        <section className="py-5">
            <div className="container">
                <div className="text-center mb-5">

                    <h2 className="text-primary fw-bold">Events & Activities</h2>
                    <p className="text-secondary">Latest workshops, seminars and placement activities at Acharya Skill Mission.</p>

                </div>

                <div className="row g-4">

                    {
                        events.map((event) => {
                            return (
                                <EventCard key={event.id} title={event.title} date={event.date} location={event.location} icon={event.icon} description={event.description} />
                            );
                        })
                    }

                </div>
            </div>
        </section>
    );

}