import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";


const initialFormData = {
    exam: "",
    student: "",
    marks_obtained: "",
    attendance_status: "PRESENT",
    remarks: "",
};


const attendanceLabels = {
    PRESENT: "Present",
    ABSENT: "Absent",
    EXCUSED: "Excused",
};


const resultStatusLabels = {
    PASS: "Pass",
    FAIL: "Fail",
    ABSENT: "Absent",
};


const gradeLabels = {
    "A+": "A+",
    A: "A",
    "B+": "B+",
    B: "B",
    C: "C",
    D: "D",
    F: "F",
};


function getResultStatusClass(status) {

    switch (status) {

        case "PASS":
            return "bg-success";

        case "FAIL":
            return "bg-danger";

        case "ABSENT":
            return "bg-secondary";

        default:
            return "bg-secondary";
    }
}


function getGradeClass(grade) {

    switch (grade) {

        case "A+":
        case "A":
            return "bg-success";

        case "B+":
        case "B":
            return "bg-primary";

        case "C":
            return "bg-warning text-dark";

        case "D":
            return "bg-orange text-white";

        case "F":
            return "bg-danger";

        default:
            return "bg-secondary";
    }
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(
        `${dateValue}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


function formatNumber(value) {

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "-";
    }

    return number.toFixed(2).replace(
        /\.00$/,
        ""
    );
}


function formatBackendError(err, fallback) {

    if (!err?.response?.data) {
        return fallback;
    }

    const backendErrors =
        err.response.data;

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


function getStudentName(student) {

    if (!student) {
        return "Unknown Student";
    }

    const fullName = (
        `${student.first_name || ""} ` +
        `${student.last_name || ""}`
    ).trim();

    return (
        fullName ||
        student.name ||
        student.username ||
        `Student #${student.id}`
    );
}


function getStudentRegistration(student) {

    return (
        student?.registration_number ||
        student?.registration ||
        "-"
    );
}


function getExamLabel(exam) {

    if (!exam) {
        return "Unknown Exam";
    }

    return (
        exam.title ||
        exam.exam_title ||
        `Exam #${exam.id}`
    );
}


