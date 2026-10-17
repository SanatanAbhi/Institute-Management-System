import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatStatus = (status) => {
    switch (status) {
        case "PRESENT":
            return "Present";

        case "ABSENT":
            return "Absent";

        case "LATE":
            return "Late";

        case "HALF_DAY":
            return "Half Day";

        default:
            return status || "-";
    }
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case "PRESENT":
            return "text-bg-success";

        case "ABSENT":
            return "text-bg-danger";

        case "LATE":
            return "text-bg-warning";

        case "HALF_DAY":
            return "text-bg-info";

        default:
            return "text-bg-secondary";
    }
};

const getStudentName = (student) => {
    const name = `${student?.first_name || ""} ${student?.last_name || ""}`.trim();

    return name || student?.student_name || "Unknown Student";
};

const getStudentBatchName = (student) => {
    return (
        student?.batch_name ||
        student?.batch_detail?.batch_name ||
        student?.batch_name_display ||
        "-"
    );
};

const getStudentBatchId = (student) => {
    return (
        student?.batch ||
        student?.batch_id ||
        student?.batch_detail?.id ||
        null
    );
};

const formatBackendError = (error, fallbackMessage) => {
    if (!error?.response?.data) {
        return fallbackMessage;
    }

    const backendErrors = error.response.data;

    if (typeof backendErrors === "string") {
        return backendErrors;
    }

    if (backendErrors.detail) {
        return backendErrors.detail;
    }

    if (backendErrors.message) {
        return backendErrors.message;
    }

    return Object.entries(backendErrors)
        .map(([field, value]) => {
            const message = Array.isArray(value)
                ? value.join(", ")
                : typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : String(value);

            return `${field}: ${message}`;
        })
        .join(" | ");
};

