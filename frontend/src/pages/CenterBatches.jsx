
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function CenterBatches() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadBatches() {
            try {
                const response = await api.get("/batches/");
                const data = response.data;
                setBatches(
                    Array.isArray(data) ? data : data.results || []
                );
            } catch (err) {
                console.error("Unable to load batches:", err);
                setError("Unable to load batches. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        loadBatches();
    }, []);

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-1">Batches</h2>
            <p className="text-muted mb-4">
                View upcoming and active batches for your center.
            </p>

            {loading && <p>Loading batches...</p>}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {!loading && !error && batches.length === 0 && (
                <div className="alert alert-info">
                    No upcoming or active batches are available for your center.
                </div>
            )}

            {!loading && !error && batches.length > 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Batch Code</th>
                                    <th>Batch Name</th>
                                    <th>Course</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map((batch) => (
                                    <tr key={batch.id}>
                                        <td>{batch.batch_code}</td>
                                        <td>{batch.batch_name}</td>
                                        <td>{batch.course_name}</td>
                                        <td>{batch.start_date}</td>
                                        <td>{batch.end_date}</td>
                                        <td>{batch.capacity}</td>
                                        <td>{batch.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <p className="small text-muted mt-3">
                Batches are managed by the Super Admin. This page is read-only.
            </p>
        </div>
    );
}
