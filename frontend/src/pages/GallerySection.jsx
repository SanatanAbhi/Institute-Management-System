import GalleryCard from "../components/GalleryCard";
import "../styles/gallery.css";

export default function GallerySection() {
    const gallery = [
        {
            id: 1,
            title: "Python Workshop",
            date: "15 Sep 2026",
            description: "Hands-on workshop for Python Full Stack students.",
            image: ""
        },
        {
            id: 2,
            title: "Placement Drive",
            date: "20 Sep 2026",
            description: "Campus recruitment activity at Hyderabad center.",
            image: ""
        },
        {
            id: 3,
            title: "Digital Marketing Seminar",
            date: "25 Sep 2026",
            description: "Interactive seminar with industry professionals.",
            image: ""
        },
        {
            id: 4,
            title: "Independence Day Celebration",
            date: "15 Aug 2026",
            description: "Flag hoisting and cultural activities.",
            image: ""
        },
        {
            id: 5,
            title: "Skill Development Program",
            date: "10 Aug 2026",
            description: "Government recognized skill development training.",
            image: ""
        },
        {
            id: 6,
            title: "Student Achievement Awards",
            date: "01 Aug 2026",
            description: "Students received certificates and awards.",
            image: ""
        }
    ];

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold text-primary">News Media & Gallery</h2>
                    <p className="text-secondary">Moments from workshops, seminars and student activities.</p>
                </div>

                <div id="galleryCarousel" className="carousel slide" data-bs-ride="carousel" >
                    <div className="carousel-inner">

                        {/* Slide 1 */}

                        <div className="carousel-item active">
                            <div className="row">
                                <GalleryCard title={gallery[0].title} date={gallery[0].date} description={gallery[0].description} image={gallery[0].image} />
                                <GalleryCard title={gallery[1].title} date={gallery[1].date} description={gallery[1].description} image={gallery[1].image} />
                                <GalleryCard title={gallery[2].title} date={gallery[2].date} description={gallery[2].description} image={gallery[2].image} />
                            </div>

                        </div>

                        {/* Slide 2 */}

                        <div className="carousel-item">
                            <div className="row">
                                <GalleryCard title={gallery[3].title} date={gallery[3].date} description={gallery[3].description} image={gallery[3].image} />
                                <GalleryCard title={gallery[4].title} date={gallery[4].date} description={gallery[4].description} image={gallery[4].image} />
                                <GalleryCard title={gallery[5].title} date={gallery[5].date} description={gallery[5].description} image={gallery[5].image} />
                            </div>
                        </div>
                    </div>

                    {/* Indicators */}

                    <div className="carousel-indicators">
                        <button type="button" data-bs-target="#galleryCarousel" data-bs-slide-to="0" className="active" ></button>
                        <button type="button" data-bs-target="#galleryCarousel" data-bs-slide-to="1"></button>
                    </div>

                    {/* Previous */}

                    <button className="carousel-control-prev" type="button" data-bs-target="#galleryCarousel" data-bs-slide="prev" ><span className="carousel-control-prev-icon"></span></button>

                    {/* Next */}

                    <button className="carousel-control-next" type="button" data-bs-target="#galleryCarousel" data-bs-slide="next" ><span className="carousel-control-next-icon"></span></button>
                </div>
            </div>
        </section>
    );
}