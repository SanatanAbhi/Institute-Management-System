export default function SuccessCard(props) {

    return (
        <div className="col-6">

            <div className="card border-0 shadow-sm h-100 p-4 text-center">

                {
                    props.image ? (

                        <img
                            src={props.image}
                            alt={props.name}
                            className="rounded-circle mx-auto border border-3 border-warning"
                            width="90"
                            height="90"
                        />

                    ) : (

                        <div
                            className="rounded-circle bg-light border border-3 border-warning d-flex justify-content-center align-items-center mx-auto"
                            style={{ width: "90px", height: "90px" }}
                        >
                            <i
                                className="bi bi-person-fill text-primary"
                                style={{ fontSize: "42px" }}
                            ></i>
                        </div>

                    )
                }

                <h5 className="fw-bold text-primary mt-3 mb-1">
                    {props.name}
                </h5>

                <p className="text-warning fw-semibold mb-2">
                    {props.course}
                </p>

                <p className="small text-muted mb-0">
                    {props.story}
                </p>

            </div>

        </div>
    );

}