import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CenterAdmissions() {

    const navigate = useNavigate();

    const [admissions, setAdmissions] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedAdmission, setSelectedAdmission] = useState(null);

    const [formData, setFormData] = useState({
        student: "",
        course: "",
        batch: "",
        admission_date: new Date().toISOString().split("T")[0],
        status: "CONFIRMED",
        course_fee: "",
        discount: "0",
        paid_amount: "0",
        remarks: ""
    });

    const [editData, setEditData] = useState({
        course: "",
        batch: "",
        admission_date: "",
        status: "CONFIRMED",
        course_fee: "",
        discount: "0",
        paid_amount: "0",
        remarks: ""
    });

    // ==========================================================
    // FETCH DATA
    // ==========================================================

    async function fetchAdmissions() {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/admissions/center/");

            setAdmissions(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load admissions."
            );

        } finally {

            setLoading(false);
        }
    }

    async function fetchStudents() {

        try {

            const response = await api.get("/students/center/");

            setStudents(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load students."
            );
        }
    }

    async function fetchCourses() {

        try {

            const response = await api.get("/courses/");

            setCourses(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load courses."
            );
        }
    }

    async function fetchBatches() {

        try {

            const response = await api.get("/batches/");

            setBatches(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load batches."
            );
        }
    }

    useEffect(() => {

        fetchAdmissions();
        fetchStudents();
        fetchCourses();
        fetchBatches();

    }, []);

    // ==========================================================
    // FORM HELPERS
    // ==========================================================

    function handleFormChange(event) {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function handleEditChange(event) {

        const { name, value } = event.target;

        setEditData((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function handleStudentChange(event) {

        const studentId = event.target.value;

        const student = students.find(
            (item) => String(item.id) === String(studentId)
        );

        if (!student) {

            setFormData((previous) => ({
                ...previous,
                student: "",
                course: "",
                batch: "",
                course_fee: ""
            }));

            return;
        }

        const selectedCourse = courses.find(
            (course) =>
                String(course.id) === String(student.course)
        );

        setFormData((previous) => ({
            ...previous,
            student: studentId,
            course: student.course || "",
            batch: student.batch || "",
            course_fee: selectedCourse?.fee || ""
        }));
    }

    function handleCourseChange(event) {

        const courseId = event.target.value;

        const selectedCourse = courses.find(
            (course) =>
                String(course.id) === String(courseId)
        );

        setFormData((previous) => ({
            ...previous,
            course: courseId,
            batch: "",
            course_fee: selectedCourse?.fee || ""
        }));
    }

    function handleEditCourseChange(event) {

        const courseId = event.target.value;

        setEditData((previous) => ({
            ...previous,
            course: courseId,
            batch: ""
        }));
    }

    // ==========================================================
    // FEE CALCULATIONS
    // ==========================================================

    const calculatedFinalFee = useMemo(() => {

        const courseFee = Number(formData.course_fee) || 0;
        const discount = Number(formData.discount) || 0;

        return Math.max(
            courseFee - discount,
            0
        );

    }, [
        formData.course_fee,
        formData.discount
    ]);

    const calculatedPendingAmount = useMemo(() => {

        const paid = Number(formData.paid_amount) || 0;

        return Math.max(
            calculatedFinalFee - paid,
            0
        );

    }, [
        calculatedFinalFee,
        formData.paid_amount
    ]);

    const editFinalFee = useMemo(() => {

        const courseFee = Number(editData.course_fee) || 0;
        const discount = Number(editData.discount) || 0;

        return Math.max(
            courseFee - discount,
            0
        );

    }, [
        editData.course_fee,
        editData.discount
    ]);

    const editPendingAmount = useMemo(() => {

        const paid = Number(editData.paid_amount) || 0;

        return Math.max(
            editFinalFee - paid,
            0
        );

    }, [
        editFinalFee,
        editData.paid_amount
    ]);

    // ==========================================================
    // BATCH FILTERING
    // ==========================================================

    const availableBatches = useMemo(() => {

        if (!formData.course) {
            return [];
        }

        const selectedStudent = students.find(
            (student) =>
                String(student.id) === String(formData.student)
        );

        const studentBatchId = selectedStudent?.batch;

        const courseBatches = batches.filter(
            (batch) =>
                String(batch.course) === String(formData.course)
        );

        /*
         * If the selected student already has a batch,
         * show that batch first/available.
         *
         * This also keeps the UI aligned with the
         * student's existing center/course relationship.
         */
        if (studentBatchId) {

            return courseBatches.filter(
                (batch) =>
                    String(batch.id) === String(studentBatchId)
            );
        }

        return courseBatches;

    }, [
        batches,
        formData.course,
        formData.student,
        students
    ]);

    const availableEditBatches = useMemo(() => {

        if (!editData.course) {
            return [];
        }

        return batches.filter(
            (batch) =>
                String(batch.course) === String(editData.course)
        );

    }, [
        batches,
        editData.course
    ]);

    // ==========================================================
    // ADD ADMISSION
    // ==========================================================

    async function handleAddAdmission(event) {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            if (!formData.student) {

                setError("Please select a student.");
                setSaving(false);
                return;
            }

            if (!formData.course) {

                setError("Please select a course.");
                setSaving(false);
                return;
            }

            if (!formData.batch) {

                setError("Please select a batch.");
                setSaving(false);
                return;
            }

            const courseFee = Number(
                formData.course_fee
            ) || 0;

            const discount = Number(
                formData.discount
            ) || 0;

            const paidAmount = Number(
                formData.paid_amount
            ) || 0;

            const finalFee = courseFee - discount;

            if (discount > courseFee) {

                setError(
                    "Discount cannot be greater than course fee."
                );

                setSaving(false);
                return;
            }

            if (paidAmount > finalFee) {

                setError(
                    "Paid amount cannot be greater than final fee."
                );

                setSaving(false);
                return;
            }

            await api.post(
                "/admissions/center/",
                {
                    student: Number(formData.student),
                    course: Number(formData.course),
                    batch: Number(formData.batch),
                    admission_date: formData.admission_date,
                    status: formData.status,
                    course_fee: courseFee,
                    discount: discount,
                    paid_amount: paidAmount,
                    remarks: formData.remarks
                }
            );

            setSuccess(
                "Admission created successfully."
            );

            setShowAddModal(false);

            resetAddForm();

            await fetchAdmissions();

        } catch (err) {

            console.error(err);

            const responseData = err.response?.data;

            if (responseData && typeof responseData === "object") {

                const messages = Object.values(
                    responseData
                ).flat();

                setError(
                    messages.join(" ") ||
                    "Unable to create admission."
                );

            } else {

                setError(
                    "Unable to create admission."
                );
            }

        } finally {

            setSaving(false);
        }
    }

    // ==========================================================
    // VIEW ADMISSION
    // ==========================================================

    async function handleViewAdmission(admissionId) {

        try {

            setError("");

            const response = await api.get(
                `/admissions/center/${admissionId}/`
            );

            setSelectedAdmission(
                response.data
            );

            setShowViewModal(true);

        } catch (err) {

            console.error(err);

            setError(
                "Unable to load admission details."
            );
        }
    }

    // ==========================================================
    // EDIT ADMISSION
    // ==========================================================

    async function handleEditAdmission(admissionId) {

        try {

            setError("");

            const response = await api.get(
                `/admissions/center/${admissionId}/`
            );

            const admission = response.data;

            setSelectedAdmission(admission);

            setEditData({
                course: admission.course || "",
                batch: admission.batch || "",
                admission_date:
                    admission.admission_date || "",
                status:
                    admission.status || "CONFIRMED",
                course_fee:
                    admission.course_fee || "",
                discount:
                    admission.discount || "0",
                paid_amount:
                    admission.paid_amount || "0",
                remarks:
                    admission.remarks || ""
            });

            setShowEditModal(true);

        } catch (err) {

            console.error(err);

            setError(
                "Unable to load admission for editing."
            );
        }
    }

    async function handleUpdateAdmission(event) {

        event.preventDefault();

        if (!selectedAdmission) {
            return;
        }

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const courseFee =
                Number(editData.course_fee) || 0;

            const discount =
                Number(editData.discount) || 0;

            const paidAmount =
                Number(editData.paid_amount) || 0;

            const finalFee =
                courseFee - discount;

            if (discount > courseFee) {

                setError(
                    "Discount cannot be greater than course fee."
                );

                setSaving(false);
                return;
            }

            if (paidAmount > finalFee) {

                setError(
                    "Paid amount cannot be greater than final fee."
                );

                setSaving(false);
                return;
            }

            await api.patch(
                `/admissions/center/${selectedAdmission.id}/`,
                {
                    course: Number(editData.course),
                    batch: Number(editData.batch),
                    admission_date:
                        editData.admission_date,
                    status:
                        editData.status,
                    course_fee:
                        courseFee,
                    discount:
                        discount,
                    paid_amount:
                        paidAmount,
                    remarks:
                        editData.remarks
                }
            );

            setSuccess(
                "Admission updated successfully."
            );

            setShowEditModal(false);

            await fetchAdmissions();

        } catch (err) {

            console.error(err);

            const responseData =
                err.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {

                const messages =
                    Object.values(
                        responseData
                    ).flat();

                setError(
                    messages.join(" ") ||
                    "Unable to update admission."
                );

            } else {

                setError(
                    "Unable to update admission."
                );
            }

        } finally {

            setSaving(false);
        }
    }

    // ==========================================================
    // DELETE ADMISSION
    // ==========================================================

    async function handleDeleteAdmission() {

        if (!selectedAdmission) {
            return;
        }

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            await api.delete(
                `/admissions/center/${selectedAdmission.id}/`
            );

            setSuccess(
                "Admission deleted successfully."
            );

            setShowDeleteModal(false);

            setSelectedAdmission(null);

            await fetchAdmissions();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to delete admission."
            );

        } finally {

            setSaving(false);
        }
    }

    // ==========================================================
    // RESET ADD FORM
    // ==========================================================

    function resetAddForm() {

        setFormData({
            student: "",
            course: "",
            batch: "",
            admission_date:
                new Date().toISOString().split("T")[0],
            status: "CONFIRMED",
            course_fee: "",
            discount: "0",
            paid_amount: "0",
            remarks: ""
        });
    }

    // ==========================================================
    // OPEN ADD MODAL
    // ==========================================================

    function openAddModal() {

        resetAddForm();

        setError("");

        setShowAddModal(true);
    }

    // ==========================================================
    // FILTERED ADMISSIONS
    // ==========================================================

    const filteredAdmissions = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        return admissions.filter(
            (admission) => {

                const matchesSearch =
                    !searchValue ||
                    admission.admission_number
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    admission.registration_number
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    admission.student_name
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    admission.course_name
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    admission.batch_name
                        ?.toLowerCase()
                        .includes(searchValue);

                const matchesStatus =
                    !statusFilter ||
                    admission.status === statusFilter;

                const matchesPayment =
                    !paymentFilter ||
                    admission.payment_status === paymentFilter;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPayment
                );
            }
        );

    }, [
        admissions,
        search,
        statusFilter,
        paymentFilter
    ]);

    // ==========================================================
    // STATUS BADGES
    // ==========================================================

    function getStatusBadge(status) {

        const styles = {
            PENDING: {
                background: "#FEF3C7",
                color: "#92400E"
            },
            CONFIRMED: {
                background: "#DCFCE7",
                color: "#166534"
            },
            CANCELLED: {
                background: "#FEE2E2",
                color: "#991B1B"
            },
            COMPLETED: {
                background: "#DBEAFE",
                color: "#1E40AF"
            }
        };

        const style =
            styles[status] || {
                background: "#F3F4F6",
                color: "#374151"
            };

        return (
            <span
                className="badge rounded-pill"
                style={{
                    backgroundColor: style.background,
                    color: style.color
                }}
            >
                {status}
            </span>
        );
    }

    function getPaymentBadge(paymentStatus) {

        const styles = {
            PENDING: {
                background: "#FEE2E2",
                color: "#991B1B"
            },
            PARTIAL: {
                background: "#FEF3C7",
                color: "#92400E"
            },
            PAID: {
                background: "#DCFCE7",
                color: "#166534"
            }
        };

        const style =
            styles[paymentStatus] || {
                background: "#F3F4F6",
                color: "#374151"
            };

        return (
            <span
                className="badge rounded-pill"
                style={{
                    backgroundColor: style.background,
                    color: style.color
                }}
            >
                {paymentStatus}
            </span>
        );
    }

    // ==========================================================
    // FORMAT MONEY
    // ==========================================================

    function formatMoney(value) {

        return `₹${Number(value || 0).toLocaleString(
            "en-IN"
        )}`;
    }

    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <div
            className="min-vh-100"
            style={{
                backgroundColor: "#F8FAFC"
            }}
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="bg-white border-bottom"
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1000
                }}
            >

                <div className="container-fluid px-3 px-lg-4">

                    <div
                        className="d-flex justify-content-between align-items-center"
                        style={{
                            minHeight: "72px"
                        }}
                    >

                        <div className="d-flex align-items-center">

                            <button
                                type="button"
                                className="btn btn-light me-3"
                                onClick={() =>
                                    navigate("/center-dashboard")
                                }
                            >
                                <i className="bi bi-arrow-left"></i>
                            </button>

                            <div>

                                <h4
                                    className="fw-bold mb-0"
                                    style={{
                                        color: "#1F2937"
                                    }}
                                >
                                    Admissions
                                </h4>

                                <small className="text-muted">
                                    Manage student admissions
                                </small>

                            </div>

                        </div>

                        <button
                            type="button"
                            className="btn text-white px-3 px-md-4"
                            onClick={openAddModal}
                            style={{
                                backgroundColor: "#16A34A",
                                borderRadius: "10px"
                            }}
                        >

                            <i className="bi bi-person-plus me-2"></i>

                            <span className="d-none d-sm-inline">
                                New Admission
                            </span>

                            <span className="d-sm-none">
                                Add
                            </span>

                        </button>

                    </div>

                </div>

            </div>


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="container-fluid px-3 px-lg-4 py-4">

                {/* Alerts */}

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


                {/* ==================================================
                    SUMMARY CARDS
                ================================================== */}

                <div className="row g-3 mb-4">

                    <div className="col-6 col-xl-3">

                        <div className="card border-0 shadow-sm rounded-4 h-100">

                            <div className="card-body p-3 p-md-4">

                                <small className="text-muted">
                                    Total Admissions
                                </small>

                                <h3 className="fw-bold mt-2 mb-0">
                                    {admissions.length}
                                </h3>

                            </div>

                        </div>

                    </div>


                    <div className="col-6 col-xl-3">

                        <div className="card border-0 shadow-sm rounded-4 h-100">

                            <div className="card-body p-3 p-md-4">

                                <small className="text-muted">
                                    Confirmed
                                </small>

                                <h3
                                    className="fw-bold mt-2 mb-0"
                                    style={{
                                        color: "#16A34A"
                                    }}
                                >
                                    {
                                        admissions.filter(
                                            (item) =>
                                                item.status === "CONFIRMED"
                                        ).length
                                    }
                                </h3>

                            </div>

                        </div>

                    </div>


                    <div className="col-6 col-xl-3">

                        <div className="card border-0 shadow-sm rounded-4 h-100">

                            <div className="card-body p-3 p-md-4">

                                <small className="text-muted">
                                    Partial Payments
                                </small>

                                <h3
                                    className="fw-bold mt-2 mb-0"
                                    style={{
                                        color: "#EA580C"
                                    }}
                                >
                                    {
                                        admissions.filter(
                                            (item) =>
                                                item.payment_status === "PARTIAL"
                                        ).length
                                    }
                                </h3>

                            </div>

                        </div>

                    </div>


                    <div className="col-6 col-xl-3">

                        <div className="card border-0 shadow-sm rounded-4 h-100">

                            <div className="card-body p-3 p-md-4">

                                <small className="text-muted">
                                    Pending Amount
                                </small>

                                <h3
                                    className="fw-bold mt-2 mb-0"
                                    style={{
                                        color: "#DC2626"
                                    }}
                                >
                                    {formatMoney(
                                        admissions.reduce(
                                            (
                                                total,
                                                item
                                            ) =>
                                                total +
                                                Number(
                                                    item.pending_amount || 0
                                                ),
                                            0
                                        )
                                    )}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="card border-0 shadow-sm rounded-4 mb-4">

                    <div className="card-body p-3 p-md-4">

                        <div className="row g-3">

                            <div className="col-lg-6">

                                <div className="input-group">

                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-search"></i>
                                    </span>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search admission, student, registration, course..."
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            <div className="col-md-3 col-lg-2">

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

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="CONFIRMED">
                                        Confirmed
                                    </option>

                                    <option value="COMPLETED">
                                        Completed
                                    </option>

                                    <option value="CANCELLED">
                                        Cancelled
                                    </option>

                                </select>

                            </div>


                            <div className="col-md-3 col-lg-2">

                                <select
                                    className="form-select"
                                    value={paymentFilter}
                                    onChange={(event) =>
                                        setPaymentFilter(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Payments
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="PARTIAL">
                                        Partial
                                    </option>

                                    <option value="PAID">
                                        Paid
                                    </option>

                                </select>

                            </div>


                            <div className="col-md-6 col-lg-2">

                                <button
                                    type="button"
                                    className="btn btn-light w-100"
                                    onClick={() => {

                                        setSearch("");
                                        setStatusFilter("");
                                        setPaymentFilter("");

                                    }}
                                >

                                    <i className="bi bi-arrow-clockwise me-2"></i>

                                    Reset

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="card border-0 shadow-sm rounded-4">

                    <div className="card-body p-0">

                        {loading ? (

                            <div className="text-center py-5">

                                <div
                                    className="spinner-border"
                                    style={{
                                        color: "#16A34A"
                                    }}
                                ></div>

                                <p className="text-muted mt-3 mb-0">
                                    Loading admissions...
                                </p>

                            </div>

                        ) : filteredAdmissions.length === 0 ? (

                            <div className="text-center py-5 px-3">

                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        backgroundColor: "#F0FDF4",
                                        color: "#16A34A"
                                    }}
                                >

                                    <i className="bi bi-person-plus fs-2"></i>

                                </div>

                                <h5 className="fw-bold">
                                    No admissions found
                                </h5>

                                <p className="text-muted mb-3">
                                    Create your first admission to get started.
                                </p>

                                <button
                                    type="button"
                                    className="btn text-white"
                                    onClick={openAddModal}
                                    style={{
                                        backgroundColor: "#16A34A"
                                    }}
                                >
                                    <i className="bi bi-person-plus me-2"></i>
                                    New Admission
                                </button>

                            </div>

                        ) : (

                            <div className="table-responsive">

                                <table className="table align-middle mb-0">

                                    <thead
                                        style={{
                                            backgroundColor: "#F8FAFC"
                                        }}
                                    >

                                        <tr>

                                            <th className="px-4 py-3">
                                                Admission
                                            </th>

                                            <th>
                                                Student
                                            </th>

                                            <th>
                                                Course
                                            </th>

                                            <th>
                                                Batch
                                            </th>

                                            <th>
                                                Admission Date
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Payment
                                            </th>

                                            <th>
                                                Pending
                                            </th>

                                            <th className="text-end px-4">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredAdmissions.map(
                                            (admission) => (

                                                <tr
                                                    key={admission.id}
                                                >

                                                    <td className="px-4">

                                                        <div className="fw-semibold">
                                                            {
                                                                admission.admission_number
                                                            }
                                                        </div>

                                                        <small className="text-muted">
                                                            {
                                                                admission.registration_number
                                                            }
                                                        </small>

                                                    </td>


                                                    <td>

                                                        <div className="fw-semibold">
                                                            {
                                                                admission.student_name
                                                            }
                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="fw-semibold">
                                                            {
                                                                admission.course_name
                                                            }
                                                        </div>

                                                        <small className="text-muted">
                                                            {
                                                                admission.course_code
                                                            }
                                                        </small>

                                                    </td>


                                                    <td>

                                                        <div>
                                                            {
                                                                admission.batch_name
                                                            }
                                                        </div>

                                                        <small className="text-muted">
                                                            {
                                                                admission.batch_code
                                                            }
                                                        </small>

                                                    </td>


                                                    <td>
                                                        {
                                                            admission.admission_date
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            getStatusBadge(
                                                                admission.status
                                                            )
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            getPaymentBadge(
                                                                admission.payment_status
                                                            )
                                                        }
                                                    </td>


                                                    <td>

                                                        <span
                                                            className="fw-semibold"
                                                            style={{
                                                                color:
                                                                    Number(
                                                                        admission.pending_amount
                                                                    ) > 0
                                                                        ? "#DC2626"
                                                                        : "#16A34A"
                                                            }}
                                                        >
                                                            {
                                                                formatMoney(
                                                                    admission.pending_amount
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="text-end px-4">

                                                        <div className="d-flex justify-content-end gap-1">

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light"
                                                                title="View"
                                                                onClick={() =>
                                                                    handleViewAdmission(
                                                                        admission.id
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
                                                                    handleEditAdmission(
                                                                        admission.id
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light text-danger"
                                                                title="Delete"
                                                                onClick={() => {

                                                                    setSelectedAdmission(
                                                                        admission
                                                                    );

                                                                    setShowDeleteModal(
                                                                        true
                                                                    );

                                                                }}
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

            </main>


            {/* ==================================================
                ADD ADMISSION MODAL
            ================================================== */}

            {showAddModal && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        backgroundColor: "#FFFFFF",
                        overflowY: "auto",
                        padding: "25px 15px"
                    }}
                >

                    <div className="container">

                        <div className="card border-0 shadow-sm rounded-4">

                            <div className="card-header bg-white border-bottom p-4">

                                <div className="d-flex justify-content-between align-items-center">

                                    <div>

                                        <h4 className="fw-bold mb-1">
                                            New Admission
                                        </h4>

                                        <small className="text-muted">
                                            Create a new student admission
                                        </small>

                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() =>
                                            setShowAddModal(false)
                                        }
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>

                                </div>

                            </div>


                            <form onSubmit={handleAddAdmission}>

                                <div className="card-body p-4">

                                    <div className="row g-4">

                                        {/* Student */}

                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Student
                                            </label>

                                            <select
                                                name="student"
                                                className="form-select"
                                                value={formData.student}
                                                onChange={
                                                    handleStudentChange
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Student
                                                </option>

                                                {students.map(
                                                    (student) => (

                                                        <option
                                                            key={student.id}
                                                            value={student.id}
                                                        >
                                                            {
                                                                student.registration_number
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                student.first_name
                                                            }{" "}
                                                            {
                                                                student.last_name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* Course */}

                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Course
                                            </label>

                                            <select
                                                name="course"
                                                className="form-select"
                                                value={formData.course}
                                                onChange={
                                                    handleCourseChange
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Course
                                                </option>

                                                {courses.map(
                                                    (course) => (

                                                        <option
                                                            key={course.id}
                                                            value={course.id}
                                                        >
                                                            {
                                                                course.course_code
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                course.course_name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* Batch */}

                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Batch
                                            </label>

                                            <select
                                                name="batch"
                                                className="form-select"
                                                value={formData.batch}
                                                onChange={
                                                    handleFormChange
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Batch
                                                </option>

                                                {availableBatches.map(
                                                    (batch) => (

                                                        <option
                                                            key={batch.id}
                                                            value={batch.id}
                                                        >
                                                            {
                                                                batch.batch_code
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                batch.batch_name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* Admission Date */}

                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Admission Date
                                            </label>

                                            <input
                                                type="date"
                                                name="admission_date"
                                                className="form-control"
                                                value={
                                                    formData.admission_date
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                                required
                                            />

                                        </div>


                                        {/* Status */}

                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Admission Status
                                            </label>

                                            <select
                                                name="status"
                                                className="form-select"
                                                value={formData.status}
                                                onChange={
                                                    handleFormChange
                                                }
                                            >

                                                <option value="PENDING">
                                                    Pending
                                                </option>

                                                <option value="CONFIRMED">
                                                    Confirmed
                                                </option>

                                                <option value="COMPLETED">
                                                    Completed
                                                </option>

                                            </select>

                                        </div>


                                        {/* Course Fee */}

                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Course Fee
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    ₹
                                                </span>

                                                <input
                                                    type="number"
                                                    name="course_fee"
                                                    className="form-control"
                                                    value={
                                                        formData.course_fee
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                    min="0"
                                                    required
                                                />

                                            </div>

                                        </div>


                                        {/* Discount */}

                                        <div className="col-md-4">

                                            <label className="form-label fw-semibold">
                                                Discount
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    ₹
                                                </span>

                                                <input
                                                    type="number"
                                                    name="discount"
                                                    className="form-control"
                                                    value={
                                                        formData.discount
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                    min="0"
                                                />

                                            </div>

                                        </div>


                                        {/* Paid */}

                                        <div className="col-md-4">

                                            <label className="form-label fw-semibold">
                                                Paid Amount
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    ₹
                                                </span>

                                                <input
                                                    type="number"
                                                    name="paid_amount"
                                                    className="form-control"
                                                    value={
                                                        formData.paid_amount
                                                    }
                                                    onChange={
                                                        handleFormChange
                                                    }
                                                    min="0"
                                                />

                                            </div>

                                        </div>


                                        {/* Final Fee */}

                                        <div className="col-md-4">

                                            <label className="form-label fw-semibold">
                                                Final Fee
                                            </label>

                                            <div className="form-control bg-light fw-bold">
                                                {formatMoney(
                                                    calculatedFinalFee
                                                )}
                                            </div>

                                        </div>


                                        {/* Pending */}

                                        <div className="col-md-4">

                                            <label className="form-label fw-semibold">
                                                Pending Amount
                                            </label>

                                            <div
                                                className="form-control bg-light fw-bold"
                                                style={{
                                                    color:
                                                        calculatedPendingAmount >
                                                        0
                                                            ? "#DC2626"
                                                            : "#16A34A"
                                                }}
                                            >
                                                {formatMoney(
                                                    calculatedPendingAmount
                                                )}
                                            </div>

                                        </div>


                                        {/* Remarks */}

                                        <div className="col-12">

                                            <label className="form-label fw-semibold">
                                                Remarks
                                            </label>

                                            <textarea
                                                name="remarks"
                                                className="form-control"
                                                rows="3"
                                                placeholder="Optional remarks..."
                                                value={
                                                    formData.remarks
                                                }
                                                onChange={
                                                    handleFormChange
                                                }
                                            ></textarea>

                                        </div>

                                    </div>

                                </div>


                                <div className="card-footer bg-white border-top p-4">

                                    <div className="d-flex justify-content-end gap-2">

                                        <button
                                            type="button"
                                            className="btn btn-light px-4"
                                            onClick={() =>
                                                setShowAddModal(false)
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn text-white px-4"
                                            disabled={saving}
                                            style={{
                                                backgroundColor: "#16A34A"
                                            }}
                                        >

                                            {saving ? (

                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                    ></span>

                                                    Saving...
                                                </>

                                            ) : (

                                                <>
                                                    <i className="bi bi-check-lg me-2"></i>
                                                    Create Admission
                                                </>

                                            )}

                                        </button>

                                    </div>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                VIEW MODAL
            ================================================== */}

            {showViewModal && selectedAdmission && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        backgroundColor: "#FFFFFF",
                        overflowY: "auto",
                        padding: "30px 15px"
                    }}
                >

                    <div className="container">

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <div>

                                <h3 className="fw-bold mb-1">
                                    Admission Details
                                </h3>

                                <p className="text-muted mb-0">
                                    {
                                        selectedAdmission.admission_number
                                    }
                                </p>

                            </div>

                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={() =>
                                    setShowViewModal(false)
                                }
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>


                        <div className="row g-4">

                            <div className="col-lg-8">

                                <div className="card border-0 shadow-sm rounded-4">

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-4">
                                            Admission Information
                                        </h5>

                                        <div className="row g-4">

                                            <div className="col-md-6">

                                                <small className="text-muted d-block">
                                                    Admission Number
                                                </small>

                                                <strong>
                                                    {
                                                        selectedAdmission.admission_number
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted d-block">
                                                    Registration Number
                                                </small>

                                                <strong>
                                                    {
                                                        selectedAdmission.registration_number
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted d-block">
                                                    Student
                                                </small>

                                                <strong>
                                                    {
                                                        selectedAdmission.student_name
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted d-block">
                                                    Course
                                                </small>

                                                <strong>
                                                    {
                                                        selectedAdmission.course_name
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted d-block">
                                                    Batch
                                                </small>

                                                <strong>
                                                    {
                                                        selectedAdmission.batch_name
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted d-block">
                                                    Admission Date
                                                </small>

                                                <strong>
                                                    {
                                                        selectedAdmission.admission_date
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted d-block mb-1">
                                                    Admission Status
                                                </small>

                                                {
                                                    getStatusBadge(
                                                        selectedAdmission.status
                                                    )
                                                }

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted d-block mb-1">
                                                    Payment Status
                                                </small>

                                                {
                                                    getPaymentBadge(
                                                        selectedAdmission.payment_status
                                                    )
                                                }

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                <div className="card border-0 shadow-sm rounded-4 mt-4">

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-4">
                                            Fee Details
                                        </h5>

                                        <div className="row g-4">

                                            <div className="col-md-3">

                                                <small className="text-muted d-block">
                                                    Course Fee
                                                </small>

                                                <strong>
                                                    {
                                                        formatMoney(
                                                            selectedAdmission.course_fee
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-3">

                                                <small className="text-muted d-block">
                                                    Discount
                                                </small>

                                                <strong>
                                                    {
                                                        formatMoney(
                                                            selectedAdmission.discount
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-3">

                                                <small className="text-muted d-block">
                                                    Final Fee
                                                </small>

                                                <strong>
                                                    {
                                                        formatMoney(
                                                            selectedAdmission.final_fee
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-3">

                                                <small className="text-muted d-block">
                                                    Paid Amount
                                                </small>

                                                <strong
                                                    style={{
                                                        color: "#16A34A"
                                                    }}
                                                >
                                                    {
                                                        formatMoney(
                                                            selectedAdmission.paid_amount
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div className="col-md-3">

                                                <small className="text-muted d-block">
                                                    Pending Amount
                                                </small>

                                                <strong
                                                    style={{
                                                        color:
                                                            Number(
                                                                selectedAdmission.pending_amount
                                                            ) > 0
                                                                ? "#DC2626"
                                                                : "#16A34A"
                                                    }}
                                                >
                                                    {
                                                        formatMoney(
                                                            selectedAdmission.pending_amount
                                                        )
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {selectedAdmission.remarks && (

                                    <div className="card border-0 shadow-sm rounded-4 mt-4">

                                        <div className="card-body p-4">

                                            <h5 className="fw-bold mb-3">
                                                Remarks
                                            </h5>

                                            <p className="text-muted mb-0">
                                                {
                                                    selectedAdmission.remarks
                                                }
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>


                            <div className="col-lg-4">

                                <div className="card border-0 shadow-sm rounded-4">

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-4">
                                            Actions
                                        </h5>

                                        <button
                                            type="button"
                                            className="btn btn-outline-primary w-100 mb-2"
                                            onClick={() => {

                                                setShowViewModal(false);

                                                handleEditAdmission(
                                                    selectedAdmission.id
                                                );

                                            }}
                                        >
                                            <i className="bi bi-pencil me-2"></i>
                                            Edit Admission
                                        </button>


                                        <button
                                            type="button"
                                            className="btn btn-outline-danger w-100"
                                            onClick={() => {

                                                setShowViewModal(false);

                                                setShowDeleteModal(true);

                                            }}
                                        >
                                            <i className="bi bi-trash me-2"></i>
                                            Delete Admission
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                EDIT MODAL
            ================================================== */}

            {showEditModal && selectedAdmission && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        backgroundColor: "#FFFFFF",
                        overflowY: "auto",
                        padding: "20px 15px"
                    }}
                >

                    <div className="container">

                        <div className="card border-0 shadow-sm rounded-4">

                            <div className="card-header bg-white border-bottom p-4">

                                <div className="d-flex justify-content-between align-items-center">

                                    <div>

                                        <h4 className="fw-bold mb-1">
                                            Edit Admission
                                        </h4>

                                        <small className="text-muted">
                                            {
                                                selectedAdmission.admission_number
                                            }
                                        </small>

                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() =>
                                            setShowEditModal(false)
                                        }
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>

                                </div>

                            </div>


                            <form onSubmit={handleUpdateAdmission}>

                                <div className="card-body p-4">

                                    <div className="row g-4">

                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Student
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={
                                                    selectedAdmission.student_name
                                                }
                                                readOnly
                                            />

                                        </div>


                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Registration Number
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control bg-light"
                                                value={
                                                    selectedAdmission.registration_number ||
                                                    ""
                                                }
                                                readOnly
                                            />

                                        </div>


                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Course
                                            </label>

                                            <select
                                                name="course"
                                                className="form-select"
                                                value={
                                                    editData.course
                                                }
                                                onChange={
                                                    handleEditCourseChange
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Course
                                                </option>

                                                {courses.map(
                                                    (course) => (

                                                        <option
                                                            key={course.id}
                                                            value={course.id}
                                                        >
                                                            {
                                                                course.course_code
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                course.course_name
                                                            }
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
                                            >

                                                <option value="">
                                                    Select Batch
                                                </option>

                                                {availableEditBatches.map(
                                                    (batch) => (

                                                        <option
                                                            key={batch.id}
                                                            value={batch.id}
                                                        >
                                                            {
                                                                batch.batch_code
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                batch.batch_name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Admission Date
                                            </label>

                                            <input
                                                type="date"
                                                name="admission_date"
                                                className="form-control"
                                                value={
                                                    editData.admission_date
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div className="col-md-6">

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
                                            >

                                                <option value="PENDING">
                                                    Pending
                                                </option>

                                                <option value="CONFIRMED">
                                                    Confirmed
                                                </option>

                                                <option value="COMPLETED">
                                                    Completed
                                                </option>

                                                <option value="CANCELLED">
                                                    Cancelled
                                                </option>

                                            </select>

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label fw-semibold">
                                                Course Fee
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    ₹
                                                </span>

                                                <input
                                                    type="number"
                                                    name="course_fee"
                                                    className="form-control"
                                                    value={
                                                        editData.course_fee
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    min="0"
                                                    required
                                                />

                                            </div>

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label fw-semibold">
                                                Discount
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    ₹
                                                </span>

                                                <input
                                                    type="number"
                                                    name="discount"
                                                    className="form-control"
                                                    value={
                                                        editData.discount
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    min="0"
                                                />

                                            </div>

                                        </div>


                                        <div className="col-md-4">

                                            <label className="form-label fw-semibold">
                                                Paid Amount
                                            </label>

                                            <div className="input-group">

                                                <span className="input-group-text">
                                                    ₹
                                                </span>

                                                <input
                                                    type="number"
                                                    name="paid_amount"
                                                    className="form-control"
                                                    value={
                                                        editData.paid_amount
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    min="0"
                                                />

                                            </div>

                                        </div>


                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Final Fee
                                            </label>

                                            <div className="form-control bg-light fw-bold">
                                                {formatMoney(
                                                    editFinalFee
                                                )}
                                            </div>

                                        </div>


                                        <div className="col-md-6">

                                            <label className="form-label fw-semibold">
                                                Pending Amount
                                            </label>

                                            <div
                                                className="form-control bg-light fw-bold"
                                                style={{
                                                    color:
                                                        editPendingAmount >
                                                        0
                                                            ? "#DC2626"
                                                            : "#16A34A"
                                                }}
                                            >
                                                {formatMoney(
                                                    editPendingAmount
                                                )}
                                            </div>

                                        </div>


                                        <div className="col-12">

                                            <label className="form-label fw-semibold">
                                                Remarks
                                            </label>

                                            <textarea
                                                name="remarks"
                                                className="form-control"
                                                rows="3"
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


                                <div className="card-footer bg-white border-top p-4">

                                    <div className="d-flex justify-content-end gap-2">

                                        <button
                                            type="button"
                                            className="btn btn-light px-4"
                                            onClick={() =>
                                                setShowEditModal(false)
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn text-white px-4"
                                            disabled={saving}
                                            style={{
                                                backgroundColor: "#2563EB"
                                            }}
                                        >

                                            {saving ? (

                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                    ></span>
                                                    Updating...
                                                </>

                                            ) : (

                                                <>
                                                    <i className="bi bi-check-lg me-2"></i>
                                                    Update Admission
                                                </>

                                            )}

                                        </button>

                                    </div>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                DELETE CONFIRMATION
            ================================================== */}

            {showDeleteModal && selectedAdmission && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1060,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px"
                    }}
                >

                    <div
                        className="card border-0 shadow-lg rounded-4"
                        style={{
                            maxWidth: "450px",
                            width: "100%"
                        }}
                    >

                        <div className="card-body p-4 text-center">

                            <div
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{
                                    width: "65px",
                                    height: "65px",
                                    backgroundColor: "#FEE2E2",
                                    color: "#DC2626"
                                }}
                            >
                                <i className="bi bi-trash fs-3"></i>
                            </div>

                            <h5 className="fw-bold">
                                Delete Admission?
                            </h5>

                            <p className="text-muted">

                                Are you sure you want to delete{" "}

                                <strong>
                                    {
                                        selectedAdmission.admission_number
                                    }
                                </strong>

                                ?

                                <br />

                                This action cannot be undone.

                            </p>

                            <div className="d-flex justify-content-center gap-2 mt-4">

                                <button
                                    type="button"
                                    className="btn btn-light px-4"
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger px-4"
                                    onClick={
                                        handleDeleteAdmission
                                    }
                                    disabled={saving}
                                >

                                    {saving ? (

                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                            ></span>
                                            Deleting...
                                        </>

                                    ) : (

                                        <>
                                            <i className="bi bi-trash me-2"></i>
                                            Delete
                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}