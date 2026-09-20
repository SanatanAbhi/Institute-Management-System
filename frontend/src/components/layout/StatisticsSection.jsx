export default function StatisticsSection() {
    const statistics = [
        {number: "250+", title: "Courses"},
        {number: "4500+", title: "Training Centers"},
        {number: "2,50,000+", title: "Certificates Issued"},
        {number: "11+", title: "Districts"}
    ];

    return (
        <section className="statistics-section py-4">
            <div className="container">
                <div className="row">
                    {
                        statistics.map((item) => {
                            return (
                                <div className="col-3 text-center" key={item.title}>
                                    <h2 className="fw-bold text-warning">{item.number}</h2>
                                    <p className="text-white mb-0">{item.title}</p>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </section>
    );
}