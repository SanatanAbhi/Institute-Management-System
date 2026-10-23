
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function CenterCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCourses() {
            try {
                const response = await api.get("/courses/");
                const data = response.data;
                setCourses(
                    Array.isArray(data) ? data : data.results || []
                );
            } catch (err) {
                console.error("Unable to load courses:", err);
                setError("Unable to load courses. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        loadCourses();
    }, []);

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-1">Courses</h2>
            <p className="text-muted mb-4">
                View courses available at the institute.
            </p>

            {loading && <p>Loading courses...</p>}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {!loading && !error && courses.length === 0 && (
                <div className="alert alert-info">
                    No active courses are currently available.
                </div>
            )}

            {!loading && !error && courses.length > 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Duration</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>{course.course_code}</td>
                                        <td>{course.course_name}</td>
                                        <td>{course.duration}</td>
                                        <td>
                                            ₹{Number(course.fee || 0).toLocaleString("en-IN")}
                                        </td>
                                        <td>{course.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <p className="small text-muted mt-3">
                Courses are managed by the Super Admin. This page is read-only.
            </p>
        </div>
    );
}