export default function CenterAttendance() {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);

    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const [formData, setFormData] = useState({
        student: "",
        batch: "",
        date: getToday(),
        status: "PRESENT",
        remarks: "",
    });

    const [editData, setEditData] = useState({
        student: "",
        batch: "",
        date: "",
        status: "PRESENT",
        remarks: "",
    });

    useEffect(() => {
        fetchStudents();
        fetchAttendance();
    }, []);

    useEffect(() => {
        const modalOpen = showViewModal || showEditModal;

        if (modalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [showViewModal, showEditModal]);

    const fetchStudents = async () => {
        try {
            setLoadingStudents(true);

            const response = await api.get("/students/center/");

            setStudents(
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || []
            );
        } catch (err) {
            console.error("Error fetching students:", err);

            setError(
                formatBackendError(
                    err,
                    "Unable to load students."
                )
            );
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoadingAttendance(true);

            const response = await api.get(
                "/attendance/center/"
            );

            setAttendance(
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.results || []
            );
        } catch (err) {
            console.error("Error fetching attendance:", err);

            setError(
                formatBackendError(
                    err,
                    "Unable to load attendance records."
                )
            );
        } finally {
            setLoadingAttendance(false);
        }
    };

    const availableStudents = useMemo(() => {
        return students.filter((student) => {
            const batchId = getStudentBatchId(student);

            const active =
                !student.status ||
                student.status === "ACTIVE";

            return batchId && active;
        });
    }, [students]);

    const selectedStudent = useMemo(() => {
        return students.find(
            (student) =>
                String(student.id) ===
                String(formData.student)
        );
    }, [students, formData.student]);

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            student: "",
            batch: "",
            date: getToday(),
            status: "PRESENT",
            remarks: "",
        });
    };

    const handleStudentChange = (event) => {
        const studentId = event.target.value;

        const student = students.find(
            (item) => String(item.id) === String(studentId)
        );

        setFormData((previous) => ({
            ...previous,
            student: studentId,
            batch: student
                ? getStudentBatchId(student)
                : "",
        }));
    };

    const openAddForm = () => {
        setError("");
        setSuccess("");

        resetForm();

        setShowAddForm(true);
    };

    const closeAddForm = () => {
        if (submitting) {
            return;
        }

        resetForm();

        setShowAddForm(false);
        setError("");
    };

    const handleCreateAttendance = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);

            setError("");
            setSuccess("");

            if (!formData.student) {
                setError("Please select a student.");
                return;
            }

            if (!formData.batch) {
                setError(
                    "Selected student does not have a batch."
                );
                return;
            }

            const payload = {
                student: Number(formData.student),
                batch: Number(formData.batch),
                date: formData.date,
                status: formData.status,
                remarks: formData.remarks.trim(),
            };

            const response = await api.post(
                "/attendance/center/",
                payload
            );

            setSuccess(
                `Attendance for ${response.data.student_name || "student"} marked successfully.`
            );

            resetForm();

            setShowAddForm(false);

            await fetchAttendance();
        } catch (err) {
            console.error(
                "Error creating attendance:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to mark attendance."
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleView = (record) => {
        setError("");
        setSelectedRecord(record);
        setShowViewModal(true);
    };

    const handleEdit = (record) => {
        setError("");
        setSuccess("");

        setSelectedRecord(record);

        setEditData({
            student: record.student
                ? String(record.student)
                : "",

            batch: record.batch
                ? String(record.batch)
                : "",

            date: record.date || "",

            status: record.status || "PRESENT",

            remarks: record.remarks || "",
        });

        setShowEditModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedRecord(null);
    };

    const closeEditModal = () => {
        if (editSubmitting) {
            return;
        }

        setShowEditModal(false);
        setSelectedRecord(null);

        setEditData({
            student: "",
            batch: "",
            date: "",
            status: "PRESENT",
            remarks: "",
        });
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        if (!selectedRecord) {
            return;
        }

        try {
            setEditSubmitting(true);

            setError("");
            setSuccess("");

            const payload = {
                student: Number(editData.student),
                batch: Number(editData.batch),
                date: editData.date,
                status: editData.status,
                remarks: editData.remarks.trim(),
            };

            const response = await api.patch(
                `/attendance/center/${selectedRecord.id}/`,
                payload
            );

            setSuccess(
                `Attendance for ${response.data.student_name || "student"} updated successfully.`
            );

            setShowEditModal(false);
            setSelectedRecord(null);

            await fetchAttendance();
        } catch (err) {
            console.error(
                "Error updating attendance:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to update attendance."
                )
            );
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        const studentName =
            record.student_name || "this student";

        const confirmed = window.confirm(
            `Delete attendance record for ${studentName} on ${record.date}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/attendance/center/${record.id}/`
            );

            setSuccess(
                `Attendance record for ${studentName} deleted successfully.`
            );

            await fetchAttendance();
        } catch (err) {
            console.error(
                "Error deleting attendance:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to delete attendance."
                )
            );
        }
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setDateFilter("");
    };

    const filteredAttendance = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return attendance.filter((record) => {
            const studentName =
                record.student_name || "";

            const registrationNumber =
                record.student_registration_number || "";

            const batchName =
                record.batch_name || "";

            const matchesSearch =
                !searchText ||
                studentName
                    .toLowerCase()
                    .includes(searchText) ||
                registrationNumber
                    .toLowerCase()
                    .includes(searchText) ||
                batchName
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                !statusFilter ||
                record.status === statusFilter;

            const matchesDate =
                !dateFilter ||
                record.date === dateFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDate
            );
        });
    }, [
        attendance,
        search,
        statusFilter,
        dateFilter,
    ]);

    const totalRecords = attendance.length;

    const presentCount = attendance.filter(
        (record) => record.status === "PRESENT"
    ).length;

    const absentCount = attendance.filter(
        (record) => record.status === "ABSENT"
    ).length;

    const lateCount = attendance.filter(
        (record) => record.status === "LATE"
    ).length;

    const halfDayCount = attendance.filter(
        (record) => record.status === "HALF_DAY"
    ).length;

    const attendanceRate =
        totalRecords > 0
            ? (
                  (presentCount / totalRecords) *
                  100
              ).toFixed(1)
            : "0.0";

    return (
        <div
            className="container-fluid py-4"
            style={{
                minHeight: "100vh",
                backgroundColor: "#F8FAFC",
            }}
        >
            {/* ============================== */}
            {/* PAGE HEADER */}
            {/* ============================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Attendance
                    </h2>

                    <p className="text-muted mb-0">
                        Manage student attendance for your center
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={openAddForm}
                >
                    <i className="bi bi-calendar-check me-2"></i>
                    Mark Attendance
                </button>
            </div>

            {/* ============================== */}
            {/* ALERTS */}
            {/* ============================== */}

            {success && (
                <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                >
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
                <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError("")}
                    ></button>
                </div>
            )}

            {/* ============================== */}
            {/* MARK ATTENDANCE FORM */}
            {/* ============================== */}

            {showAddForm && (
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-success text-white rounded-top-4 py-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">
                                <i className="bi bi-calendar-plus me-2"></i>
                                Mark Attendance
                            </h5>

                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={closeAddForm}
                            ></button>
                        </div>
                    </div>

                    <div className="card-body p-4">
                        <form
                            onSubmit={
                                handleCreateAttendance
                            }
                        >
                            <div className="row g-4">
                                {/* Student */}

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        Student
                                    </label>

                                    <select
                                        name="student"
                                        className="form-select"
                                        value={
                                            formData.student
                                        }
                                        onChange={
                                            handleStudentChange
                                        }
                                        required
                                        disabled={
                                            loadingStudents ||
                                            submitting
                                        }
                                    >
                                        <option value="">
                                            {loadingStudents
                                                ? "Loading students..."
                                                : "Select Student"}
                                        </option>

                                        {availableStudents.map(
                                            (student) => (
                                                <option
                                                    key={
                                                        student.id
                                                    }
                                                    value={
                                                        student.id
                                                    }
                                                >
                                                    {getStudentName(
                                                        student
                                                    )}{" "}
                                                    -
                                                    {" "}
                                                    {student.registration_number ||
                                                        "No Registration No."}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    {!loadingStudents &&
                                        availableStudents.length ===
                                            0 && (
                                            <small className="text-danger">
                                                No active students with
                                                assigned batches are
                                                available.
                                            </small>
                                        )}
                                </div>

                                {/* Batch */}

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        Batch
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={
                                            selectedStudent
                                                ? getStudentBatchName(
                                                      selectedStudent
                                                  )
                                                : ""
                                        }
                                        placeholder="Batch will be selected automatically"
                                        readOnly
                                    />

                                    <input
                                        type="hidden"
                                        name="batch"
                                        value={
                                            formData.batch
                                        }
                                    />
                                </div>

                                {/* Date */}

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        Attendance Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        className="form-control"
                                        value={
                                            formData.date
                                        }
                                        max={getToday()}
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                        disabled={
                                            submitting
                                        }
                                    />
                                </div>

                                {/* Status */}

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        className="form-select"
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                        disabled={
                                            submitting
                                        }
                                    >
                                        <option value="PRESENT">
                                            Present
                                        </option>

                                        <option value="ABSENT">
                                            Absent
                                        </option>

                                        <option value="LATE">
                                            Late
                                        </option>

                                        <option value="HALF_DAY">
                                            Half Day
                                        </option>
                                    </select>
                                </div>

                                {/* Remarks */}

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">
                                        Remarks
                                    </label>

                                    <input
                                        type="text"
                                        name="remarks"
                                        className="form-control"
                                        placeholder="Optional remarks"
                                        value={
                                            formData.remarks
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        maxLength={500}
                                        disabled={
                                            submitting
                                        }
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4"
                                    onClick={closeAddForm}
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-success px-4"
                                    disabled={
                                        submitting ||
                                        loadingStudents ||
                                        availableStudents.length ===
                                            0
                                    }
                                >
                                    {submitting ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            Save Attendance
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================== */}
            {/* SUMMARY CARDS */}
            {/* ============================== */}

            <div className="row g-4 mb-4">
                <div className="col-sm-6 col-xl-2">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <small className="text-muted">
                                        Total Records
                                    </small>

                                    <h3 className="fw-bold mb-0 mt-2">
                                        {totalRecords}
                                    </h3>
                                </div>

                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        backgroundColor:
                                            "#DBEAFE",
                                        color: "#2563EB",
                                    }}
                                >
                                    <i className="bi bi-list-check fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-2">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <small className="text-muted">
                                        Present
                                    </small>

                                    <h3 className="fw-bold text-success mb-0 mt-2">
                                        {presentCount}
                                    </h3>
                                </div>

                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        backgroundColor:
                                            "#DCFCE7",
                                        color: "#16A34A",
                                    }}
                                >
                                    <i className="bi bi-check-circle fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-2">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <small className="text-muted">
                                        Absent
                                    </small>

                                    <h3 className="fw-bold text-danger mb-0 mt-2">
                                        {absentCount}
                                    </h3>
                                </div>

                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        backgroundColor:
                                            "#FEE2E2",
                                        color: "#DC2626",
                                    }}
                                >
                                    <i className="bi bi-x-circle fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-2">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <small className="text-muted">
                                        Late
                                    </small>

                                    <h3 className="fw-bold text-warning mb-0 mt-2">
                                        {lateCount}
                                    </h3>
                                </div>

                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        backgroundColor:
                                            "#FEF3C7",
                                        color: "#D97706",
                                    }}
                                >
                                    <i className="bi bi-clock fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-2">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <small className="text-muted">
                                        Half Day
                                    </small>

                                    <h3 className="fw-bold text-info mb-0 mt-2">
                                        {halfDayCount}
                                    </h3>
                                </div>

                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        backgroundColor:
                                            "#CFFAFE",
                                        color: "#0891B2",
                                    }}
                                >
                                    <i className="bi bi-hourglass-split fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-2">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <small className="text-muted">
                                        Present Rate
                                    </small>

                                    <h3 className="fw-bold text-primary mb-0 mt-2">
                                        {attendanceRate}%
                                    </h3>
                                </div>

                                <div
                                    className="rounded-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        backgroundColor:
                                            "#EDE9FE",
                                        color: "#7C3AED",
                                    }}
                                >
                                    <i className="bi bi-graph-up-arrow fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================== */}
            {/* FILTERS */}
            {/* ============================== */}

            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-lg-5">
                            <label className="form-label fw-semibold">
                                Search
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search student, registration number or batch..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-3 col-lg-2">
                            <label className="form-label fw-semibold">
                                Status
                            </label>

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="">
                                    All Status
                                </option>

                                <option value="PRESENT">
                                    Present
                                </option>

                                <option value="ABSENT">
                                    Absent
                                </option>

                                <option value="LATE">
                                    Late
                                </option>

                                <option value="HALF_DAY">
                                    Half Day
                                </option>
                            </select>
                        </div>

                        <div className="col-md-4 col-lg-3">
                            <label className="form-label fw-semibold">
                                Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={dateFilter}
                                onChange={(event) =>
                                    setDateFilter(
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-5 col-lg-2">
                            <button
                                type="button"
                                className="btn btn-light border w-100"
                                onClick={clearFilters}
                            >
                                <i className="bi bi-arrow-counterclockwise me-2"></i>
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================== */}
            {/* ATTENDANCE TABLE */}
            {/* ============================== */}

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-0">
                    <div className="p-4 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold mb-1">
                                    Attendance History
                                </h5>

                                <small className="text-muted">
                                    {filteredAttendance.length}{" "}
                                    record
                                    {filteredAttendance.length !==
                                    1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </small>
                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={openAddForm}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Mark Attendance
                            </button>
                        </div>
                    </div>

                    {loadingAttendance ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-success mb-3"
                                role="status"
                            ></div>

                            <p className="text-muted mb-0">
                                Loading attendance...
                            </p>
                        </div>
                    ) : filteredAttendance.length ===
                      0 ? (
                        <div className="text-center py-5 px-3">
                            <div
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{
                                    width: "72px",
                                    height: "72px",
                                    backgroundColor:
                                        "#F0FDF4",
                                    color: "#16A34A",
                                }}
                            >
                                <i className="bi bi-calendar-x fs-3"></i>
                            </div>

                            <h5 className="fw-bold">
                                No attendance records found
                            </h5>

                            <p className="text-muted mb-3">
                                No records match your current
                                filters.
                            </p>

                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={openAddForm}
                            >
                                Mark Attendance
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4">
                                            Date
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Registration No.
                                        </th>

                                        <th>
                                            Batch
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Remarks
                                        </th>

                                        <th className="text-center">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredAttendance.map(
                                        (record) => (
                                            <tr
                                                key={
                                                    record.id
                                                }
                                            >
                                                <td className="px-4 fw-semibold">
                                                    {record.date}
                                                </td>

                                                <td>
                                                    {
                                                        record.student_name
                                                    }
                                                </td>

                                                <td>
                                                    {record.student_registration_number ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {
                                                        record.batch_name
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge ${getStatusBadgeClass(
                                                            record.status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            record.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className="text-muted"
                                                        style={{
                                                            maxWidth:
                                                                "220px",
                                                            display:
                                                                "inline-block",
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                        title={
                                                            record.remarks ||
                                                            ""
                                                        }
                                                    >
                                                        {record.remarks ||
                                                            "-"}
                                                    </span>
                                                </td>

                                                <td className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success me-2"
                                                        onClick={() =>
                                                            handleView(
                                                                record
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-eye me-1"></i>
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() =>
                                                            handleEdit(
                                                                record
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-pencil me-1"></i>
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                record
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-trash me-1"></i>
                                                        Delete
                                                    </button>
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

            {/* ============================== */}
            {/* VIEW MODAL */}
            {/* ============================== */}

            {showViewModal && selectedRecord && (
                <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                        padding: "20px",
                    }}
                    onClick={closeViewModal}
                >
                    <div
                        className="bg-white rounded-4 shadow w-100"
                        style={{
                            maxWidth: "650px",
                        }}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="modal-header p-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">
                                    Attendance Details
                                </h5>

                                <small className="text-muted">
                                    Attendance record #
                                    {
                                        selectedRecord.id
                                    }
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

                        <div className="modal-body p-4">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <small className="text-muted">
                                        Student
                                    </small>

                                    <div className="fw-semibold mt-1">
                                        {
                                            selectedRecord.student_name
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">
                                        Registration Number
                                    </small>

                                    <div className="fw-semibold mt-1">
                                        {selectedRecord.student_registration_number ||
                                            "-"}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">
                                        Batch
                                    </small>

                                    <div className="fw-semibold mt-1">
                                        {
                                            selectedRecord.batch_name
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">
                                        Date
                                    </small>

                                    <div className="fw-semibold mt-1">
                                        {
                                            selectedRecord.date
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">
                                        Status
                                    </small>

                                    <div className="mt-2">
                                        <span
                                            className={`badge ${getStatusBadgeClass(
                                                selectedRecord.status
                                            )}`}
                                        >
                                            {formatStatus(
                                                selectedRecord.status
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">
                                        Marked By
                                    </small>

                                    <div className="fw-semibold mt-1">
                                        {
                                            selectedRecord.marked_by_name ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-12">
                                    <small className="text-muted">
                                        Remarks
                                    </small>

                                    <div className="mt-1">
                                        {
                                            selectedRecord.remarks ||
                                            "-"
                                        }
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">
                                        Created At
                                    </small>

                                    <div className="mt-1">
                                        {selectedRecord.created_at
                                            ? new Date(
                                                  selectedRecord.created_at
                                              ).toLocaleString()
                                            : "-"}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">
                                        Updated At
                                    </small>

                                    <div className="mt-1">
                                        {selectedRecord.updated_at
                                            ? new Date(
                                                  selectedRecord.updated_at
                                              ).toLocaleString()
                                            : "-"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer p-4 border-top">
                            <button
                                type="button"
                                className="btn btn-secondary px-4"
                                onClick={
                                    closeViewModal
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================== */}
            {/* EDIT MODAL */}
            {/* ============================== */}

            {showEditModal && selectedRecord && (
                <div
                    className="d-flex align-items-start justify-content-center"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                        overflowY: "auto",
                        padding: "20px",
                    }}
                >
                    <div
                        className="bg-white rounded-4 shadow w-100"
                        style={{
                            maxWidth: "800px",
                            marginTop: "20px",
                        }}
                    >
                        <div className="modal-header p-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">
                                    Edit Attendance
                                </h5>

                                <small className="text-muted">
                                    Update attendance record
                                </small>
                            </div>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={
                                    closeEditModal
                                }
                                disabled={
                                    editSubmitting
                                }
                            ></button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Student
                                        </label>

                                        <select
                                            name="student"
                                            className="form-select"
                                            value={
                                                editData.student
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            required
                                            disabled={
                                                editSubmitting
                                            }
                                        >
                                            <option value="">
                                                Select Student
                                            </option>

                                            {students.map(
                                                (
                                                    student
                                                ) => (
                                                    <option
                                                        key={
                                                            student.id
                                                        }
                                                        value={
                                                            student.id
                                                        }
                                                    >
                                                        {getStudentName(
                                                            student
                                                        )}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Batch
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
                                            disabled={
                                                editSubmitting
                                            }
                                        >
                                            <option value="">
                                                Select Batch
                                            </option>

                                            {students
                                                .filter(
                                                    (
                                                        student
                                                    ) =>
                                                        getStudentBatchId(
                                                            student
                                                        )
                                                )
                                                .map(
                                                    (
                                                        student
                                                    ) => (
                                                        <option
                                                            key={`${student.id}-${getStudentBatchId(
                                                                student
                                                            )}`}
                                                            value={getStudentBatchId(
                                                                student
                                                            )}
                                                        >
                                                            {getStudentBatchName(
                                                                student
                                                            )}
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">
                                            Date
                                        </label>

                                        <input
                                            type="date"
                                            name="date"
                                            className="form-control"
                                            value={
                                                editData.date
                                            }
                                            max={getToday()}
                                            onChange={
                                                handleEditChange
                                            }
                                            required
                                            disabled={
                                                editSubmitting
                                            }
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">
                                            Status
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
                                            disabled={
                                                editSubmitting
                                            }
                                        >
                                            <option value="PRESENT">
                                                Present
                                            </option>

                                            <option value="ABSENT">
                                                Absent
                                            </option>

                                            <option value="LATE">
                                                Late
                                            </option>

                                            <option value="HALF_DAY">
                                                Half Day
                                            </option>
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">
                                            Remarks
                                        </label>

                                        <input
                                            type="text"
                                            name="remarks"
                                            className="form-control"
                                            value={
                                                editData.remarks
                                            }
                                            onChange={
                                                handleEditChange
                                            }
                                            maxLength={500}
                                            disabled={
                                                editSubmitting
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer p-4 border-top">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4"
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
                                    className="btn btn-primary px-4"
                                    disabled={
                                        editSubmitting
                                    }
                                >
                                    {editSubmitting ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Saving...
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
        </div>
    );
}