export default function CenterResults() {

    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);
    const [editSubmitting, setEditSubmitting] =
        useState(false);

    const [showAddForm, setShowAddForm] =
        useState(false);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [selectedResult, setSelectedResult] =
        useState(null);

    const [formData, setFormData] =
        useState({
            ...initialFormData,
        });

    const [editData, setEditData] =
        useState({
            ...initialFormData,
        });

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("");

    const [gradeFilter, setGradeFilter] =
        useState("");

    const [examFilter, setExamFilter] =
        useState("");

    const [attendanceFilter, setAttendanceFilter] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [error, setError] =
        useState("");


    useEffect(() => {

        fetchInitialData();

    }, []);


    useEffect(() => {

        if (
            showAddForm ||
            showViewModal ||
            showEditModal
        ) {
            document.body.style.overflow =
                "hidden";
        } else {
            document.body.style.overflow =
                "";
        }

        return () => {
            document.body.style.overflow =
                "";
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
                resultsResponse,
                examsResponse,
                studentsResponse,
            ] = await Promise.all([
                api.get("/results/center/"),
                api.get("/exams/center/"),
                api.get("/students/center/"),
            ]);

            setResults(
                Array.isArray(resultsResponse.data)
                    ? resultsResponse.data
                    : []
            );

            setExams(
                Array.isArray(examsResponse.data)
                    ? examsResponse.data
                    : []
            );

            setStudents(
                Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error loading results data:",
                err
            );

            setError(
                "Unable to load results, exams and students."
            );

        } finally {

            setLoading(false);
        }
    };


    const fetchResults = async () => {

        try {

            const response = await api.get(
                "/results/center/"
            );

            setResults(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error fetching results:",
                err
            );

            setError(
                "Unable to load results."
            );
        }
    };


    const clearMessages = () => {

        setSuccess("");
        setError("");
    };


    const resetForm = () => {

        setFormData({
            ...initialFormData,
        });
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


    const getExamById = (examId) => {

        return exams.find(
            (exam) =>
                String(exam.id) ===
                String(examId)
        );
    };


    const getStudentById = (studentId) => {

        return students.find(
            (student) =>
                String(student.id) ===
                String(studentId)
        );
    };


    const getEligibleStudents = (
        examId,
        existingResultId = null
    ) => {

        const exam =
            getExamById(examId);

        if (!exam) {
            return [];
        }

        const eligible = students.filter(
            (student) => {

                if (
                    student.batch === undefined ||
                    student.batch === null
                ) {
                    return true;
                }

                if (exam.batch === undefined) {
                    return true;
                }

                return (
                    String(student.batch) ===
                    String(exam.batch)
                );
            }
        );

        return eligible;
    };


    const handleAddResult = async (e) => {

        e.preventDefault();

        try {

            setSubmitting(true);
            clearMessages();

            const payload = {
                exam: Number(formData.exam),
                student: Number(formData.student),
                marks_obtained: Number(
                    formData.marks_obtained
                ),
                attendance_status:
                    formData.attendance_status,
                remarks:
                    formData.remarks.trim(),
            };

            const response = await api.post(
                "/results/center/",
                payload
            );

            setSuccess(
                `Result for ${response.data.student_name} created successfully.`
            );

            setShowAddForm(false);
            resetForm();

            await fetchResults();

        } catch (err) {

            console.error(
                "Error creating result:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to create result."
                )
            );

        } finally {

            setSubmitting(false);
        }
    };


    const handleViewResult = async (
        resultId
    ) => {

        try {

            setDetailLoading(true);
            clearMessages();

            const response = await api.get(
                `/results/center/${resultId}/`
            );

            setSelectedResult(
                response.data
            );

            setShowViewModal(true);

        } catch (err) {

            console.error(
                "Error loading result:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to load result details."
                )
            );

        } finally {

            setDetailLoading(false);
        }
    };


    const handleEditResult = async (
        resultId
    ) => {

        try {

            setDetailLoading(true);
            clearMessages();

            const response = await api.get(
                `/results/center/${resultId}/`
            );

            const result =
                response.data;

            setSelectedResult(result);

            setEditData({
                exam: result.exam
                    ? String(result.exam)
                    : "",

                student: result.student
                    ? String(result.student)
                    : "",

                marks_obtained:
                    result.marks_obtained ??
                    "",

                attendance_status:
                    result.attendance_status ||
                    "PRESENT",

                remarks:
                    result.remarks || "",
            });

            setShowEditModal(true);

        } catch (err) {

            console.error(
                "Error loading result for editing:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to load result for editing."
                )
            );

        } finally {

            setDetailLoading(false);
        }
    };


    const handleUpdateResult = async (e) => {

        e.preventDefault();

        if (!selectedResult) {
            return;
        }

        try {

            setEditSubmitting(true);
            clearMessages();

            const payload = {
                exam: Number(
                    editData.exam
                ),

                student: Number(
                    editData.student
                ),

                marks_obtained:
                    Number(
                        editData.marks_obtained
                    ),

                attendance_status:
                    editData.attendance_status,

                remarks:
                    editData.remarks.trim(),
            };

            const response = await api.patch(
                `/results/center/${selectedResult.id}/`,
                payload
            );

            setSelectedResult(
                response.data
            );

            setShowEditModal(false);

            setSuccess(
                `Result for ${response.data.student_name} updated successfully.`
            );

            await fetchResults();

        } catch (err) {

            console.error(
                "Error updating result:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to update result."
                )
            );

        } finally {

            setEditSubmitting(false);
        }
    };


    const handleDeleteResult = async (
        resultId
    ) => {

        const result =
            results.find(
                (item) =>
                    item.id === resultId
            );

        const studentName =
            result?.student_name ||
            "this student";

        const confirmed =
            window.confirm(
                `Are you sure you want to delete the result of ${studentName}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            clearMessages();

            await api.delete(
                `/results/center/${resultId}/`
            );

            setSuccess(
                `Result of ${studentName} deleted successfully.`
            );

            if (
                selectedResult &&
                selectedResult.id === resultId
            ) {
                setSelectedResult(null);
                setShowViewModal(false);
                setShowEditModal(false);
            }

            await fetchResults();

        } catch (err) {

            console.error(
                "Error deleting result:",
                err
            );

            setError(
                formatBackendError(
                    err,
                    "Unable to delete result."
                )
            );
        }
    };


    const closeViewModal = () => {

        setShowViewModal(false);
        setSelectedResult(null);
    };


    const closeEditModal = () => {

        if (!editSubmitting) {

            setShowEditModal(false);
            setSelectedResult(null);

            setEditData({
                ...initialFormData,
            });
        }
    };


    const clearFilters = () => {

        setSearch("");
        setStatusFilter("");
        setGradeFilter("");
        setExamFilter("");
        setAttendanceFilter("");
    };


    const filteredResults = useMemo(() => {

        const searchText =
            search
                .trim()
                .toLowerCase();

        return [...results]
            .filter((result) => {

                const searchableText = [
                    result.student_name,
                    result.student_registration_number,
                    result.exam_title,
                    result.batch_name,
                    result.course_name,
                    result.grade,
                    result.result_status,
                    result.attendance_status,
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
                    result.result_status ===
                        statusFilter;

                const matchesGrade =
                    !gradeFilter ||
                    result.grade ===
                        gradeFilter;

                const matchesExam =
                    !examFilter ||
                    String(result.exam) ===
                        String(examFilter);

                const matchesAttendance =
                    !attendanceFilter ||
                    result.attendance_status ===
                        attendanceFilter;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesGrade &&
                    matchesExam &&
                    matchesAttendance
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

                if (
                    dateComparison !== 0
                ) {
                    return dateComparison;
                }

                return String(
                    a.student_name || ""
                ).localeCompare(
                    String(
                        b.student_name || ""
                    )
                );
            });

    }, [
        results,
        search,
        statusFilter,
        gradeFilter,
        examFilter,
        attendanceFilter,
    ]);


    const summary =
        useMemo(() => {

            const total =
                results.length;

            const pass =
                results.filter(
                    (result) =>
                        result.result_status ===
                        "PASS"
                ).length;

            const fail =
                results.filter(
                    (result) =>
                        result.result_status ===
                        "FAIL"
                ).length;

            const absent =
                results.filter(
                    (result) =>
                        result.result_status ===
                        "ABSENT"
                ).length;

            const present =
                results.filter(
                    (result) =>
                        result.attendance_status ===
                        "PRESENT"
                ).length;

            const passRate =
                present > 0
                    ? (
                        (pass / present) *
                        100
                    ).toFixed(1)
                    : "0.0";

            return {
                total,
                pass,
                fail,
                absent,
                present,
                passRate,
            };

        }, [results]);


    const selectedExamForAdd =
        getExamById(
            formData.exam
        );

    const addEligibleStudents =
        getEligibleStudents(
            formData.exam
        );


    const selectedExamForEdit =
        getExamById(
            editData.exam
        );

    const editEligibleStudents =
        getEligibleStudents(
            editData.exam,
            selectedResult?.id
        );


    return (
        <>
            <div className="container-fluid py-4">

                {/* PAGE HEADER */}

                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

                    <div>

                        <div className="mb-2">

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                    navigate(
                                        "/center-dashboard"
                                    )
                                }
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Dashboard
                            </button>

                        </div>

                        <h2 className="fw-bold mb-1">
                            Results
                        </h2>

                        <p className="text-muted mb-0">
                            Manage student examination results
                        </p>

                    </div>


                    <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={
                            openAddForm
                        }
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Result
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
                            onClick={() =>
                                setSuccess("")
                            }
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
                            onClick={() =>
                                setError("")
                            }
                        ></button>

                    </div>
                )}


                {/* SUMMARY */}

                <div className="row g-3 mb-4">

                    <SummaryCard
                        title="Total Results"
                        value={summary.total}
                        icon="bi-journal-text"
                        background="#DBEAFE"
                        color="#2563EB"
                    />

                    <SummaryCard
                        title="Passed"
                        value={summary.pass}
                        icon="bi-check-circle"
                        background="#DCFCE7"
                        color="#16A34A"
                    />

                    <SummaryCard
                        title="Failed"
                        value={summary.fail}
                        icon="bi-x-circle"
                        background="#FEE2E2"
                        color="#DC2626"
                    />

                    <SummaryCard
                        title="Absent"
                        value={summary.absent}
                        icon="bi-person-x"
                        background="#F3F4F6"
                        color="#6B7280"
                    />

                    <SummaryCard
                        title="Present"
                        value={summary.present}
                        icon="bi-person-check"
                        background="#E0E7FF"
                        color="#4338CA"
                    />

                    <SummaryCard
                        title="Pass Rate"
                        value={`${summary.passRate}%`}
                        icon="bi-graph-up-arrow"
                        background="#FEF3C7"
                        color="#D97706"
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
                                    Find student results quickly
                                </small>

                            </div>


                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={
                                    clearFilters
                                }
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
                                        placeholder="Student, registration, exam, course..."
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
                                    Result Status
                                </label>

                                <select
                                    className="form-select"
                                    value={
                                        statusFilter
                                    }
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
                                        resultStatusLabels
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


                            <div className="col-md-6 col-lg-2">

                                <label className="form-label">
                                    Grade
                                </label>

                                <select
                                    className="form-select"
                                    value={
                                        gradeFilter
                                    }
                                    onChange={(e) =>
                                        setGradeFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Grades
                                    </option>

                                    {Object.entries(
                                        gradeLabels
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


                            <div className="col-md-6 col-lg-4">

                                <label className="form-label">
                                    Exam
                                </label>

                                <select
                                    className="form-select"
                                    value={
                                        examFilter
                                    }
                                    onChange={(e) =>
                                        setExamFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Exams
                                    </option>

                                    {exams.map(
                                        (exam) => (
                                            <option
                                                key={
                                                    exam.id
                                                }
                                                value={
                                                    exam.id
                                                }
                                            >
                                                {
                                                    getExamLabel(
                                                        exam
                                                    )
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            <div className="col-md-6 col-lg-3">

                                <label className="form-label">
                                    Attendance
                                </label>

                                <select
                                    className="form-select"
                                    value={
                                        attendanceFilter
                                    }
                                    onChange={(e) =>
                                        setAttendanceFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Attendance
                                    </option>

                                    {Object.entries(
                                        attendanceLabels
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

                        </div>

                    </div>

                </div>


                {/* RESULTS TABLE */}

                <div className="card border-0 shadow-sm rounded-4">

                    <div className="card-body p-0">

                        <div className="d-flex justify-content-between align-items-center p-4 border-bottom">

                            <div>

                                <h5 className="fw-bold mb-1">
                                    Student Results
                                </h5>

                                <small className="text-muted">
                                    {filteredResults.length} result
                                    {filteredResults.length !== 1
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
                                    Loading results...
                                </p>

                            </div>

                        ) : filteredResults.length === 0 ? (

                            <div className="text-center py-5 px-4">

                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        backgroundColor:
                                            "#EFF6FF",
                                    }}
                                >
                                    <i className="bi bi-journal-x fs-2 text-primary"></i>
                                </div>

                                <h5 className="fw-bold">
                                    No results found
                                </h5>

                                <p className="text-muted mb-3">
                                    Add a result or clear the filters.
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={
                                        openAddForm
                                    }
                                >
                                    <i className="bi bi-plus-lg me-2"></i>
                                    Add Result
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
                                                Student
                                            </th>

                                            <th>
                                                Exam
                                            </th>

                                            <th>
                                                Marks
                                            </th>

                                            <th>
                                                %
                                            </th>

                                            <th>
                                                Grade
                                            </th>

                                            <th>
                                                Attendance
                                            </th>

                                            <th>
                                                Result
                                            </th>

                                            <th className="text-end px-4">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredResults.map(
                                            (
                                                result,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        result.id
                                                    }
                                                >

                                                    <td className="px-4">
                                                        {
                                                            index + 1
                                                        }
                                                    </td>


                                                    <td>

                                                        <div className="fw-semibold">
                                                            {
                                                                result.student_name
                                                            }
                                                        </div>

                                                        <small className="text-muted">
                                                            {
                                                                result.student_registration_number ||
                                                                "-"
                                                            }
                                                        </small>

                                                    </td>


                                                    <td>

                                                        <div className="fw-semibold">
                                                            {
                                                                result.exam_title
                                                            }
                                                        </div>

                                                        <small className="text-muted">
                                                            {
                                                                result.course_name ||
                                                                "-"
                                                            }
                                                        </small>

                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                formatNumber(
                                                                    result.marks_obtained
                                                                )
                                                            }
                                                        </strong>

                                                        {" / "}

                                                        {
                                                            formatNumber(
                                                                result.max_marks
                                                            )
                                                        }

                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                formatNumber(
                                                                    result.percentage
                                                                )
                                                            }
                                                            %
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`badge ${getGradeClass(
                                                                result.grade
                                                            )}`}
                                                        >
                                                            {
                                                                result.grade ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`badge ${
                                                                result.attendance_status ===
                                                                "PRESENT"
                                                                    ? "bg-success"
                                                                    : result.attendance_status ===
                                                                      "ABSENT"
                                                                    ? "bg-secondary"
                                                                    : "bg-warning text-dark"
                                                            }`}
                                                        >
                                                            {
                                                                attendanceLabels[
                                                                    result.attendance_status
                                                                ] ||
                                                                result.attendance_status
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`badge ${getResultStatusClass(
                                                                result.result_status
                                                            )}`}
                                                        >
                                                            {
                                                                resultStatusLabels[
                                                                    result.result_status
                                                                ] ||
                                                                result.result_status
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
                                                                    handleViewResult(
                                                                        result.id
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
                                                                    handleEditResult(
                                                                        result.id
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
                                                                    handleDeleteResult(
                                                                        result.id
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


            {/* ADD RESULT MODAL */}

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
                            maxWidth: "900px",
                            marginTop: "20px",
                            borderRadius: "18px",
                        }}
                    >

                        <div className="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">

                            <div>

                                <h5 className="mb-1">
                                    Add Student Result
                                </h5>

                                <small className="opacity-75">
                                    Enter marks for an examination
                                </small>

                            </div>


                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={
                                    closeAddForm
                                }
                                disabled={
                                    submitting
                                }
                            ></button>

                        </div>


                        <form
                            onSubmit={
                                handleAddResult
                            }
                        >

                            <div className="card-body p-4">

                                <div className="row g-3">

                                    <div className="col-12">

                                        <label className="form-label">
                                            Exam *
                                        </label>

                                        <select
                                            name="exam"
                                            className="form-select"
                                            value={
                                                formData.exam
                                            }
                                            onChange={(e) => {

                                                setFormData(
                                                    (prev) => ({
                                                        ...prev,
                                                        exam:
                                                            e.target
                                                                .value,
                                                        student:
                                                            "",
                                                    })
                                                );
                                            }}
                                            required
                                        >

                                            <option value="">
                                                Select Exam
                                            </option>

                                            {exams.map(
                                                (
                                                    exam
                                                ) => (
                                                    <option
                                                        key={
                                                            exam.id
                                                        }
                                                        value={
                                                            exam.id
                                                        }
                                                    >
                                                        {
                                                            getExamLabel(
                                                                exam
                                                            )
                                                        }{" "}
                                                        -{" "}
                                                        {formatDate(
                                                            exam.exam_date
                                                        )}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                        {selectedExamForAdd && (

                                            <small className="text-muted">

                                                Batch:{" "}
                                                {
                                                    selectedExamForAdd.batch_name ||
                                                    "-"
                                                }

                                                {" · "}

                                                Maximum Marks:{" "}
                                                {
                                                    selectedExamForAdd.max_marks
                                                }

                                                {" · "}

                                                Pass Marks:{" "}
                                                {
                                                    selectedExamForAdd.pass_marks
                                                }

                                            </small>

                                        )}

                                    </div>


                                    <div className="col-md-8">

                                        <label className="form-label">
                                            Student *
                                        </label>

                                        <select
                                            name="student"
                                            className="form-select"
                                            value={
                                                formData.student
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            disabled={
                                                !formData.exam
                                            }
                                        >

                                            <option value="">
                                                {formData.exam
                                                    ? "Select Student"
                                                    : "Select Exam First"}
                                            </option>

                                            {addEligibleStudents.map(
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
                                                        {
                                                            getStudentName(
                                                                student
                                                            )
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            getStudentRegistration(
                                                                student
                                                            )
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="col-md-4">

                                        <label className="form-label">
                                            Attendance *
                                        </label>

                                        <select
                                            name="attendance_status"
                                            className="form-select"
                                            value={
                                                formData.attendance_status
                                            }
                                            onChange={(e) => {

                                                const value =
                                                    e.target
                                                        .value;

                                                setFormData(
                                                    (prev) => ({
                                                        ...prev,
                                                        attendance_status:
                                                            value,
                                                        marks_obtained:
                                                            value ===
                                                            "ABSENT"
                                                                ? "0"
                                                                : prev.marks_obtained,
                                                    })
                                                );
                                            }}
                                            required
                                        >

                                            {Object.entries(
                                                attendanceLabels
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


                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Marks Obtained *
                                        </label>

                                        <input
                                            type="number"
                                            name="marks_obtained"
                                            className="form-control"
                                            value={
                                                formData.marks_obtained
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            max={
                                                selectedExamForAdd?.max_marks ||
                                                undefined
                                            }
                                            step="0.01"
                                            required
                                        />

                                    </div>


                                    <div className="col-md-6">

                                        <label className="form-label">
                                            Maximum Marks
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={
                                                selectedExamForAdd?.max_marks ||
                                                "-"
                                            }
                                            readOnly
                                        />

                                    </div>


                                    <div className="col-12">

                                        <label className="form-label">
                                            Remarks
                                        </label>

                                        <textarea
                                            name="remarks"
                                            className="form-control"
                                            rows="4"
                                            value={
                                                formData.remarks
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Add performance remarks..."
                                        ></textarea>

                                    </div>

                                </div>

                            </div>


                            <div className="card-footer bg-white p-4 d-flex justify-content-end gap-2">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={
                                        closeAddForm
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-save me-2"></i>
                                            Save Result
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* VIEW RESULT MODAL */}

            {showViewModal &&
                selectedResult && (

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
                                maxWidth: "850px",
                                marginTop: "20px",
                                borderRadius: "18px",
                            }}
                        >

                            <div className="card-header bg-light p-4 d-flex justify-content-between align-items-center">

                                <div>

                                    <h5 className="fw-bold mb-1">
                                        Result Details
                                    </h5>

                                    <small className="text-muted">
                                        Complete student result information
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

                                        <p className="text-muted mt-3">
                                            Loading result...
                                        </p>

                                    </div>

                                ) : (

                                    <>

                                        <div className="text-center mb-4">

                                            <div
                                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                                style={{
                                                    width: "72px",
                                                    height: "72px",
                                                    backgroundColor:
                                                        "#DBEAFE",
                                                }}
                                            >

                                                <i className="bi bi-person-check fs-2 text-primary"></i>

                                            </div>


                                            <h3 className="fw-bold mb-1">
                                                {
                                                    selectedResult.student_name
                                                }
                                            </h3>

                                            <p className="text-muted mb-2">

                                                {
                                                    selectedResult.student_registration_number ||
                                                    "-"
                                                }

                                            </p>


                                            <div className="d-flex justify-content-center gap-2 flex-wrap">

                                                <span
                                                    className={`badge ${getResultStatusClass(
                                                        selectedResult.result_status
                                                    )} p-2`}
                                                >
                                                    {
                                                        resultStatusLabels[
                                                            selectedResult.result_status
                                                        ] ||
                                                        selectedResult.result_status
                                                    }
                                                </span>

                                                <span
                                                    className={`badge ${getGradeClass(
                                                        selectedResult.grade
                                                    )} p-2`}
                                                >
                                                    Grade{" "}
                                                    {
                                                        selectedResult.grade
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        <div className="row g-3">

                                            <DetailItem
                                                label="Exam"
                                                value={
                                                    selectedResult.exam_title
                                                }
                                            />

                                            <DetailItem
                                                label="Exam Date"
                                                value={formatDate(
                                                    selectedResult.exam_date
                                                )}
                                            />

                                            <DetailItem
                                                label="Course"
                                                value={
                                                    selectedResult.course_name ||
                                                    "-"
                                                }
                                            />

                                            <DetailItem
                                                label="Batch"
                                                value={
                                                    selectedResult.batch_name ||
                                                    "-"
                                                }
                                            />

                                            <DetailItem
                                                label="Marks Obtained"
                                                value={`${formatNumber(
                                                    selectedResult.marks_obtained
                                                )} / ${formatNumber(
                                                    selectedResult.max_marks
                                                )}`}
                                            />

                                            <DetailItem
                                                label="Pass Marks"
                                                value={
                                                    selectedResult.pass_marks
                                                }
                                            />

                                            <DetailItem
                                                label="Percentage"
                                                value={`${formatNumber(
                                                    selectedResult.percentage
                                                )}%`}
                                            />

                                            <DetailItem
                                                label="Attendance"
                                                value={
                                                    attendanceLabels[
                                                        selectedResult.attendance_status
                                                    ] ||
                                                    selectedResult.attendance_status
                                                }
                                            />

                                            <DetailItem
                                                label="Entered By"
                                                value={
                                                    selectedResult.entered_by_name ||
                                                    "-"
                                                }
                                            />

                                        </div>


                                        <hr className="my-4" />


                                        <div>

                                            <h6 className="fw-bold mb-2">
                                                Remarks
                                            </h6>

                                            <div
                                                className="rounded-3 p-3"
                                                style={{
                                                    backgroundColor:
                                                        "#F8FAFC",
                                                    whiteSpace:
                                                        "pre-wrap",
                                                }}
                                            >
                                                {
                                                    selectedResult.remarks ||
                                                    "No remarks provided."
                                                }
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
                                        handleDeleteResult(
                                            selectedResult.id
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
                                            handleEditResult(
                                                selectedResult.id
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


            {/* EDIT RESULT MODAL */}

            {showEditModal &&
                selectedResult && (

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

                            <div className="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">

                                <div>

                                    <h5 className="mb-1">
                                        Edit Result
                                    </h5>

                                    <small className="opacity-75">
                                        Update student result information
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
                                    handleUpdateResult
                                }
                            >

                                <div className="card-body p-4">

                                    <div className="row g-3">

                                        <div className="col-12">

                                            <label className="form-label">
                                                Exam *
                                            </label>

                                            <select
                                                name="exam"
                                                className="form-select"
                                                value={
                                                    editData.exam
                                                }
                                                onChange={(e) => {

                                                    setEditData(
                                                        (prev) => ({
                                                            ...prev,
                                                            exam:
                                                                e.target
                                                                    .value,
                                                            student:
                                                                "",
                                                        })
                                                    );
                                                }}
                                                required
                                            >

                                                <option value="">
                                                    Select Exam
                                                </option>

                                                {exams.map(
                                                    (
                                                        exam
                                                    ) => (
                                                        <option
                                                            key={
                                                                exam.id
                                                            }
                                                            value={
                                                                exam.id
                                                            }
                                                        >
                                                            {
                                                                getExamLabel(
                                                                    exam
                                                                )
                                                            }{" "}
                                                            -{" "}
                                                            {formatDate(
                                                                exam.exam_date
                                                            )}
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="col-md-8">

                                            <label className="form-label">
                                                Student *
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
                                                    !editData.exam
                                                }
                                            >

                                                <option value="">
                                                    {editData.exam
                                                        ? "Select Student"
                                                        : "Select Exam First"}
                                                </option>

                                                {editEligibleStudents.map(
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
                                                            {
                                                                getStudentName(
                                                                    student
                                                                )
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                getStudentRegistration(
                                                                    student
                                                                )
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label">
                                                Attendance *
                                            </label>

                                            <select
                                                name="attendance_status"
                                                className="form-select"
                                                value={
                                                    editData.attendance_status
                                                }
                                                onChange={(e) => {

                                                    const value =
                                                        e.target
                                                            .value;

                                                    setEditData(
                                                        (prev) => ({
                                                            ...prev,
                                                            attendance_status:
                                                                value,
                                                            marks_obtained:
                                                                value ===
                                                                "ABSENT"
                                                                    ? "0"
                                                                    : prev.marks_obtained,
                                                        })
                                                    );
                                                }}
                                                required
                                            >

                                                {Object.entries(
                                                    attendanceLabels
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


                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Marks Obtained *
                                            </label>

                                            <input
                                                type="number"
                                                name="marks_obtained"
                                                className="form-control"
                                                value={
                                                    editData.marks_obtained
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                min="0"
                                                max={
                                                    selectedExamForEdit?.max_marks ||
                                                    undefined
                                                }
                                                step="0.01"
                                                required
                                            />

                                        </div>


                                        <div className="col-md-6">

                                            <label className="form-label">
                                                Maximum Marks
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                value={
                                                    selectedExamForEdit?.max_marks ||
                                                    selectedResult.max_marks ||
                                                    "-"
                                                }
                                                readOnly
                                            />

                                        </div>


                                        <div className="col-12">

                                            <label className="form-label">
                                                Remarks
                                            </label>

                                            <textarea
                                                name="remarks"
                                                className="form-control"
                                                rows="4"
                                                value={
                                                    editData.remarks
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
                    backgroundColor:
                        "#F8FAFC",
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