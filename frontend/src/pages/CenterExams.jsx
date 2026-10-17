import { useEffect, useMemo, useState } from "react";
import api from "../services/api";


const initialFormData = {
    batch: "",
    title: "",
    exam_type: "UNIT_TEST",
    exam_date: "",
    start_time: "",
    duration_minutes: "60",
    max_marks: "100",
    pass_marks: "40",
    room: "",
    instructions: "",
    status: "SCHEDULED",
};


const examTypeLabels = {
    UNIT_TEST: "Unit Test",
    MID_TERM: "Mid Term",
    FINAL: "Final",
    PRACTICAL: "Practical",
    MOCK_TEST: "Mock Test",
    OTHER: "Other",
};


const statusLabels = {
    DRAFT: "Draft",
    SCHEDULED: "Scheduled",
    ONGOING: "Ongoing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};


function getStatusClass(status) {

    switch (status) {

        case "DRAFT":
            return "bg-secondary";

        case "SCHEDULED":
            return "bg-primary";

        case "ONGOING":
            return "bg-warning text-dark";

        case "COMPLETED":
            return "bg-success";

        case "CANCELLED":
            return "bg-danger";

        default:
            return "bg-secondary";
    }
}


function getTypeClass(type) {

    switch (type) {

        case "FINAL":
            return "bg-danger";

        case "MID_TERM":
            return "bg-warning text-dark";

        case "PRACTICAL":
            return "bg-info text-dark";

        case "MOCK_TEST":
            return "bg-dark";

        case "UNIT_TEST":
            return "bg-primary";

        default:
            return "bg-secondary";
    }
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function formatTime(timeValue) {

    if (!timeValue) {
        return "-";
    }

    const [hours, minutes] = timeValue.split(":");

    const date = new Date();

    date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
    );

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}


function normalizeBatchName(batch) {

    if (!batch) {
        return "Unknown Batch";
    }

    if (batch.batch_name) {
        return batch.batch_name;
    }

    const code = batch.batch_code || "";
    const name = batch.name || "";

    return (
        `${code}${code && name ? " - " : ""}${name}`.trim() ||
        `Batch #${batch.id}`
    );
}


function formatBackendError(err, fallback) {

    if (!err?.response?.data) {
        return fallback;
    }

    const backendErrors = err.response.data;

    if (typeof backendErrors === "string") {
        return backendErrors;
    }

    if (backendErrors.detail) {
        return backendErrors.detail;
    }

    const messages = Object.entries(
        backendErrors
    )
        .map(([field, value]) => {

            if (Array.isArray(value)) {
                return `${field}: ${value.join(", ")}`;
            }

            if (
                value &&
                typeof value === "object"
            ) {
                return `${field}: ${JSON.stringify(value)}`;
            }

            return `${field}: ${value}`;
        })
        .join(" | ");

    return messages || fallback;
}


export default function CenterExams() {

    const [exams, setExams] = useState([]);
    const [batches, setBatches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedExam, setSelectedExam] = useState(null);

    const [formData, setFormData] = useState({
        ...initialFormData,
    });

    const [editData, setEditData] = useState({
        ...initialFormData,
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [batchFilter, setBatchFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");


    useEffect(() => {

        fetchInitialData();

    }, []);


    useEffect(() => {

        if (
            showAddForm ||
            showViewModal ||
            showEditModal
        ) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };

    }, [
        showAddForm,
        showViewModal,
        showEditModal,
    ]);


    const fetchInitialData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                examsResponse,
                batchesResponse,
            ] = await Promise.all([
                api.get("/exams/center/"),
                api.get("/batches/"),
            ]);

            setExams(
                Array.isArray(examsResponse.data)
                    ? examsResponse.data
                    : []
            );

            setBatches(
                Array.isArray(batchesResponse.data)
                    ? batchesResponse.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error loading exams:",
                err
            );

            setError(
                "Unable to load exams and batches."
            );

        } finally {

            setLoading(false);
        }
    };


    const fetchExams = async () => {

        try {

            const response = await api.get(
                "/exams/center/"
            );

            setExams(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error fetching exams:",
                err
            );

            setError("Unable to load exams.");
        }
    };


    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleEditChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setEditData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const resetForm = () => {

        setFormData({
            ...initialFormData,
        });
    };


    const clearMessages = () => {

        setSuccess("");
        setError("");
    };


    const openAddForm = () => {

        resetForm();
        clearMessages();

        setShowAddForm(true);
    };


    const closeAddForm = () => {

        if (!submitting) {

            setShowAddForm(false);
            resetForm();
        }
    };


    const handleAddExam = async (e) => {

        e.preventDefault();

        try {

            setSubmitting(true);
            clearMessages();

            const payload = {
                batch: Number(formData.batch),
                title: formData.title.trim(),
                exam_type: formData.exam_type,
                exam_date: formData.exam_date,
                start_time: formData.start_time,
                duration_minutes: Number(
                    formData.duration_minutes
                ),
                max_marks: Number(
                    formData.max_marks
                ),
                pass_marks: Number(
                    formData.pass_marks
                ),
                room: formData.room.trim(),
                instructions:
                    formData.instructions.trim(),
                status: formData.status,
            };

            const response = await api.post(
                "/exams/center/",
                payload
            );

            setSuccess(
                `Exam "${response.data.title}" created successfully.`
            );

            setShowAddForm(false);
            resetForm();

            await fetchExams();

        } catch (err) {

            console.error(
                "Error creating exam:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to create exam."
                )
            );

        } finally {

            setSubmitting(false);
        }
    };


    const handleViewExam = async (examId) => {

        try {

            setDetailLoading(true);
            clearMessages();

            const response = await api.get(
                `/exams/center/${examId}/`
            );

            setSelectedExam(response.data);
            setShowViewModal(true);

        } catch (err) {

            console.error(
                "Error loading exam:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to load exam details."
                )
            );

        } finally {

            setDetailLoading(false);
        }
    };


    const handleEditExam = async (examId) => {

        try {

            setDetailLoading(true);
            clearMessages();

            const response = await api.get(
                `/exams/center/${examId}/`
            );

            const exam = response.data;

            setSelectedExam(exam);

            setEditData({
                batch: exam.batch
                    ? String(exam.batch)
                    : "",

                title: exam.title || "",

                exam_type:
                    exam.exam_type || "UNIT_TEST",

                exam_date:
                    exam.exam_date || "",

                start_time:
                    exam.start_time
                        ? exam.start_time.slice(0, 5)
                        : "",

                duration_minutes:
                    exam.duration_minutes ?? 60,

                max_marks:
                    exam.max_marks ?? 100,

                pass_marks:
                    exam.pass_marks ?? 40,

                room:
                    exam.room || "",

                instructions:
                    exam.instructions || "",

                status:
                    exam.status || "SCHEDULED",
            });

            setShowEditModal(true);

        } catch (err) {

            console.error(
                "Error loading exam for editing:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to load exam for editing."
                )
            );

        } finally {

            setDetailLoading(false);
        }
    };


    const handleUpdateExam = async (e) => {

        e.preventDefault();

        if (!selectedExam) {
            return;
        }

        try {

            setEditSubmitting(true);
            clearMessages();

            const payload = {
                batch: Number(editData.batch),
                title: editData.title.trim(),
                exam_type: editData.exam_type,
                exam_date: editData.exam_date,
                start_time: editData.start_time,
                duration_minutes: Number(
                    editData.duration_minutes
                ),
                max_marks: Number(
                    editData.max_marks
                ),
                pass_marks: Number(
                    editData.pass_marks
                ),
                room: editData.room.trim(),
                instructions:
                    editData.instructions.trim(),
                status: editData.status,
            };

            const response = await api.patch(
                `/exams/center/${selectedExam.id}/`,
                payload
            );

            setSelectedExam(response.data);
            setShowEditModal(false);

            setSuccess(
                `Exam "${response.data.title}" updated successfully.`
            );

            await fetchExams();

        } catch (err) {

            console.error(
                "Error updating exam:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to update exam."
                )
            );

        } finally {

            setEditSubmitting(false);
        }
    };


    const handleDeleteExam = async (examId) => {

        const exam = exams.find(
            (item) => item.id === examId
        );

        const examTitle =
            exam?.title || "this exam";

        const confirmed = window.confirm(
            `Are you sure you want to delete "${examTitle}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            clearMessages();

            await api.delete(
                `/exams/center/${examId}/`
            );

            setSuccess(
                `Exam "${examTitle}" deleted successfully.`
            );

            if (
                selectedExam &&
                selectedExam.id === examId
            ) {
                setSelectedExam(null);
                setShowViewModal(false);
                setShowEditModal(false);
            }

            await fetchExams();

        } catch (err) {

            console.error(
                "Error deleting exam:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to delete exam."
                )
            );
        }
    };


    const closeViewModal = () => {

        setShowViewModal(false);
        setSelectedExam(null);
    };


    const closeEditModal = () => {

        if (!editSubmitting) {

            setShowEditModal(false);
            setSelectedExam(null);

            setEditData({
                ...initialFormData,
            });
        }
    };


    const clearFilters = () => {

        setSearch("");
        setStatusFilter("");
        setTypeFilter("");
        setBatchFilter("");
        setDateFrom("");
        setDateTo("");
    };


    const filteredExams = useMemo(() => {

        const searchText = search
            .trim()
            .toLowerCase();

        return [...exams]
            .filter((exam) => {

                const searchableText = [
                    exam.title,
                    exam.batch_name,
                    exam.course_name,
                    exam.room,
                    exam.exam_type,
                    exam.status,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !searchText ||
                    searchableText.includes(
                        searchText
                    );

                const matchesStatus =
                    !statusFilter ||
                    exam.status === statusFilter;

                const matchesType =
                    !typeFilter ||
                    exam.exam_type === typeFilter;

                const matchesBatch =
                    !batchFilter ||
                    String(exam.batch) ===
                        String(batchFilter);

                const matchesFrom =
                    !dateFrom ||
                    exam.exam_date >= dateFrom;

                const matchesTo =
                    !dateTo ||
                    exam.exam_date <= dateTo;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType &&
                    matchesBatch &&
                    matchesFrom &&
                    matchesTo
                );
            })
            .sort((a, b) => {

                const dateComparison =
                    String(
                        b.exam_date || ""
                    ).localeCompare(
                        String(
                            a.exam_date || ""
                        )
                    );

                if (dateComparison !== 0) {
                    return dateComparison;
                }

                return String(
                    b.start_time || ""
                ).localeCompare(
                    String(
                        a.start_time || ""
                    )
                );
            });

    }, [
        exams,
        search,
        statusFilter,
        typeFilter,
        batchFilter,
        dateFrom,
        dateTo,
    ]);


    const summary = useMemo(() => {

        return {
            total: exams.length,

            scheduled: exams.filter(
                (exam) =>
                    exam.status === "SCHEDULED"
            ).length,

            ongoing: exams.filter(
                (exam) =>
                    exam.status === "ONGOING"
            ).length,

            completed: exams.filter(
                (exam) =>
                    exam.status === "COMPLETED"
            ).length,

            cancelled: exams.filter(
                (exam) =>
                    exam.status === "CANCELLED"
            ).length,

            draft: exams.filter(
                (exam) =>
                    exam.status === "DRAFT"
            ).length,
        };

    }, [exams]);


    const getBatchLabel = (batchId) => {

        const batch = batches.find(
            (item) =>
                String(item.id) ===
                String(batchId)
        );

        if (batch) {
            return normalizeBatchName(batch);
        }

        const exam = exams.find(
            (item) =>
                String(item.batch) ===
                String(batchId)
        );

        return (
            exam?.batch_name ||
            `Batch #${batchId}`
        );
    };


    return (
        <>
            <div className="container-fluid py-4">

                {/* PAGE HEADER */}

                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

                    <div>

                        <h2 className="fw-bold mb-1">
                            Exams
                        </h2>

                        <p className="text-muted mb-0">
                            Schedule and manage examinations for your center
                        </p>

                    </div>


                    <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={openAddForm}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Create Exam
                    </button>

                </div>


                {/* MESSAGES */}

                {success && (

                    <div className="alert alert-success alert-dismissible fade show">

                        <i className="bi bi-check-circle me-2"></i>

                        {success}

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccess("")}
                        ></button>

                    </div>
                )}


                {error && (

                    <div className="alert alert-danger alert-dismissible fade show">

                        <i className="bi bi-exclamation-triangle me-2"></i>

                        {error}

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError("")}
                        ></button>

                    </div>
                )}


                {/* SUMMARY */}

                <div className="row g-3 mb-4">

                    <SummaryCard
                        title="Total Exams"
                        value={summary.total}
                        icon="bi-journal-text"
                        background="#DBEAFE"
                        color="#2563EB"
                    />

                    <SummaryCard
                        title="Scheduled"
                        value={summary.scheduled}
                        icon="bi-calendar-event"
                        background="#E0E7FF"
                        color="#4338CA"
                    />

                    <SummaryCard
                        title="Ongoing"
                        value={summary.ongoing}
                        icon="bi-play-circle"
                        background="#FEF3C7"
                        color="#D97706"
                    />

                    <SummaryCard
                        title="Completed"
                        value={summary.completed}
                        icon="bi-check-circle"
                        background="#DCFCE7"
                        color="#16A34A"
                    />

                    <SummaryCard
                        title="Draft"
                        value={summary.draft}
                        icon="bi-file-earmark"
                        background="#F3F4F6"
                        color="#6B7280"
                    />

                    <SummaryCard
                        title="Cancelled"
                        value={summary.cancelled}
                        icon="bi-x-circle"
                        background="#FEE2E2"
                        color="#DC2626"
                    />

                </div>


                {/* FILTERS */}

                <div className="card border-0 shadow-sm rounded-4 mb-4">

                    <div className="card-body p-4">

                        <div className="d-flex justify-content-between align-items-center mb-3">

                            <div>

                                <h5 className="fw-bold mb-1">
                                    Search & Filters
                                </h5>

                                <small className="text-muted">
                                    Find exams quickly
                                </small>

                            </div>


                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={clearFilters}
                            >
                                <i className="bi bi-x-circle me-1"></i>
                                Clear
                            </button>

                        </div>


                        <div className="row g-3">

                            <div className="col-lg-4">

                                <label className="form-label">
                                    Search
                                </label>

                                <div className="input-group">

                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-search"></i>
                                    </span>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Title, batch, course, room..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            <div className="col-md-6 col-lg-2">

                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Status
                                    </option>

                                    {Object.entries(
                                        statusLabels
                                    ).map(
                                        ([
                                            value,
                                            label,
                                        ]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="col-md-6 col-lg-2">

                                <label className="form-label">
                                    Exam Type
                                </label>

                                <select
                                    className="form-select"
                                    value={typeFilter}
                                    onChange={(e) =>
                                        setTypeFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Types
                                    </option>

                                    {Object.entries(
                                        examTypeLabels
                                    ).map(
                                        ([
                                            value,
                                            label,
                                        ]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="col-md-6 col-lg-4">

                                <label className="form-label">
                                    Batch
                                </label>

                                <select
                                    className="form-select"
                                    value={batchFilter}
                                    onChange={(e) =>
                                        setBatchFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Batches
                                    </option>

                                    {batches.map(
                                        (batch) => (
                                            <option
                                                key={batch.id}
                                                value={batch.id}
                                            >
                                                {normalizeBatchName(
                                                    batch
                                                )}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="col-md-6 col-lg-3">

                                <label className="form-label">
                                    From Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="col-md-6 col-lg-3">

                                <label className="form-label">
                                    To Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateTo}
                                    onChange={(e) =>
                                        setDateTo(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* EXAM TABLE */}

                <div className="card border-0 shadow-sm rounded-4">

                    <div className="card-body p-0">

                        <div className="d-flex justify-content-between align-items-center p-4 border-bottom">

                            <div>

                                <h5 className="fw-bold mb-1">
                                    Exam Schedule
                                </h5>

                                <small className="text-muted">
                                    {filteredExams.length} exam
                                    {filteredExams.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </small>

                            </div>

                        </div>


                        {loading ? (

                            <div className="text-center py-5">

                                <div className="spinner-border text-primary"></div>

                                <p className="text-muted mt-3 mb-0">
                                    Loading exams...
                                </p>

                            </div>

                        ) : filteredExams.length === 0 ? (

                            <div className="text-center py-5 px-4">

                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        backgroundColor: "#EFF6FF",
                                    }}
                                >
                                    <i className="bi bi-journal-x fs-2 text-primary"></i>
                                </div>

                                <h5 className="fw-bold">
                                    No exams found
                                </h5>

                                <p className="text-muted mb-3">
                                    Create your first exam or clear the filters.
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={openAddForm}
                                >
                                    <i className="bi bi-plus-lg me-2"></i>
                                    Create Exam
                                </button>

                            </div>

                        ) : (

                            <div className="table-responsive">

                                <table className="table table-hover align-middle mb-0">

                                    <thead className="table-light">

                                        <tr>

                                            <th className="px-4">
                                                #
                                            </th>

                                            <th>
                                                Exam
                                            </th>

                                            <th>
                                                Batch
                                            </th>

                                            <th>
                                                Date & Time
                                            </th>

                                            <th>
                                                Marks
                                            </th>

                                            <th>
                                                Type
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th className="text-end px-4">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredExams.map(
                                            (
                                                exam,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        exam.id
                                                    }
                                                >

                                                    <td className="px-4">
                                                        {index + 1}
                                                    </td>


                                                    <td>

                                                        <div className="fw-semibold">
                                                            {
                                                                exam.title
                                                            }
                                                        </div>

                                                        <small className="text-muted">
                                                            {
                                                                exam.course_name
                                                            }
                                                        </small>

                                                    </td>


                                                    <td>

                                                        <span className="fw-medium">
                                                            {
                                                                exam.batch_name ||
                                                                getBatchLabel(
                                                                    exam.batch
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="fw-semibold">
                                                            {formatDate(
                                                                exam.exam_date
                                                            )}
                                                        </div>

                                                        <small className="text-muted">

                                                            {formatTime(
                                                                exam.start_time
                                                            )}

                                                            {" · "}

                                                            {
                                                                exam.duration_minutes
                                                            }

                                                            {" min"}

                                                        </small>

                                                    </td>


                                                    <td>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    exam.max_marks
                                                                }
                                                            </strong>

                                                            {" max"}
                                                        </div>

                                                        <small className="text-muted">
                                                            Pass:{" "}
                                                            {
                                                                exam.pass_marks
                                                            }
                                                        </small>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`badge ${getTypeClass(
                                                                exam.exam_type
                                                            )}`}
                                                        >
                                                            {
                                                                examTypeLabels[
                                                                    exam.exam_type
                                                                ] ||
                                                                exam.exam_type
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`badge ${getStatusClass(
                                                                exam.status
                                                            )}`}
                                                        >
                                                            {
                                                                statusLabels[
                                                                    exam.status
                                                                ] ||
                                                                exam.status
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="text-end px-4">

                                                        <div className="d-flex justify-content-end gap-2">

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light"
                                                                title="View"
                                                                onClick={() =>
                                                                    handleViewExam(
                                                                        exam.id
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-eye"></i>
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    handleEditExam(
                                                                        exam.id
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light text-danger"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    handleDeleteExam(
                                                                        exam.id
                                                                    )
                                                                }
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


            {/* ADD EXAM MODAL */}

            {showAddForm && (

                <div
                    className="d-flex align-items-start justify-content-center"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                        overflowY: "auto",
                        padding: "20px 15px",
                    }}
                >

                    <div
                        className="card border-0 shadow-lg"
                        style={{
                            width: "100%",
                            maxWidth: "1000px",
                            marginTop: "20px",
                            borderRadius: "18px",
                        }}
                    >

                        <div className="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">

                            <div>

                                <h5 className="mb-1">
                                    Create New Exam
                                </h5>

                                <small className="opacity-75">
                                    Schedule an examination for a batch
                                </small>

                            </div>


                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={closeAddForm}
                                disabled={submitting}
                            ></button>

                        </div>


                        <form onSubmit={handleAddExam}>

                            <div className="card-body p-4">

                                <div className="row g-3">

                                    <div className="col-md-8">

                                        <label className="form-label">
                                            Exam Title *
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            className="form-control"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Python Full Stack Unit Test 1"
                                            required
                                            maxLength={150}
                                        />

                                    </div>


                                    <div className="col-md-4">

                                        <label className="form-label">
                                            Batch *
                                        </label>

                                        <select
                                            name="batch"
                                            className="form-select"
                                            value={formData.batch}
                                            onChange={handleChange}
                                            required
                                        >

                                            <option value="">
                                                Select Batch
                                            </option>

                                            {batches.map(
                                                (batch) => (
                                                    <option
                                                        key={
                                                            batch.id
                                                        }
                                                        value={
                                                            batch.id
                                                        }
                                                    >
                                                        {
                                                            normalizeBatchName(
                                                                batch
                                                            )
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="col-md-4">

                                        <label className="form-label">
                                            Exam Type *
                                        </label>

                                        <select
                                            name="exam_type"
                                            className="form-select"
                                            value={formData.exam_type}
                                            onChange={handleChange}
                                            required
                                        >

                                            {Object.entries(
                                                examTypeLabels
                                            ).map(
                                                ([
                                                    value,
                                                    label,
                                                ]) => (
                                                    <option
                                                        key={
                                                            value
                                                        }
                                                        value={
                                                            value
                                                        }
                                                    >
                                                        {
                                                            label
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="col-md-4">

                                        <label className="form-label">
                                            Exam Date *
                                        </label>

                                        <input
                                            type="date"
                                            name="exam_date"
                                            className="form-control"
                                            value={formData.exam_date}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>


                                    <div className="col-md-4">

                                        <label className="form-label">
                                            Start Time *
                                        </label>

                                        <input
                                            type="time"
                                            name="start_time"
                                            className="form-control"
                                            value={formData.start_time}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>


                                    <div className="col-md-4">

                                        <label className="form-label">
                                            Duration (minutes) *
                                        </label>

                                        <input
                                            type="number"
                                            name="duration_minutes"
                                            className="form-control"
                                            value={
                                                formData.duration_minutes
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="1"
                                            required
                                        />

                                    </div>


                                    <div className="col-md-4">

                                        <label className="form-label">
                                            Maximum Marks *
                                        </label>

                                        <input
                                            type="number"
                                            name="max_marks"
                                            className="form-control"
                                            value={
                                                formData.max_marks
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="1"
                                            step="0.01"
                                            required
                                        />

                                    </div>


                                    <div className="col-md-4">

                                        <label className="form-label">
                                            Pass Marks *
                                        </label>

                                        <input
                                            type="number"
                                            name="pass_marks"
                                            className="form-control"
                                            value={
                                                formData.pass_marks
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            step="0.01"
                                            required
                                        />

                                    </div>


                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Room / Lab
                                        </label>

                                        <input
                                            type="text"
                                            name="room"
                                            className="form-control"
                                            value={
                                                formData.room
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. Lab 1"
                                            maxLength={100}
                                        />

                                    </div>


                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Status *
                                        </label>

                                        <select
                                            name="status"
                                            className="form-select"
                                            value={
                                                formData.status
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            {Object.entries(
                                                statusLabels
                                            ).map(
                                                ([
                                                    value,
                                                    label,
                                                ]) => (
                                                    <option
                                                        key={
                                                            value
                                                        }
                                                        value={
                                                            value
                                                        }
                                                    >
                                                        {
                                                            label
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="col-12">

                                        <label className="form-label">
                                            Instructions
                                        </label>

                                        <textarea
                                            name="instructions"
                                            className="form-control"
                                            rows="4"
                                            value={
                                                formData.instructions
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter instructions for students..."
                                        ></textarea>

                                    </div>

                                </div>

                            </div>


                            <div className="card-footer bg-white p-4 d-flex justify-content-end gap-2">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={closeAddForm}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >

                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            Create Exam
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* VIEW MODAL */}

            {showViewModal &&
                selectedExam && (

                    <div
                        className="d-flex align-items-start justify-content-center"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 1055,
                            backgroundColor:
                                "rgba(0,0,0,0.5)",
                            overflowY: "auto",
                            padding: "20px 15px",
                        }}
                    >

                        <div
                            className="card border-0 shadow-lg"
                            style={{
                                width: "100%",
                                maxWidth: "900px",
                                marginTop: "20px",
                                borderRadius: "18px",
                            }}
                        >

                            <div className="card-header p-4 bg-light d-flex justify-content-between align-items-center">

                                <div>

                                    <h5 className="fw-bold mb-1">
                                        Exam Details
                                    </h5>

                                    <small className="text-muted">
                                        Complete examination information
                                    </small>

                                </div>


                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={
                                        closeViewModal
                                    }
                                ></button>

                            </div>


                            <div className="card-body p-4">

                                {detailLoading ? (

                                    <div className="text-center py-5">

                                        <div className="spinner-border text-primary"></div>

                                        <p className="text-muted mt-3 mb-0">
                                            Loading exam details...
                                        </p>

                                    </div>

                                ) : (

                                    <>

                                        <div className="d-flex flex-wrap gap-2 mb-4">

                                            <span
                                                className={`badge ${getTypeClass(
                                                    selectedExam.exam_type
                                                )} p-2`}
                                            >
                                                {
                                                    examTypeLabels[
                                                        selectedExam.exam_type
                                                    ] ||
                                                    selectedExam.exam_type
                                                }
                                            </span>


                                            <span
                                                className={`badge ${getStatusClass(
                                                    selectedExam.status
                                                )} p-2`}
                                            >
                                                {
                                                    statusLabels[
                                                        selectedExam.status
                                                    ] ||
                                                    selectedExam.status
                                                }
                                            </span>

                                        </div>


                                        <h3 className="fw-bold mb-4">
                                            {
                                                selectedExam.title
                                            }
                                        </h3>


                                        <div className="row g-4">

                                            <DetailItem
                                                label="Center"
                                                value={
                                                    selectedExam.center_name
                                                }
                                            />

                                            <DetailItem
                                                label="Course"
                                                value={
                                                    selectedExam.course_name ||
                                                    "-"
                                                }
                                            />

                                            <DetailItem
                                                label="Batch"
                                                value={
                                                    selectedExam.batch_name ||
                                                    getBatchLabel(
                                                        selectedExam.batch
                                                    )
                                                }
                                            />

                                            <DetailItem
                                                label="Exam Date"
                                                value={formatDate(
                                                    selectedExam.exam_date
                                                )}
                                            />

                                            <DetailItem
                                                label="Start Time"
                                                value={formatTime(
                                                    selectedExam.start_time
                                                )}
                                            />

                                            <DetailItem
                                                label="Duration"
                                                value={`${selectedExam.duration_minutes} minutes`}
                                            />

                                            <DetailItem
                                                label="Maximum Marks"
                                                value={
                                                    selectedExam.max_marks
                                                }
                                            />

                                            <DetailItem
                                                label="Pass Marks"
                                                value={
                                                    selectedExam.pass_marks
                                                }
                                            />

                                            <DetailItem
                                                label="Room / Lab"
                                                value={
                                                    selectedExam.room ||
                                                    "-"
                                                }
                                            />

                                            <DetailItem
                                                label="Created By"
                                                value={
                                                    selectedExam.created_by_name ||
                                                    "-"
                                                }
                                            />

                                        </div>


                                        <hr className="my-4" />


                                        <div>

                                            <h6 className="fw-bold">
                                                Instructions
                                            </h6>

                                            <div
                                                className="p-3 rounded-3"
                                                style={{
                                                    backgroundColor:
                                                        "#F8FAFC",
                                                    whiteSpace:
                                                        "pre-wrap",
                                                }}
                                            >
                                                {
                                                    selectedExam.instructions ||
                                                    "No instructions provided."
                                                }
                                            </div>

                                        </div>


                                        <div className="row g-3 mt-3">

                                            <div className="col-md-6">

                                                <small className="text-muted">
                                                    Created
                                                </small>

                                                <div className="fw-medium">
                                                    {selectedExam.created_at
                                                        ? new Date(
                                                            selectedExam.created_at
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                        : "-"}
                                                </div>

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted">
                                                    Last Updated
                                                </small>

                                                <div className="fw-medium">
                                                    {selectedExam.updated_at
                                                        ? new Date(
                                                            selectedExam.updated_at
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                        : "-"}
                                                </div>

                                            </div>

                                        </div>

                                    </>
                                )}

                            </div>


                            <div className="card-footer bg-white p-4 d-flex justify-content-between">

                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() =>
                                        handleDeleteExam(
                                            selectedExam.id
                                        )
                                    }
                                >
                                    <i className="bi bi-trash me-2"></i>
                                    Delete
                                </button>


                                <div className="d-flex gap-2">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={
                                            closeViewModal
                                        }
                                    >
                                        Close
                                    </button>


                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() =>
                                            handleEditExam(
                                                selectedExam.id
                                            )
                                        }
                                    >
                                        <i className="bi bi-pencil me-2"></i>
                                        Edit
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}


            {/* EDIT MODAL */}

            {showEditModal &&
                selectedExam && (

                    <div
                        className="d-flex align-items-start justify-content-center"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 1055,
                            backgroundColor:
                                "rgba(0,0,0,0.5)",
                            overflowY: "auto",
                            padding: "20px 15px",
                        }}
                    >

                        <div
                            className="card border-0 shadow-lg"
                            style={{
                                width: "100%",
                                maxWidth: "1000px",
                                marginTop: "20px",
                                borderRadius: "18px",
                            }}
                        >

                            <div className="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">

                                <div>

                                    <h5 className="mb-1">
                                        Edit Exam
                                    </h5>

                                    <small className="opacity-75">
                                        Update examination information
                                    </small>

                                </div>


                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={
                                        closeEditModal
                                    }
                                    disabled={
                                        editSubmitting
                                    }
                                ></button>

                            </div>


                            <form
                                onSubmit={
                                    handleUpdateExam
                                }
                            >

                                <div className="card-body p-4">

                                    <div className="row g-3">

                                        <div className="col-md-8">

                                            <label className="form-label">
                                                Exam Title *
                                            </label>

                                            <input
                                                type="text"
                                                name="title"
                                                className="form-control"
                                                value={
                                                    editData.title
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                                maxLength={
                                                    150
                                                }
                                            />

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Batch *
                                            </label>

                                            <select
                                                name="batch"
                                                className="form-select"
                                                value={
                                                    editData.batch
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Batch
                                                </option>

                                                {batches.map(
                                                    (batch) => (
                                                        <option
                                                            key={
                                                                batch.id
                                                            }
                                                            value={
                                                                batch.id
                                                            }
                                                        >
                                                            {
                                                                normalizeBatchName(
                                                                    batch
                                                                )
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Exam Type *
                                            </label>

                                            <select
                                                name="exam_type"
                                                className="form-select"
                                                value={
                                                    editData.exam_type
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            >

                                                {Object.entries(
                                                    examTypeLabels
                                                ).map(
                                                    ([
                                                        value,
                                                        label,
                                                    ]) => (
                                                        <option
                                                            key={
                                                                value
                                                            }
                                                            value={
                                                                value
                                                            }
                                                        >
                                                            {
                                                                label
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Exam Date *
                                            </label>

                                            <input
                                                type="date"
                                                name="exam_date"
                                                className="form-control"
                                                value={
                                                    editData.exam_date
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Start Time *
                                            </label>

                                            <input
                                                type="time"
                                                name="start_time"
                                                className="form-control"
                                                value={
                                                    editData.start_time
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Duration (minutes) *
                                            </label>

                                            <input
                                                type="number"
                                                name="duration_minutes"
                                                className="form-control"
                                                value={
                                                    editData.duration_minutes
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                min="1"
                                                required
                                            />

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Maximum Marks *
                                            </label>

                                            <input
                                                type="number"
                                                name="max_marks"
                                                className="form-control"
                                                value={
                                                    editData.max_marks
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                min="1"
                                                step="0.01"
                                                required
                                            />

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Pass Marks *
                                            </label>

                                            <input
                                                type="number"
                                                name="pass_marks"
                                                className="form-control"
                                                value={
                                                    editData.pass_marks
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                min="0"
                                                step="0.01"
                                                required
                                            />

                                        </div>


                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Room / Lab
                                            </label>

                                            <input
                                                type="text"
                                                name="room"
                                                className="form-control"
                                                value={
                                                    editData.room
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                maxLength={
                                                    100
                                                }
                                            />

                                        </div>


                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Status *
                                            </label>

                                            <select
                                                name="status"
                                                className="form-select"
                                                value={
                                                    editData.status
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            >

                                                {Object.entries(
                                                    statusLabels
                                                ).map(
                                                    ([
                                                        value,
                                                        label,
                                                    ]) => (
                                                        <option
                                                            key={
                                                                value
                                                            }
                                                            value={
                                                                value
                                                            }
                                                        >
                                                            {
                                                                label
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="col-12">

                                            <label className="form-label">
                                                Instructions
                                            </label>

                                            <textarea
                                                name="instructions"
                                                className="form-control"
                                                rows="4"
                                                value={
                                                    editData.instructions
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            ></textarea>

                                        </div>

                                    </div>

                                </div>


                                <div className="card-footer bg-white p-4 d-flex justify-content-end gap-2">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={
                                            closeEditModal
                                        }
                                        disabled={
                                            editSubmitting
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            editSubmitting
                                        }
                                    >

                                        {editSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-save me-2"></i>
                                                Save Changes
                                            </>
                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

        </>
    );
}


function SummaryCard({
    title,
    value,
    icon,
    background,
    color,
}) {

    return (

        <div className="col-6 col-md-4 col-xl-2">

            <div className="card border-0 shadow-sm rounded-4 h-100">

                <div className="card-body p-3">

                    <div className="d-flex justify-content-between align-items-start gap-2">

                        <div>

                            <p
                                className="text-muted mb-1"
                                style={{
                                    fontSize: "13px",
                                }}
                            >
                                {title}
                            </p>

                            <h4 className="fw-bold mb-0">
                                {value}
                            </h4>

                        </div>


                        <div
                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                            style={{
                                width: "42px",
                                height: "42px",
                                backgroundColor:
                                    background,
                                color,
                            }}
                        >
                            <i
                                className={`bi ${icon}`}
                            ></i>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


function DetailItem({
    label,
    value,
}) {

    return (

        <div className="col-md-6">

            <div
                className="rounded-3 p-3 h-100"
                style={{
                    backgroundColor: "#F8FAFC",
                }}
            >

                <small className="text-muted d-block mb-1">
                    {label}
                </small>

                <div className="fw-semibold">
                    {value || "-"}
                </div>

            </div>

        </div>
    );
}