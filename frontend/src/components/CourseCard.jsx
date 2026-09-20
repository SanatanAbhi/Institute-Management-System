export default function CourseCard(props) {
    return (
        <div className="col-3">
            <div className="card shadow-lg h-100 text-center p-3">
                <i className={props.icons} style={{fontSize: "45px", color: "#003B95"}}></i>
                <h5 className="fw-bold mt-3">{props.title}</h5>
                <p className="small text-muted">{props.description}</p>
                <button className="btn btn-outline-primary">View Details</button>
            </div>
        </div>
    );
}