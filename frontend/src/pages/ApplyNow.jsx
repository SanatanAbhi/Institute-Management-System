
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import NavbarMenu from "../components/layout/NavbarMenu";
import api from "../services/api";

const initialFormData = {
    full_name: "",
    phone: "",
    email: "",
    course: "",
    qualification: "",
    city: "",
};

export default function ApplyNow() {
    const [formData, setFormData] = useState(initialFormData);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("warning");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setIsSubmitting(true);

        try {
            const response = await api.post(
                "/applications/",
                formData
            );

            setMessageType("success");
            setMessage(
                `Application submitted successfully! Your application ID is ${response.data.id}.`
            );

            setFormData({ ...initialFormData });
        } catch (error) {
            console.error(
                "Application submission error:",
                error.response?.data || error
            );

            let errorMessage =
                "Unable to submit your application. Please try again.";

            if (!error.response) {
                errorMessage =
                    "Cannot connect to the server. Please ensure that the Django backend is running.";
            } else {
                const data = error.response.data;

                if (typeof data?.detail === "string") {
                    errorMessage = data.detail;
                } else if (data && typeof data === "object") {
                    const firstError = Object.values(data)
                        .flat()
                        .find((value) => typeof value === "string");

                    if (firstError) {
                        errorMessage = firstError;
                    }
                }
            }

            setMessageType("danger");
            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Header />
            <NavbarMenu />

            <main
                className="py-5"
                style={{
                    backgroundColor: "#F8FAFC",
                    minHeight: "70vh",
                }}
            >
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-xl-7">
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-body p-4 p-md-5">
                                    {/* Heading */}
                                    <div className="text-center mb-4">
                                        <div
                                            className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                backgroundColor: "#DCFCE7",
                                                color: "#16A34A",
                                            }}
                                        >
                                            <i className="bi bi-mortarboard fs-2"></i>
                                        </div>

                                        <h2 className="fw-bold">
                                            Start Your Application
                                        </h2>

                                        <p className="text-muted mb-0">
                                            Share your details and choose the
                                            course you are interested in.
                                        </p>
                                    </div>

                                    {/* Success or error message */}
                                    {message && (
                                        <div
                                            className={`alert alert-${messageType}`}
                                            role="status"
                                        >
                                            {message}
                                        </div>
                                    )}

                                    {/* Application form */}
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                            {/* Full name */}
                                            <div className="col-md-6">
                                                <label
                                                    htmlFor="full_name"
                                                    className="form-label fw-semibold"
                                                >
                                                    Full Name *
                                                </label>

                                                <input
                                                    id="full_name"
                                                    name="full_name"
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    minLength={2}
                                                    maxLength={150}
                                                    required
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div className="col-md-6">
                                                <label
                                                    htmlFor="phone"
                                                    className="form-label fw-semibold"
                                                >
                                                    Mobile Number *
                                                </label>

                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    className="form-control"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="Enter mobile number"
                                                    pattern="[0-9]{10}"
                                                    maxLength={10}
                                                    title="Enter a 10-digit mobile number"
                                                    required
                                                />
                                            </div>

                                            {/* Email */}
                                            <div className="col-12">
                                                <label
                                                    htmlFor="email"
                                                    className="form-label fw-semibold"
                                                >
                                                    Email Address *
                                                </label>

                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter your email"
                                                    maxLength={254}
                                                    required
                                                />
                                            </div>

                                            {/* Course */}
                                            <div className="col-12">
                                                <label
                                                    htmlFor="course"
                                                    className="form-label fw-semibold"
                                                >
                                                    Course of Interest *
                                                </label>

                                                <input
                                                    id="course"
                                                    name="course"
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.course}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Python Full Stack"
                                                    maxLength={150}
                                                    required
                                                />
                                            </div>

                                            {/* Qualification */}
                                            <div className="col-md-6">
                                                <label
                                                    htmlFor="qualification"
                                                    className="form-label fw-semibold"
                                                >
                                                    Highest Qualification *
                                                </label>

                                                <input
                                                    id="qualification"
                                                    name="qualification"
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.qualification}
                                                    onChange={handleChange}
                                                    placeholder="e.g. BCA, B.Tech"
                                                    maxLength={150}
                                                    required
                                                />
                                            </div>

                                            {/* City */}
                                            <div className="col-md-6">
                                                <label
                                                    htmlFor="city"
                                                    className="form-label fw-semibold"
                                                >
                                                    City *
                                                </label>

                                                <input
                                                    id="city"
                                                    name="city"
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="Enter your city"
                                                    maxLength={100}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Submit button */}
                                        <button
                                            type="submit"
                                            className="btn btn-warning w-100 fw-semibold py-2 mt-4"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        aria-hidden="true"
                                                    ></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    Submit Application
                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Back to Home */}
                                    <div className="text-center mt-4">
                                        <Link
                                            to="/"
                                            className="text-decoration-none"
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Back to Home
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
