export default function StatCard({ stat, onClick }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100 text-center p-4 dashboard-card" onClick={() => onClick(stat.section)} style={{ cursor: "pointer" }}>
                <i className={`bi ${stat.icon} text-${stat.color} fs-1 mb-3`}></i>
                <h3 className={`fw-bold text-${stat.color}`}>{stat.value}</h3>
                <p className="text-muted mb-0">{stat.title}</p>
            </div>
        </div>
    );
}