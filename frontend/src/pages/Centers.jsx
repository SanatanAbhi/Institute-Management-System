import { useEffect, useState } from "react";
import api from "../services/api";
import CenterCard from "../components/CenterCard";

export default function Centers() {

    // State for Centers Data
    const [centers, setCenters] = useState([]);

    // State for Loading Spinner
    const [loading, setLoading] = useState(true);

    // State for Error Message
    const [error, setError] = useState("");

    // Load Centers API
    function loadCenters() {

        api.get("/centers/")
            .then((response) => {

                console.log("Centers API Response:", response.data);

                setCenters(response.data);
                setLoading(false);

            })
            .catch((error) => {

                console.log(error);

                setError("Unable to load centers.");
                setLoading(false);

            });

    }

    // Call API Once When Component Loads
    useEffect(() => {

        loadCenters();

    }, []);

    return (
        <section className="py-5" id="centers">
            <div className="container">

                {/* Section Heading */}

                <div className="text-center mb-5">

                    <h2 className="text-primary fw-bold">
                        Our Training Centers
                    </h2>

                    <p className="text-secondary">
                        Find the nearest Acharya Skill Mission training center across India.
                    </p>

                </div>

                {/* Loading Spinner */}

                {
                    loading && (
                        <div className="text-center py-5">

                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>

                            <p className="mt-3 text-secondary fw-semibold">Loading Centers...</p>

                        </div>
                    )
                }

                {/* Error Message */}

                {
                    error && (
                        <div className="alert alert-danger text-center">{error}</div>
                    )
                }

                {/* Empty State */}

                {
                    !loading && centers.length === 0 && !error && (
                        <div className="alert alert-warning text-center"> No Centers Available.</div>
                    )
                }

                {/* Centers Cards */}

                {
                    !loading && centers.length > 0 && (

                        <div className="row g-4">

                            {
                                centers.map((center) => {
                                    return (
                                        <CenterCard
                                            key={center.id}
                                            center_name={center.center_name}
                                            center_code={center.center_code}
                                            city={center.city}
                                            state={center.state}
                                        />
                                    );
                                })
                            }

                        </div>

                    )
                }

            </div>
        </section>
    );

}