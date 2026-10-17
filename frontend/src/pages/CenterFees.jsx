import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function CenterFees() {
    const [fees, setFees] = useState([]);
    const [admissions, setAdmissions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedFee, setSelectedFee] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [paymentModeFilter, setPaymentModeFilter] = useState("ALL");

    const getToday = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const getEmptyForm = () => ({
        admission: "",
        amount: "",
        payment_date: getToday(),
        payment_mode: "CASH",
        transaction_reference: "",
        payment_status: "SUCCESS",
        remarks: "",
    });

    const [formData, setFormData] = useState(getEmptyForm());

    const fetchFees = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/fees/center/");
            setFees(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching fees:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load fee payments."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmissions = async () => {
        try {
            const response = await api.get("/admissions/center/");

            setAdmissions(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error("Error fetching admissions:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load admissions."
            );
        }
    };

    useEffect(() => {
        fetchFees();
        fetchAdmissions();
    }, []);

    const getBackendErrors = (err, fallbackMessage) => {
        if (!err.response?.data) {
            return fallbackMessage;
        }

        const data = err.response.data;

        if (data.detail) {
            return data.detail;
        }

        return Object.entries(data)
            .map(([field, value]) => {
                if (Array.isArray(value)) {
                    return `${field}: ${value.join(", ")}`;
                }

                if (typeof value === "object" && value !== null) {
                    return `${field}: ${JSON.stringify(value)}`;
                }

                return `${field}: ${value}`;
            })
            .join(" | ") || fallbackMessage;
    };

    const getStudentName = (admission) => {
        if (!admission) {
            return "Unknown Student";
        }

        return (
            admission.student_name ||
            admission.student_detail?.student_name ||
            admission.student_detail?.name ||
            admission.student?.name ||
            admission.student ||
            "Unknown Student"
        );
    };

    const getCourseName = (admission) => {
        if (!admission) {
            return "Unknown Course";
        }

        return (
            admission.course_name ||
            admission.course_detail?.course_name ||
            admission.course?.course_name ||
            "Unknown Course"
        );
    };

    const getBatchName = (admission) => {
        if (!admission) {
            return "Unknown Batch";
        }

        return (
            admission.batch_name ||
            admission.batch_detail?.batch_name ||
            admission.batch?.batch_name ||
            "Unknown Batch"
        );
    };

    const selectedAdmission = useMemo(() => {
        return admissions.find(
            (admission) =>
                String(admission.id) ===
                String(formData.admission)
        );
    }, [admissions, formData.admission]);

    const filteredFees = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return fees.filter((fee) => {
            const matchesSearch =
                !searchText ||
                fee.receipt_number
                    ?.toLowerCase()
                    .includes(searchText) ||
                fee.admission_number
                    ?.toLowerCase()
                    .includes(searchText) ||
                fee.student_name
                    ?.toLowerCase()
                    .includes(searchText) ||
                fee.registration_number
                    ?.toLowerCase()
                    .includes(searchText) ||
                fee.course_name
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "ALL" ||
                fee.payment_status === statusFilter;

            const matchesPaymentMode =
                paymentModeFilter === "ALL" ||
                fee.payment_mode === paymentModeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPaymentMode
            );
        });
    }, [
        fees,
        search,
        statusFilter,
        paymentModeFilter,
    ]);

    const summary = useMemo(() => {
        const successfulPayments = fees.filter(
            (fee) => fee.payment_status === "SUCCESS"
        );

        const totalCollected = successfulPayments.reduce(
            (total, fee) =>
                total + Number(fee.amount || 0),
            0
        );

        const pendingPayments = fees.filter(
            (fee) => fee.payment_status === "PENDING"
        ).length;

        const failedPayments = fees.filter(
            (fee) => fee.payment_status === "FAILED"
        ).length;

        const refundedAmount = fees
            .filter(
                (fee) =>
                    fee.payment_status === "REFUNDED"
            )
            .reduce(
                (total, fee) =>
                    total + Number(fee.amount || 0),
                0
            );

        return {
            totalCollected,
            pendingPayments,
            failedPayments,
            refundedAmount,
        };
    }, [fees]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData(getEmptyForm());
    };

    const handleAddFee = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const payload = {
                admission: Number(formData.admission),
                amount: Number(formData.amount),
                payment_date: formData.payment_date,
                payment_mode: formData.payment_mode,
                transaction_reference:
                    formData.transaction_reference.trim(),
                payment_status: formData.payment_status,
                remarks: formData.remarks.trim(),
            };

            const response = await api.post(
                "/fees/center/",
                payload
            );

            setSuccess(
                `Payment ${response.data.receipt_number} recorded successfully.`
            );

            setShowAddForm(false);
            resetForm();

            await fetchFees();
        } catch (err) {
            console.error(
                "Error creating fee payment:",
                err
            );

            setError(
                getBackendErrors(
                    err,
                    "Unable to record fee payment."
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewFee = async (feeId) => {
        try {
            setDetailLoading(true);
            setError("");

            const response = await api.get(
                `/fees/center/${feeId}/`
            );

            setSelectedFee(response.data);
            setShowViewModal(true);
        } catch (err) {
            console.error(
                "Error fetching fee details:",
                err
            );

            setError(
                getBackendErrors(
                    err,
                    "Unable to load fee details."
                )
            );
        } finally {
            setDetailLoading(false);
        }
    };

    const handleEditFee = async (feeId) => {
        try {
            setDetailLoading(true);
            setError("");

            const response = await api.get(
                `/fees/center/${feeId}/`
            );

            const fee = response.data;

            setSelectedFee(fee);

            setFormData({
                admission: fee.admission || "",
                amount: fee.amount || "",
                payment_date: fee.payment_date || "",
                payment_mode:
                    fee.payment_mode || "CASH",
                transaction_reference:
                    fee.transaction_reference || "",
                payment_status:
                    fee.payment_status || "SUCCESS",
                remarks: fee.remarks || "",
            });

            setShowEditModal(true);
        } catch (err) {
            console.error(
                "Error fetching fee for edit:",
                err
            );

            setError(
                getBackendErrors(
                    err,
                    "Unable to load fee payment."
                )
            );
        } finally {
            setDetailLoading(false);
        }
    };

    const handleUpdateFee = async (event) => {
        event.preventDefault();

        if (!selectedFee) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const payload = {
                admission: Number(formData.admission),
                amount: Number(formData.amount),
                payment_date: formData.payment_date,
                payment_mode: formData.payment_mode,
                transaction_reference:
                    formData.transaction_reference.trim(),
                payment_status: formData.payment_status,
                remarks: formData.remarks.trim(),
            };

            const response = await api.patch(
                `/fees/center/${selectedFee.id}/`,
                payload
            );

            setSuccess(
                `Payment ${response.data.receipt_number} updated successfully.`
            );

            setShowEditModal(false);
            setSelectedFee(null);
            resetForm();

            await fetchFees();
        } catch (err) {
            console.error(
                "Error updating fee payment:",
                err
            );

            setError(
                getBackendErrors(
                    err,
                    "Unable to update fee payment."
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteFee = async (feeId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this fee payment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/fees/center/${feeId}/`
            );

            setSuccess(
                "Fee payment deleted successfully."
            );

            await fetchFees();
        } catch (err) {
            console.error(
                "Error deleting fee payment:",
                err
            );

            setError(
                getBackendErrors(
                    err,
                    "Unable to delete fee payment."
                )
            );
        }
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedFee(null);
    };

    const closeEditModal = () => {
        if (submitting) {
            return;
        }

        setShowEditModal(false);
        setSelectedFee(null);
        resetForm();
    };

    const formatCurrency = (value) => {
        return Number(value || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "-";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const paymentModeLabel = (mode) => {
        const labels = {
            CASH: "Cash",
            UPI: "UPI",
            CARD: "Card",
            BANK_TRANSFER: "Bank Transfer",
            CHEQUE: "Cheque",
            OTHER: "Other",
        };

        return labels[mode] || mode || "-";
    };

    const paymentStatusBadge = (status) => {
        const classes = {
            SUCCESS: "bg-success",
            PENDING: "bg-warning text-dark",
            FAILED: "bg-danger",
            REFUNDED: "bg-secondary",
        };

        return classes[status] || "bg-secondary";
    };

    const requiresTransactionReference =
        [
            "UPI",
            "CARD",
            "BANK_TRANSFER",
            "CHEQUE",
        ].includes(formData.payment_mode) &&
        formData.payment_status === "SUCCESS";

    return (
        <div className="container-fluid py-4">

            {/* Page Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Fees
                    </h2>

                    <p className="text-muted mb-0">
                        Collect and manage student fee payments
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={() => {
                        setShowAddForm(true);
                        setError("");
                        setSuccess("");
                        resetForm();
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Collect Fee
                </button>
            </div>

            {/* Alerts */}
            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="row g-4 mb-4">

                <div className="col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-muted">
                                Total Collected
                            </small>

                            <h3 className="fw-bold text-success mt-2 mb-1">
                                ₹ {formatCurrency(
                                    summary.totalCollected
                                )}
                            </h3>

                            <small className="text-muted">
                                Successful payments
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-muted">
                                Total Payments
                            </small>

                            <h3 className="fw-bold text-primary mt-2 mb-1">
                                {fees.length}
                            </h3>

                            <small className="text-muted">
                                All recorded transactions
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-muted">
                                Pending Payments
                            </small>

                            <h3 className="fw-bold text-warning mt-2 mb-1">
                                {summary.pendingPayments}
                            </h3>

                            <small className="text-muted">
                                Pending transactions
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <small className="text-muted">
                                Refunded Amount
                            </small>

                            <h3 className="fw-bold text-secondary mt-2 mb-1">
                                ₹ {formatCurrency(
                                    summary.refundedAmount
                                )}
                            </h3>

                            <small className="text-muted">
                                Refunded payments
                            </small>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Fee Form */}
            {showAddForm && (
                <div className="card border-0 shadow-sm rounded-4 mb-4">

                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">
                            Collect Fee Payment
                        </h5>
                    </div>

                    <div className="card-body p-4">

                        <form onSubmit={handleAddFee}>

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Admission *
                                    </label>

                                    <select
                                        name="admission"
                                        className="form-select"
                                        value={formData.admission}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Admission
                                        </option>

                                        {admissions.map(
                                            (admission) => (
                                                <option
                                                    key={admission.id}
                                                    value={admission.id}
                                                >
                                                    {
                                                        admission.admission_number
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        getStudentName(
                                                            admission
                                                        )
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Amount *
                                    </label>

                                    <input
                                        type="number"
                                        name="amount"
                                        className="form-control"
                                        min="0.01"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                    />

                                    {selectedAdmission && (
                                        <small className="text-muted">
                                            Course:{" "}
                                            {
                                                getCourseName(
                                                    selectedAdmission
                                                )
                                            }
                                            {" | "}
                                            Batch:{" "}
                                            {
                                                getBatchName(
                                                    selectedAdmission
                                                )
                                            }
                                            {" | "}
                                            Final Fee: ₹{" "}
                                            {formatCurrency(
                                                selectedAdmission.final_fee
                                            )}
                                        </small>
                                    )}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Payment Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="payment_date"
                                        className="form-control"
                                        value={
                                            formData.payment_date
                                        }
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Payment Mode *
                                    </label>

                                    <select
                                        name="payment_mode"
                                        className="form-select"
                                        value={
                                            formData.payment_mode
                                        }
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="CASH">
                                            Cash
                                        </option>

                                        <option value="UPI">
                                            UPI
                                        </option>

                                        <option value="CARD">
                                            Card
                                        </option>

                                        <option value="BANK_TRANSFER">
                                            Bank Transfer
                                        </option>

                                        <option value="CHEQUE">
                                            Cheque
                                        </option>

                                        <option value="OTHER">
                                            Other
                                        </option>
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Payment Status *
                                    </label>

                                    <select
                                        name="payment_status"
                                        className="form-select"
                                        value={
                                            formData.payment_status
                                        }
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="SUCCESS">
                                            Success
                                        </option>

                                        <option value="PENDING">
                                            Pending
                                        </option>

                                        <option value="FAILED">
                                            Failed
                                        </option>

                                        <option value="REFUNDED">
                                            Refunded
                                        </option>
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        Transaction Reference
                                        {requiresTransactionReference &&
                                            " *"}
                                    </label>

                                    <input
                                        type="text"
                                        name="transaction_reference"
                                        className="form-control"
                                        placeholder="Enter transaction/reference number"
                                        value={
                                            formData.transaction_reference
                                        }
                                        onChange={handleChange}
                                        required={
                                            requiresTransactionReference
                                        }
                                    />
                                </div>

                                <div className="col-12 mb-3">
                                    <label className="form-label fw-semibold">
                                        Remarks
                                    </label>

                                    <textarea
                                        name="remarks"
                                        className="form-control"
                                        rows="3"
                                        placeholder="Optional remarks"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                            </div>

                            <div className="d-flex justify-content-end gap-2">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        resetForm();
                                    }}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-success px-4"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Saving..."
                                        : "Save Payment"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">

                <div className="card-body p-4">

                    <div className="row g-3">

                        <div className="col-lg-6">

                            <label className="form-label fw-semibold">
                                Search
                            </label>

                            <div className="input-group">

                                <span className="input-group-text bg-white">
                                    <i className="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Receipt, admission, student, registration..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        <div className="col-lg-3">

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
                                <option value="ALL">
                                    All Statuses
                                </option>

                                <option value="SUCCESS">
                                    Success
                                </option>

                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="FAILED">
                                    Failed
                                </option>

                                <option value="REFUNDED">
                                    Refunded
                                </option>
                            </select>

                        </div>

                        <div className="col-lg-3">

                            <label className="form-label fw-semibold">
                                Payment Mode
                            </label>

                            <select
                                className="form-select"
                                value={paymentModeFilter}
                                onChange={(event) =>
                                    setPaymentModeFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="ALL">
                                    All Modes
                                </option>

                                <option value="CASH">
                                    Cash
                                </option>

                                <option value="UPI">
                                    UPI
                                </option>

                                <option value="CARD">
                                    Card
                                </option>

                                <option value="BANK_TRANSFER">
                                    Bank Transfer
                                </option>

                                <option value="CHEQUE">
                                    Cheque
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>
                            </select>

                        </div>

                    </div>

                </div>
            </div>

            {/* Fee Table */}
            <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-0">

                    {loading ? (
                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-success"
                                role="status"
                            ></div>

                            <p className="text-muted mt-3 mb-0">
                                Loading fee payments...
                            </p>

                        </div>
                    ) : filteredFees.length === 0 ? (
                        <div className="text-center py-5 px-3">

                            <i className="bi bi-receipt fs-1 text-muted"></i>

                            <h5 className="mt-3">
                                No fee payments found
                            </h5>

                            <p className="text-muted mb-0">
                                Start by collecting a fee payment.
                            </p>

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
                                            Receipt
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Admission
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Mode
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

                                    {filteredFees.map(
                                        (fee, index) => (
                                            <tr key={fee.id}>

                                                <td className="px-4">
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    <span className="fw-semibold">
                                                        {
                                                            fee.receipt_number
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div>
                                                        <span className="fw-semibold">
                                                            {
                                                                fee.student_name
                                                            }
                                                        </span>

                                                        <small className="d-block text-muted">
                                                            {
                                                                fee.registration_number
                                                            }
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    {
                                                        fee.admission_number
                                                    }
                                                </td>

                                                <td>
                                                    <span className="fw-semibold text-success">
                                                        ₹{" "}
                                                        {formatCurrency(
                                                            fee.amount
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        fee.payment_date
                                                    )}
                                                </td>

                                                <td>
                                                    {paymentModeLabel(
                                                        fee.payment_mode
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge rounded-pill ${paymentStatusBadge(
                                                            fee.payment_status
                                                        )}`}
                                                    >
                                                        {
                                                            fee.payment_status
                                                        }
                                                    </span>
                                                </td>

                                                <td className="text-end px-4">

                                                    <div className="d-flex justify-content-end gap-2">

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="View"
                                                            onClick={() =>
                                                                handleViewFee(
                                                                    fee.id
                                                                )
                                                            }
                                                            disabled={
                                                                detailLoading
                                                            }
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-warning"
                                                            title="Edit"
                                                            onClick={() =>
                                                                handleEditFee(
                                                                    fee.id
                                                                )
                                                            }
                                                            disabled={
                                                                detailLoading
                                                            }
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete"
                                                            onClick={() =>
                                                                handleDeleteFee(
                                                                    fee.id
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

            {/* View Modal */}
            {showViewModal && selectedFee && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className="modal-content border-0 shadow">

                            <div className="modal-header">

                                <h5 className="modal-title fw-bold">
                                    Fee Payment Details
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={
                                        closeViewModal
                                    }
                                ></button>

                            </div>

                            <div className="modal-body">

                                <div className="row g-4">

                                    <div className="col-md-6">
                                        <strong>
                                            Receipt Number
                                        </strong>

                                        <p className="mb-0">
                                            {
                                                selectedFee.receipt_number
                                            }
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Student
                                        </strong>

                                        <p className="mb-0">
                                            {
                                                selectedFee.student_name
                                            }
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Registration Number
                                        </strong>

                                        <p className="mb-0">
                                            {
                                                selectedFee.registration_number
                                            }
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Admission Number
                                        </strong>

                                        <p className="mb-0">
                                            {
                                                selectedFee.admission_number
                                            }
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Course
                                        </strong>

                                        <p className="mb-0">
                                            {
                                                selectedFee.course_name
                                            }
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Batch
                                        </strong>

                                        <p className="mb-0">
                                            {
                                                selectedFee.batch_name
                                            }
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Amount
                                        </strong>

                                        <p className="mb-0 text-success fw-bold">
                                            ₹{" "}
                                            {formatCurrency(
                                                selectedFee.amount
                                            )}
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Payment Date
                                        </strong>

                                        <p className="mb-0">
                                            {formatDate(
                                                selectedFee.payment_date
                                            )}
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Payment Mode
                                        </strong>

                                        <p className="mb-0">
                                            {paymentModeLabel(
                                                selectedFee.payment_mode
                                            )}
                                        </p>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>
                                            Payment Status
                                        </strong>

                                        <p className="mb-0">
                                            <span
                                                className={`badge rounded-pill ${paymentStatusBadge(
                                                    selectedFee.payment_status
                                                )}`}
                                            >
                                                {
                                                    selectedFee.payment_status
                                                }
                                            </span>
                                        </p>
                                    </div>

                                    <div className="col-12">
                                        <strong>
                                            Transaction Reference
                                        </strong>

                                        <p className="mb-0">
                                            {
                                                selectedFee.transaction_reference ||
                                                "-"
                                            }
                                        </p>
                                    </div>

                                    <div className="col-12">
                                        <strong>
                                            Remarks
                                        </strong>

                                        <p className="mb-0">
                                            {
                                                selectedFee.remarks ||
                                                "-"
                                            }
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedFee && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className="modal-content border-0 shadow">

                            <div className="modal-header">

                                <h5 className="modal-title fw-bold">
                                    Edit Fee Payment
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={
                                        closeEditModal
                                    }
                                    disabled={submitting}
                                ></button>

                            </div>

                            <form onSubmit={handleUpdateFee}>

                                <div className="modal-body">

                                    <div className="row">

                                        <div className="col-md-6 mb-3">

                                            <label className="form-label fw-semibold">
                                                Admission *
                                            </label>

                                            <select
                                                name="admission"
                                                className="form-select"
                                                value={
                                                    formData.admission
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Admission
                                                </option>

                                                {admissions.map(
                                                    (admission) => (
                                                        <option
                                                            key={
                                                                admission.id
                                                            }
                                                            value={
                                                                admission.id
                                                            }
                                                        >
                                                            {
                                                                admission.admission_number
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                getStudentName(
                                                                    admission
                                                                )
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                        </div>

                                        <div className="col-md-6 mb-3">

                                            <label className="form-label fw-semibold">
                                                Amount *
                                            </label>

                                            <input
                                                type="number"
                                                name="amount"
                                                className="form-control"
                                                min="0.01"
                                                step="0.01"
                                                value={
                                                    formData.amount
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>

                                        <div className="col-md-6 mb-3">

                                            <label className="form-label fw-semibold">
                                                Payment Date *
                                            </label>

                                            <input
                                                type="date"
                                                name="payment_date"
                                                className="form-control"
                                                value={
                                                    formData.payment_date
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>

                                        <div className="col-md-6 mb-3">

                                            <label className="form-label fw-semibold">
                                                Payment Mode *
                                            </label>

                                            <select
                                                name="payment_mode"
                                                className="form-select"
                                                value={
                                                    formData.payment_mode
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            >
                                                <option value="CASH">
                                                    Cash
                                                </option>

                                                <option value="UPI">
                                                    UPI
                                                </option>

                                                <option value="CARD">
                                                    Card
                                                </option>

                                                <option value="BANK_TRANSFER">
                                                    Bank Transfer
                                                </option>

                                                <option value="CHEQUE">
                                                    Cheque
                                                </option>

                                                <option value="OTHER">
                                                    Other
                                                </option>
                                            </select>

                                        </div>

                                        <div className="col-md-6 mb-3">

                                            <label className="form-label fw-semibold">
                                                Payment Status *
                                            </label>

                                            <select
                                                name="payment_status"
                                                className="form-select"
                                                value={
                                                    formData.payment_status
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            >
                                                <option value="SUCCESS">
                                                    Success
                                                </option>

                                                <option value="PENDING">
                                                    Pending
                                                </option>

                                                <option value="FAILED">
                                                    Failed
                                                </option>

                                                <option value="REFUNDED">
                                                    Refunded
                                                </option>
                                            </select>

                                        </div>

                                        <div className="col-md-6 mb-3">

                                            <label className="form-label fw-semibold">
                                                Transaction Reference
                                                {requiresTransactionReference &&
                                                    " *"}
                                            </label>

                                            <input
                                                type="text"
                                                name="transaction_reference"
                                                className="form-control"
                                                value={
                                                    formData.transaction_reference
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required={
                                                    requiresTransactionReference
                                                }
                                            />

                                        </div>

                                        <div className="col-12 mb-3">

                                            <label className="form-label fw-semibold">
                                                Remarks
                                            </label>

                                            <textarea
                                                name="remarks"
                                                className="form-control"
                                                rows="3"
                                                value={
                                                    formData.remarks
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            ></textarea>

                                        </div>

                                    </div>

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={
                                            closeEditModal
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4"
                                        disabled={
                                            submitting
                                        }
                                    >
                                        {submitting
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}