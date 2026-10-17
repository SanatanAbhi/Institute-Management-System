import React, { useEffect, useState } from "react";
import api from "../services/api";

const CenterStudents = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [detailLoading, setDetailLoading] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [deletingStudentId, setDeletingStudentId] = useState(null);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        father_name: "",
        mother_name: "",
        date_of_birth: "",
        gender: "MALE",
        email: "",
        phone: "",
        alternate_phone: "",
        address: "",
        state: "Bihar",
        district: "",
        city: "",
        pincode: "",
        course: "",
        batch: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        fetchStudents();
        fetchCourses();
        fetchBatches();
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
            setLoading(true);
            setError("");

            const response = await api.get("/students/center/");
            setStudents(response.data);
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Unable to load students.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get("/courses/");
            setCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await api.get("/batches/");
            setBatches(response.data);
        } catch (err) {
            console.error("Error fetching batches:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            username: "",
            password: "",
            first_name: "",
            last_name: "",
            father_name: "",
            mother_name: "",
            date_of_birth: "",
            gender: "MALE",
            email: "",
            phone: "",
            alternate_phone: "",
            address: "",
            state: "Bihar",
            district: "",
            city: "",
            pincode: "",
            course: "",
            batch: "",
            status: "ACTIVE",
        });
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const payload = {
                ...formData,
                course: Number(formData.course),
                batch: formData.batch ? Number(formData.batch) : null,
            };

            const response = await api.post(
                "/students/center/create/",
                payload
            );

            setSuccess(
                `Student ${response.data.registration_number} created successfully.`
            );

            resetForm();
            setShowAddForm(false);

            await fetchStudents();
        } catch (err) {
            console.error("Error creating student:", err);

            if (err.response?.data) {
                const backendErrors = err.response.data;

                const messages = Object.entries(backendErrors)
                    .map(([field, value]) => {
                        const message = Array.isArray(value)
                            ? value.join(", ")
                            : value;

                        return `${field}: ${message}`;
                    })
                    .join(" | ");

                setError(messages || "Unable to create student.");
            } else {
                setError("Unable to create student.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewStudent = async (studentId) => {
        try {
            setDetailLoading(true);
            setError("");

            const response = await api.get(`/students/center/${studentId}/`);
            setSelectedStudent(response.data);
            setShowViewModal(true);
        } catch (err) {
            console.error("Error fetching student details:", err);
            setError("Unable to load student details.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleEditStudent = async (studentId) => {
        try {
            setDetailLoading(true);
            setError("");

            const response = await api.get(`/students/center/${studentId}/`);
            const student = response.data;

            setSelectedStudent(student);

            setEditData({
                username: student.username || "",
                first_name: student.first_name || "",
                last_name: student.last_name || "",
                father_name: student.father_name || "",
                mother_name: student.mother_name || "",
                date_of_birth: student.date_of_birth || "",
                gender: student.gender || "MALE",
                email: student.email || "",
                phone: student.phone || "",
                alternate_phone: student.alternate_phone || "",
                address: student.address || "",
                state: student.state || "Bihar",
                district: student.district || "",
                city: student.city || "",
                pincode: student.pincode || "",
                course: student.course ? String(student.course) : "",
                batch: student.batch ? String(student.batch) : "",
                status: student.status || "ACTIVE",
            });

            setShowEditModal(true);
        } catch (err) {
            console.error("Error fetching student for edit:", err);
            setError("Unable to load student details for editing.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditData((prev) => {
            const updated = { ...prev, [name]: value };

            if (name === "course") {
                const currentBatch = batches.find(
                    (batch) =>
                        String(batch.id) === String(prev.batch)
                );

                if (
                    currentBatch &&
                    String(currentBatch.course) !== String(value)
                ) {
                    updated.batch = "";
                }
            }

            return updated;
        });
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();

        try {
            setEditSubmitting(true);
            setError("");
            setSuccess("");

            const payload = {
                first_name: editData.first_name,
                last_name: editData.last_name,
                father_name: editData.father_name,
                mother_name: editData.mother_name,
                date_of_birth: editData.date_of_birth,
                gender: editData.gender,
                email: editData.email,
                phone: editData.phone,
                alternate_phone: editData.alternate_phone,
                address: editData.address,
                state: editData.state,
                district: editData.district,
                city: editData.city,
                pincode: editData.pincode,
                course: Number(editData.course),
                batch: editData.batch
                    ? Number(editData.batch)
                    : null,
                status: editData.status,
            };

            const response = await api.patch(
                `/students/center/${selectedStudent.id}/`,
                payload
            );

            setSelectedStudent(response.data);
            setShowEditModal(false);

            setSuccess(
                `Student ${response.data.registration_number} updated successfully.`
            );

            await fetchStudents();
        } catch (err) {
            console.error("Error updating student:", err);

            if (err.response?.data) {
                const backendErrors = err.response.data;

                const messages = Object.entries(backendErrors)
                    .map(([field, value]) => {
                        const message = Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "object"
                            ? JSON.stringify(value)
                            : value;

                        return `${field}: ${message}`;
                    })
                    .join(" | ");

                setError(messages || "Unable to update student.");
            } else {
                setError("Unable to update student.");
            }
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDeleteStudent = async (student) => {
        const studentName = `${student.first_name || ""} ${
            student.last_name || ""
        }`.trim();

        const confirmed = window.confirm(
            `Are you sure you want to delete ${
                studentName || "this student"
            }?\n\nRegistration No: ${
                student.registration_number || "-"
            }\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingStudentId(student.id);
            setError("");
            setSuccess("");

            await api.delete(`/students/center/${student.id}/`);

            setSuccess(
                `Student ${
                    student.registration_number || studentName
                } deleted successfully.`
            );

            await fetchStudents();
        } catch (err) {
            console.error("Error deleting student:", err);

            if (err.response?.data) {
                const backendErrors = err.response.data;

                const messages = Object.entries(backendErrors)
                    .map(([field, value]) => {
                        const message = Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "object"
                            ? JSON.stringify(value)
                            : value;

                        return `${field}: ${message}`;
                    })
                    .join(" | ");

                setError(messages || "Unable to delete student.");
            } else {
                setError("Unable to delete student.");
            }
        } finally {
            setDeletingStudentId(null);
        }
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedStudent(null);
    };

    const closeEditModal = () => {
        if (!editSubmitting) {
            setShowEditModal(false);
            setSelectedStudent(null);
            setEditData({});
        }
    };

    const filteredStudents = students.filter((student) => {
        const searchText = search.toLowerCase();

        return (
            student.registration_number
                ?.toLowerCase()
                .includes(searchText) ||
            student.first_name
                ?.toLowerCase()
                .includes(searchText) ||
            student.last_name
                ?.toLowerCase()
                .includes(searchText) ||
            student.phone
                ?.toLowerCase()
                .includes(searchText) ||
            student.course_name
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    return (
        <>
            <div className="container-fluid py-4">

                {/* Page Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Students</h2>

                        <p className="text-muted mb-0">
                            Manage students registered under your center
                        </p>
                    </div>

                    <button
                        className="btn btn-success px-4"
                        onClick={() => {
                            setShowAddForm(true);
                            setSuccess("");
                            setError("");
                        }}
                    >
                        + Add Student
                    </button>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                {/* Add Student Form */}
                {showAddForm && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">
                                Register New Student
                            </h5>
                        </div>

                        <div className="card-body">

                            <form onSubmit={handleAddStudent}>

                                {/* Login Information */}
                                <h6 className="fw-bold mb-3">
                                    Student Login Information
                                </h6>

                                <div className="row">

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Username *
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            className="form-control"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Password *
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={handleChange}
                                            minLength="6"
                                            required
                                        />
                                    </div>

                                </div>

                                <hr />

                                {/* Personal Information */}
                                <h6 className="fw-bold mb-3">
                                    Personal Information
                                </h6>

                                <div className="row">

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            First Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="first_name"
                                            className="form-control"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            name="last_name"
                                            className="form-control"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Father's Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="father_name"
                                            className="form-control"
                                            value={formData.father_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Mother's Name
                                        </label>

                                        <input
                                            type="text"
                                            name="mother_name"
                                            className="form-control"
                                            value={formData.mother_name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">
                                            Date of Birth *
                                        </label>

                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            className="form-control"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">
                                            Gender *
                                        </label>

                                        <select
                                            name="gender"
                                            className="form-select"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="MALE">
                                                Male
                                            </option>

                                            <option value="FEMALE">
                                                Female
                                            </option>

                                            <option value="OTHER">
                                                Other
                                            </option>
                                        </select>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">
                                            Status *
                                        </label>

                                        <select
                                            name="status"
                                            className="form-select"
                                            value={formData.status}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="ACTIVE">
                                                Active
                                            </option>

                                            <option value="INACTIVE">
                                                Inactive
                                            </option>

                                            <option value="COMPLETED">
                                                Completed
                                            </option>

                                            <option value="DROPPED">
                                                Dropped
                                            </option>
                                        </select>
                                    </div>

                                </div>

                                <hr />

                                {/* Contact Information */}
                                <h6 className="fw-bold mb-3">
                                    Contact Information
                                </h6>

                                <div className="row">

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">
                                            Phone *
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">
                                            Alternate Phone
                                        </label>

                                        <input
                                            type="text"
                                            name="alternate_phone"
                                            className="form-control"
                                            value={formData.alternate_phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </div>

                                <hr />

                                {/* Address */}
                                <h6 className="fw-bold mb-3">
                                    Address Information
                                </h6>

                                <div className="row">

                                    <div className="col-12 mb-3">
                                        <label className="form-label">
                                            Address *
                                        </label>

                                        <textarea
                                            name="address"
                                            className="form-control"
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">
                                            State *
                                        </label>

                                        <input
                                            type="text"
                                            name="state"
                                            className="form-control"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">
                                            District *
                                        </label>

                                        <input
                                            type="text"
                                            name="district"
                                            className="form-control"
                                            value={formData.district}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">
                                            City *
                                        </label>

                                        <input
                                            type="text"
                                            name="city"
                                            className="form-control"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">
                                            Pincode *
                                        </label>

                                        <input
                                            type="text"
                                            name="pincode"
                                            className="form-control"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                </div>

                                <hr />

                                {/* Academic Information */}
                                <h6 className="fw-bold mb-3">
                                    Academic Information
                                </h6>

                                <div className="row">

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Course *
                                        </label>

                                        <select
                                            name="course"
                                            className="form-select"
                                            value={formData.course}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Select Course
                                            </option>

                                            {courses.map((course) => (
                                                <option
                                                    key={course.id}
                                                    value={course.id}
                                                >
                                                    {course.course_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Batch
                                        </label>

                                        <select
                                            name="batch"
                                            className="form-select"
                                            value={formData.batch}
                                            onChange={handleChange}
                                        >
                                            <option value="">
                                                Select Batch
                                            </option>

                                            {batches
                                                .filter(
                                                    (batch) =>
                                                        !formData.course ||
                                                        batch.course ===
                                                            Number(
                                                                formData.course
                                                            )
                                                )
                                                .map((batch) => (
                                                    <option
                                                        key={batch.id}
                                                        value={batch.id}
                                                    >
                                                        {batch.batch_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                </div>

                                {/* Form Buttons */}
                                <div className="d-flex justify-content-end gap-2 mt-3">

                                    <button
                                        type="button"
                                        className="btn btn-secondary px-4"
                                        onClick={() => {
                                            resetForm();
                                            setShowAddForm(false);
                                            setError("");
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
                                            ? "Registering..."
                                            : "Register Student"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

                {/* Search and Total */}
                {!showAddForm && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">

                            <div className="row align-items-center">

                                <div className="col-md-8">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by registration number, name, phone or course..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                    <span className="text-muted">
                                        Total Students:{" "}
                                        <strong>
                                            {students.length}
                                        </strong>
                                    </span>
                                </div>

                            </div>

                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">

                            <div
                                className="spinner-border text-success mb-3"
                                role="status"
                            ></div>

                            <p className="text-muted mb-0">
                                Loading students...
                            </p>

                        </div>
                    </div>
                ) : filteredStudents.length === 0 ? (

                    /* Empty State */
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">

                            <div
                                className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    fontSize: "30px",
                                }}
                            >
                                👨‍🎓
                            </div>

                            <h5 className="fw-bold">
                                {search
                                    ? "No students found"
                                    : "No students registered yet"}
                            </h5>

                            <p className="text-muted mb-3">
                                {search
                                    ? "Try searching with a different keyword."
                                    : "Students registered under this center will appear here."}
                            </p>

                            {!search && !showAddForm && (
                                <button
                                    className="btn btn-success px-4"
                                    onClick={() => {
                                        setShowAddForm(true);
                                        setSuccess("");
                                        setError("");
                                    }}
                                >
                                    + Add Student
                                </button>
                            )}

                        </div>
                    </div>

                ) : (

                    /* Students Table */
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">

                            <div className="table-responsive">

                                <table className="table table-hover align-middle mb-0">

                                    <thead className="table-light">

                                        <tr>
                                            <th className="px-4">
                                                Registration No.
                                            </th>

                                            <th>
                                                Student Name
                                            </th>

                                            <th>
                                                Phone
                                            </th>

                                            <th>
                                                Course
                                            </th>

                                            <th>
                                                Batch
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th className="text-center">
                                                Action
                                            </th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredStudents.map((student) => (
                                            <tr key={student.id}>

                                                <td className="px-4 fw-semibold">
                                                    {student.registration_number}
                                                </td>

                                                <td>
                                                    {student.first_name}{" "}
                                                    {student.last_name}
                                                </td>

                                                <td>
                                                    {student.phone}
                                                </td>

                                                <td>
                                                    {student.course_name || "-"}
                                                </td>

                                                <td>
                                                    {student.batch_name || "-"}
                                                </td>

                                                <td>

                                                    <span
                                                        className={`badge ${
                                                            student.status ===
                                                            "ACTIVE"
                                                                ? "text-bg-success"
                                                                : "text-bg-secondary"
                                                        }`}
                                                    >
                                                        {student.status}
                                                    </span>

                                                </td>

                                                <td className="text-center">

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success me-2"
                                                        onClick={() =>
                                                            handleViewStudent(
                                                                student.id
                                                            )
                                                        }
                                                        disabled={
                                                            detailLoading ||
                                                            deletingStudentId !==
                                                                null
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() =>
                                                            handleEditStudent(
                                                                student.id
                                                            )
                                                        }
                                                        disabled={
                                                            detailLoading ||
                                                            deletingStudentId !==
                                                                null
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            handleDeleteStudent(
                                                                student
                                                            )
                                                        }
                                                        disabled={
                                                            deletingStudentId !==
                                                                null
                                                        }
                                                    >
                                                        {deletingStudentId ===
                                                        student.id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>

                                                </td>

                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        </div>
                    </div>
                )}

            </div>

            {/* View Student Modal */}
            {showViewModal && selectedStudent && (
                <div
                    className="d-flex align-items-start justify-content-center"
                    tabIndex="-1"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        backgroundColor: "#ffffff",
                        overflowY: "auto",
                        padding: "30px 15px",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "900px",
                            margin: "0 auto",
                        }}
                    >
                        <div className="modal-content border-0 shadow">

                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">
                                    Student Details
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeViewModal}
                                ></button>
                            </div>

                            <div
                                className="modal-body"
                                style={{
                                    maxHeight:
                                        "calc(100vh - 190px)",
                                    overflowY: "auto",
                                }}
                            >
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <strong>
                                            Registration No.
                                        </strong>
                                        <div>
                                            {selectedStudent.registration_number ||
                                                "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Username</strong>
                                        <div>
                                            {selectedStudent.username || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Student Name</strong>
                                        <div>
                                            {selectedStudent.first_name ||
                                                "-"}{" "}
                                            {selectedStudent.last_name || ""}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Father's Name</strong>
                                        <div>
                                            {selectedStudent.father_name ||
                                                "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Mother's Name</strong>
                                        <div>
                                            {selectedStudent.mother_name ||
                                                "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <strong>Date of Birth</strong>
                                        <div>
                                            {selectedStudent.date_of_birth ||
                                                "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <strong>Gender</strong>
                                        <div>
                                            {selectedStudent.gender || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Email</strong>
                                        <div>
                                            {selectedStudent.email || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <strong>Phone</strong>
                                        <div>
                                            {selectedStudent.phone || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <strong>Alternate Phone</strong>
                                        <div>
                                            {selectedStudent.alternate_phone ||
                                                "-"}
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <strong>Address</strong>
                                        <div>
                                            {selectedStudent.address || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <strong>State</strong>
                                        <div>
                                            {selectedStudent.state || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <strong>District</strong>
                                        <div>
                                            {selectedStudent.district || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <strong>City</strong>
                                        <div>
                                            {selectedStudent.city || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <strong>Pincode</strong>
                                        <div>
                                            {selectedStudent.pincode || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Course</strong>
                                        <div>
                                            {selectedStudent.course_name ||
                                                "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Batch</strong>
                                        <div>
                                            {selectedStudent.batch_name || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Status</strong>
                                        <div>
                                            {selectedStudent.status || "-"}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <strong>Admission Date</strong>
                                        <div>
                                            {selectedStudent.admission_date ||
                                                "-"}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeViewModal}
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {showEditModal && selectedStudent && (
                <div
                    className="d-flex align-items-start justify-content-center"
                    tabIndex="-1"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1055,
                        backgroundColor: "#ffffff",
                        overflowY: "auto",
                        padding: "20px 15px",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "1100px",
                            margin: "0 auto",
                        }}
                    >
                        <div className="modal-content border-0 shadow">

                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    Edit Student
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeEditModal}
                                    disabled={editSubmitting}
                                ></button>
                            </div>

                            <form onSubmit={handleUpdateStudent}>

                                <div
                                    className="modal-body"
                                    style={{
                                        maxHeight:
                                            "calc(100vh - 150px)",
                                        overflowY: "auto",
                                    }}
                                >
                                    <div className="row g-3">

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Username
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                value={
                                                    editData.username || ""
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Registration No.
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                value={
                                                    selectedStudent.registration_number ||
                                                    ""
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                First Name *
                                            </label>

                                            <input
                                                type="text"
                                                name="first_name"
                                                className="form-control"
                                                value={
                                                    editData.first_name || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Last Name
                                            </label>

                                            <input
                                                type="text"
                                                name="last_name"
                                                className="form-control"
                                                value={
                                                    editData.last_name || ""
                                                }
                                                onChange={handleEditChange}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Father's Name *
                                            </label>

                                            <input
                                                type="text"
                                                name="father_name"
                                                className="form-control"
                                                value={
                                                    editData.father_name || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Mother's Name
                                            </label>

                                            <input
                                                type="text"
                                                name="mother_name"
                                                className="form-control"
                                                value={
                                                    editData.mother_name || ""
                                                }
                                                onChange={handleEditChange}
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Date of Birth *
                                            </label>

                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                className="form-control"
                                                value={
                                                    editData.date_of_birth ||
                                                    ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Gender *
                                            </label>

                                            <select
                                                name="gender"
                                                className="form-select"
                                                value={
                                                    editData.gender || "MALE"
                                                }
                                                onChange={handleEditChange}
                                                required
                                            >
                                                <option value="MALE">
                                                    Male
                                                </option>

                                                <option value="FEMALE">
                                                    Female
                                                </option>

                                                <option value="OTHER">
                                                    Other
                                                </option>
                                            </select>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label">
                                                Status *
                                            </label>

                                            <select
                                                name="status"
                                                className="form-select"
                                                value={
                                                    editData.status ||
                                                    "ACTIVE"
                                                }
                                                onChange={handleEditChange}
                                                required
                                            >
                                                <option value="ACTIVE">
                                                    Active
                                                </option>

                                                <option value="INACTIVE">
                                                    Inactive
                                                </option>

                                                <option value="COMPLETED">
                                                    Completed
                                                </option>

                                                <option value="DROPPED">
                                                    Dropped
                                                </option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Email
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                value={
                                                    editData.email || ""
                                                }
                                                onChange={handleEditChange}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Phone *
                                            </label>

                                            <input
                                                type="text"
                                                name="phone"
                                                className="form-control"
                                                value={
                                                    editData.phone || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Alternate Phone
                                            </label>

                                            <input
                                                type="text"
                                                name="alternate_phone"
                                                className="form-control"
                                                value={
                                                    editData.alternate_phone ||
                                                    ""
                                                }
                                                onChange={handleEditChange}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">
                                                Address *
                                            </label>

                                            <textarea
                                                name="address"
                                                className="form-control"
                                                rows="3"
                                                value={
                                                    editData.address || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">
                                                State *
                                            </label>

                                            <input
                                                type="text"
                                                name="state"
                                                className="form-control"
                                                value={
                                                    editData.state || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">
                                                District *
                                            </label>

                                            <input
                                                type="text"
                                                name="district"
                                                className="form-control"
                                                value={
                                                    editData.district || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">
                                                City *
                                            </label>

                                            <input
                                                type="text"
                                                name="city"
                                                className="form-control"
                                                value={
                                                    editData.city || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Pincode *
                                            </label>

                                            <input
                                                type="text"
                                                name="pincode"
                                                className="form-control"
                                                value={
                                                    editData.pincode || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Admission Date
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                value={
                                                    selectedStudent.admission_date ||
                                                    ""
                                                }
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Course *
                                            </label>

                                            <select
                                                name="course"
                                                className="form-select"
                                                value={
                                                    editData.course || ""
                                                }
                                                onChange={handleEditChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Course
                                                </option>

                                                {courses.map((course) => (
                                                    <option
                                                        key={course.id}
                                                        value={course.id}
                                                    >
                                                        {
                                                            course.course_name
                                                        }
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Batch
                                            </label>

                                            <select
                                                name="batch"
                                                className="form-select"
                                                value={
                                                    editData.batch || ""
                                                }
                                                onChange={handleEditChange}
                                            >
                                                <option value="">
                                                    Select Batch
                                                </option>

                                                {batches
                                                    .filter(
                                                        (batch) =>
                                                            !editData.course ||
                                                            batch.course ===
                                                                Number(
                                                                    editData.course
                                                                )
                                                    )
                                                    .map((batch) => (
                                                        <option
                                                            key={batch.id}
                                                            value={batch.id}
                                                        >
                                                            {
                                                                batch.batch_name
                                                            }
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                    </div>
                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeEditModal}
                                        disabled={editSubmitting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={editSubmitting}
                                    >
                                        {editSubmitting
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default CenterStudents;