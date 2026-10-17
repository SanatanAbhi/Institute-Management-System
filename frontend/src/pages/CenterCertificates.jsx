import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUSES = {
    DRAFT: "Draft",
    ISSUED: "Issued",
    REVOKED: "Revoked",
};

const EMPTY_FORM = {
    result: "",
    completion_date: "",
    issue_date: "",
    status: "DRAFT",
    remarks: "",
};

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("en-IN");
}

function statusClass(status) {
    if (status === "ISSUED") return "bg-success";
    if (status === "REVOKED") return "bg-danger";
    return "bg-secondary";
}

function getErrorMessage(error, fallback) {
    const data = error?.response?.data;

    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    return Object.entries(data)
        .map(([field, value]) => {
            const message = Array.isArray(value)
                ? value.join(", ")
                : typeof value === "object"
                    ? JSON.stringify(value)
                    : value;

            return `${field}: ${message}`;
        })
        .join(" | ") || fallback;
}

function getStudentName(student) {
    if (!student) return "Unknown student";

    const name = (
        `${student.first_name || ""} ${student.last_name || ""}`
    ).trim();

    return name || student.name || student.username || `Student #${student.id}`;
}

export default function CenterCertificates() {
    const navigate = useNavigate();

    const [certificates, setCertificates] = useState([]);
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [batches, setBatches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formVisible, setFormVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    const [form, setForm] = useState({ ...EMPTY_FORM });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [certificateResponse, resultResponse, examResponse, batchResponse] =
                await Promise.all([
                    api.get("/certificates/center/"),
                    api.get("/results/center/"),
                    api.get("/exams/center/"),
                    api.get("/batches/"),
                ]);

            setCertificates(
                Array.isArray(certificateResponse.data)
                    ? certificateResponse.data
                    : []
            );

            setResults(
                Array.isArray(resultResponse.data)
                    ? resultResponse.data
                    : []
            );

            setExams(
                Array.isArray(examResponse.data)
                    ? examResponse.data
                    : []
            );

            setBatches(
                Array.isArray(batchResponse.data)
                    ? batchResponse.data
                    : []
            );
        } catch (err) {
            console.error("Certificate loading error:", err);
            setError(
                getErrorMessage(err, "Unable to load certificates.")
            );
        } finally {
            setLoading(false);
        }
    };

    const refreshCertificates = async () => {
        const response = await api.get("/certificates/center/");

        setCertificates(
            Array.isArray(response.data) ? response.data : []
        );
    };

    const getCourseId = (result) => {
        if (!result) return null;

        const exam = exams.find(
            (item) => String(item.id) === String(result.exam)
        );

        const batch = batches.find(
            (item) => String(item.id) === String(exam?.batch)
        );

        return batch?.course ?? null;
    };

    const getCourseName = (result) => {
        if (!result) return "-";

        if (result.course_name) return result.course_name;

        const exam = exams.find(
            (item) => String(item.id) === String(result.exam)
        );

        const batch = batches.find(
            (item) => String(item.id) === String(exam?.batch)
        );

        return batch?.course_name ||
            `Course #${getCourseId(result) || "-"}`;
    };

    const getResultLabel = (result) => {
        const exam = exams.find(
            (item) => String(item.id) === String(result.exam)
        );

        return `${result.exam_title || exam?.title || `Exam #${result.exam}`} — ${
            result.student_name || `Student #${result.student}`
        } (${result.percentage ?? 0}%)`;
    };

    const eligibleResults = useMemo(() => {
        return results.filter((result) => {
            if (result.result_status !== "PASS") return false;

            const courseId = getCourseId(result);

            if (!courseId) return false;

            // During editing, allow the certificate's existing result.
            if (
                editingId &&
                certificates.some(
                    (certificate) =>
                        String(certificate.id) === String(editingId) &&
                        String(certificate.result) === String(result.id)
                )
            ) {
                return true;
            }

            // Avoid another certificate for the same student and course.
            return !certificates.some(
                (certificate) =>
                    String(certificate.student) === String(result.student) &&
                    String(certificate.course) === String(courseId)
            );
        });
    }, [results, certificates, exams, batches, editingId]);

    const selectedResult = results.find(
        (result) => String(result.id) === String(form.result)
    );

    const filteredCertificates = useMemo(() => {
        const query = search.trim().toLowerCase();

        return certificates
            .filter((certificate) => {
                const searchable = [
                    certificate.certificate_number,
                    certificate.student_name,
                    certificate.student_registration_number,
                    certificate.course_name,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return (
                    (!query || searchable.includes(query)) &&
                    (!statusFilter || certificate.status === statusFilter) &&
                    (!dateFrom || certificate.completion_date >= dateFrom) &&
                    (!dateTo || certificate.completion_date <= dateTo)
                );
            })
            .sort((a, b) =>
                String(b.created_at || "").localeCompare(
                    String(a.created_at || "")
                )
            );
    }, [certificates, search, statusFilter, dateFrom, dateTo]);

    const summary = {
        total: certificates.length,
        draft: certificates.filter((item) => item.status === "DRAFT").length,
        issued: certificates.filter((item) => item.status === "ISSUED").length,
        revoked: certificates.filter((item) => item.status === "REVOKED").length,
    };

    const resetForm = () => {
        setForm({ ...EMPTY_FORM });
        setEditingId(null);
        setFormVisible(false);
    };

    const openCreateForm = () => {
        setSuccess("");
        setError("");
        setForm({ ...EMPTY_FORM });
        setEditingId(null);
        setSelectedCertificate(null);
        setFormVisible(true);
    };

    const openEditForm = (certificate) => {
        setSuccess("");
        setError("");
        setSelectedCertificate(null);

        setEditingId(certificate.id);

        setForm({
            result: String(certificate.result),
            completion_date: certificate.completion_date || "",
            issue_date: certificate.issue_date || "",
            status: certificate.status || "DRAFT",
            remarks: certificate.remarks || "",
        });

        setFormVisible(true);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSuccess("");
        setError("");

        if (!selectedResult) {
            setError("Select a passing result.");
            return;
        }

        const courseId = getCourseId(selectedResult);

        if (!courseId) {
            setError("The selected result's course could not be identified.");
            return;
        }

        if (
            form.issue_date &&
            form.issue_date < form.completion_date
        ) {
            setError("Issue date cannot be before completion date.");
            return;
        }

        const payload = {
            student: Number(selectedResult.student),
            course: Number(courseId),
            result: Number(selectedResult.id),
            completion_date: form.completion_date,
            status: form.status,
            remarks: form.remarks.trim(),
        };

        if (form.issue_date) {
            payload.issue_date = form.issue_date;
        }

        try {
            setSaving(true);

            let response;

            if (editingId) {
                response = await api.patch(
                    `/certificates/center/${editingId}/`,
                    payload
                );
            } else {
                response = await api.post(
                    "/certificates/center/",
                    payload
                );
            }

            setSuccess(
                `Certificate ${response.data.certificate_number} ${
                    editingId ? "updated" : "created"
                } successfully.`
            );

            resetForm();
            await refreshCertificates();
        } catch (err) {
            console.error("Certificate save error:", err);
            setError(
                getErrorMessage(err, "Unable to save certificate.")
            );
        } finally {
            setSaving(false);
        }
    };

    const viewCertificate = async (certificateId) => {
        setError("");
        setSuccess("");

        try {
            const response = await api.get(
                `/certificates/center/${certificateId}/`
            );

            setSelectedCertificate(response.data);
            setFormVisible(false);
        } catch (err) {
            setError(
                getErrorMessage(err, "Unable to load certificate.")
            );
        }
    };

    const deleteCertificate = async (certificate) => {
        const confirmed = window.confirm(
            `Delete certificate ${certificate.certificate_number}?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(
                `/certificates/center/${certificate.id}/`
            );

            setSuccess(
                `Certificate ${certificate.certificate_number} deleted.`
            );

            setSelectedCertificate(null);
            await refreshCertificates();
        } catch (err) {
            setError(
                getErrorMessage(err, "Unable to delete certificate.")
            );
        }
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setDateFrom("");
        setDateTo("");
    };

    return (
        <div className="container-fluid py-4">
            {/* Page header */}
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <div>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary mb-2"
                        onClick={() => navigate("/center-dashboard")}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Dashboard
                    </button>

                    <h2 className="fw-bold mb-1">Certificates</h2>

                    <p className="text-muted mb-0">
                        Create and manage certificates from passing results.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreateForm}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Create Certificate
                </button>
            </div>

            {success && (
                <div className="alert alert-success alert-dismissible">
                    {success}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccess("")}
                    ></button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger alert-dismissible">
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError("")}
                    ></button>
                </div>
            )}

            {/* Summary */}
            <div className="row g-3 mb-4">
                {[
                    ["Total Certificates", summary.total, "bi-award", "primary"],
                    ["Draft", summary.draft, "bi-file-earmark", "secondary"],
                    ["Issued", summary.issued, "bi-patch-check", "success"],
                    ["Revoked", summary.revoked, "bi-x-circle", "danger"],
                ].map(([title, value, icon, color]) => (
                    <div className="col-6 col-lg-3" key={title}>
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-muted small">{title}</div>
                                    <h3 className="fw-bold mb-0">{value}</h3>
                                </div>
                                <i className={`bi ${icon} fs-2 text-${color}`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit form */}
            {formVisible && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            {editingId ? "Edit Certificate" : "Create Certificate"}
                        </h5>

                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={resetForm}
                            disabled={saving}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">
                                        Passing Exam Result *
                                    </label>

                                    <select
                                        className="form-select"
                                        name="result"
                                        value={form.result}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select passing result
                                        </option>

                                        {eligibleResults.map((result) => (
                                            <option
                                                key={result.id}
                                                value={result.id}
                                            >
                                                {getResultLabelForForm(result, exams)}
                                            </option>
                                        ))}
                                    </select>

                                    <small className="text-muted">
                                        Only passing results without an existing certificate are available.
                                    </small>
                                </div>

                                {selectedResult && (
                                    <>
                                        <div className="col-md-6">
                                            <label className="form-label">Student</label>
                                            <input
                                                className="form-control"
                                                value={selectedResult.student_name || `Student #${selectedResult.student}`}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">Grade</label>
                                            <input
                                                className="form-control"
                                                value={selectedResult.grade || "-"}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">Percentage</label>
                                            <input
                                                className="form-control"
                                                value={`${selectedResult.percentage ?? "-"}%`}
                                                readOnly
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Completion Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="completion_date"
                                        className="form-control"
                                        value={form.completion_date}
                                        onChange={handleChange}
                                        max={new Date().toLocaleDateString("en-CA")}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Issue Date</label>

                                    <input
                                        type="date"
                                        name="issue_date"
                                        className="form-control"
                                        value={form.issue_date}
                                        onChange={handleChange}
                                        min={form.completion_date || undefined}
                                        max={new Date().toLocaleDateString("en-CA")}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Status *</label>

                                    <select
                                        name="status"
                                        className="form-select"
                                        value={form.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        {Object.entries(STATUSES).map(
                                            ([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Remarks</label>

                                    <textarea
                                        name="remarks"
                                        className="form-control"
                                        rows="3"
                                        value={form.remarks}
                                        onChange={handleChange}
                                        placeholder="Optional remarks"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer bg-white d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Certificate"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Selected certificate details */}
            {selectedCertificate && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Certificate Details</h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSelectedCertificate(null)}
                        ></button>
                    </div>

                    <div className="card-body">
                        <div className="text-center border rounded-3 bg-light p-4 mb-4">
                            <i className="bi bi-award fs-1 text-primary"></i>
                            <h4 className="fw-bold mt-2">
                                Certificate of Completion
                            </h4>

                            <div className="text-muted">
                                {selectedCertificate.certificate_number}
                            </div>

                            <h3 className="fw-bold mt-3">
                                {selectedCertificate.student_name}
                            </h3>

                            <p className="mb-1">has successfully completed</p>

                            <h5 className="text-primary">
                                {selectedCertificate.course_name}
                            </h5>

                            <span
                                className={`badge ${statusClass(selectedCertificate.status)} mt-2`}
                            >
                                {STATUSES[selectedCertificate.status] || selectedCertificate.status}
                            </span>
                        </div>

                        <div className="row g-3">
                            <Detail label="Registration Number" value={selectedCertificate.student_registration_number} />
                            <Detail label="Grade" value={selectedCertificate.grade} />
                            <Detail label="Percentage" value={`${selectedCertificate.percentage}%`} />
                            <Detail label="Completion Date" value={formatDate(selectedCertificate.completion_date)} />
                            <Detail label="Issue Date" value={formatDate(selectedCertificate.issue_date)} />
                            <Detail label="Issued By" value={selectedCertificate.issued_by_name} />
                            <Detail label="Result" value={selectedCertificate.result_status} />
                            <Detail label="Created" value={formatDateTime(selectedCertificate.created_at)} />
                        </div>

                        <div className="mt-3">
                            <strong>Remarks</strong>
                            <p className="text-muted mb-0">
                                {selectedCertificate.remarks || "No remarks"}
                            </p>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => deleteCertificate(selectedCertificate)}
                            >
                                Delete
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => openEditForm(selectedCertificate)}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-lg-5">
                            <label className="form-label">Search</label>

                            <input
                                className="form-control"
                                placeholder="Certificate number, student, course..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4 col-lg-2">
                            <label className="form-label">Status</label>

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>

                                {Object.entries(STATUSES).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="col-md-4 col-lg-2">
                            <label className="form-label">Completion From</label>

                            <input
                                type="date"
                                className="form-control"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4 col-lg-3">
                            <label className="form-label">Completion To</label>

                            <input
                                type="date"
                                className="form-control"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        <div className="col-12 text-end">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certificate register */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="p-4 border-bottom">
                        <h5 className="fw-bold mb-1">Certificate Register</h5>
                        <small className="text-muted">
                            {filteredCertificates.length} certificate(s) found
                        </small>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                            <p className="text-muted mt-3">Loading certificates...</p>
                        </div>
                    ) : filteredCertificates.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-award fs-1 text-primary"></i>
                            <h5 className="mt-3">No certificates found</h5>
                            <p className="text-muted">
                                Create a certificate from a passing result.
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={openCreateForm}
                            >
                                Create Certificate
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-3">#</th>
                                        <th>Certificate Number</th>
                                        <th>Student</th>
                                        <th>Course</th>
                                        <th>Grade</th>
                                        <th>Completion</th>
                                        <th>Status</th>
                                        <th className="text-end px-3">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCertificates.map(
                                        (certificate, index) => (
                                            <tr key={certificate.id}>
                                                <td className="px-3">{index + 1}</td>

                                                <td>
                                                    <strong>
                                                        {certificate.certificate_number}
                                                    </strong>
                                                    <small className="d-block text-muted">
                                                        {certificate.issue_date
                                                            ? `Issued ${formatDate(certificate.issue_date)}`
                                                            : "Not issued"}
                                                    </small>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {certificate.student_name}
                                                    </strong>
                                                    <small className="d-block text-muted">
                                                        {certificate.student_registration_number || "-"}
                                                    </small>
                                                </td>

                                                <td>{certificate.course_name || "-"}</td>

                                                <td>
                                                    <span
                                                        className={`badge ${certificate.grade === "F" ? "bg-danger" : "bg-primary"}`}
                                                    >
                                                        {certificate.grade || "-"}
                                                    </span>
                                                    <small className="d-block text-muted">
                                                        {certificate.percentage}%
                                                    </small>
                                                </td>

                                                <td>{formatDate(certificate.completion_date)}</td>

                                                <td>
                                                    <span
                                                        className={`badge ${statusClass(certificate.status)}`}
                                                    >
                                                        {STATUSES[certificate.status] || certificate.status}
                                                    </span>
                                                </td>

                                                <td className="text-end px-3">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light"
                                                            title="View"
                                                            onClick={() => viewCertificate(certificate.id)}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light"
                                                            title="Edit"
                                                            onClick={() => openEditForm(certificate)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light text-danger"
                                                            title="Delete"
                                                            onClick={() => deleteCertificate(certificate)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div className="col-md-6">
            <div className="p-3 rounded-3 h-100" style={{ background: "#F8FAFC" }}>
                <small className="text-muted d-block mb-1">{label}</small>
                <div className="fw-semibold text-break">{value || "-"}</div>
            </div>
        </div>
    );
}

function getResultLabelForForm(result, exams) {
    const exam = exams.find(
        (item) => String(item.id) === String(result.exam)
    );

    return `${result.exam_title || exam?.title || `Exam #${result.exam}`} — ${
        result.student_name || `Student #${result.student}`
    } (${result.percentage ?? 0}%)`;
}