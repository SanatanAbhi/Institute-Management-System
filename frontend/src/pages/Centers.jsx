
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CenterCard from "../components/CenterCard";


const initialForm = {
    center_name: "",
    owner_name: "",
    email: "",
    phone: "",
    address: "",
    state: "Bihar",
    district: "PTN",
    city: "",
    pincode: "",
    password: "",
    owner_photo: null,
    logo: null,

    // Membership fields
    status: "PENDING",
    expiry_date: "",
    is_lifetime: false,
};

export default function Centers() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");
    const [createdUsername, setCreatedUsername] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editingCenterId, setEditingCenterId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState("");


    const navigate = useNavigate();

    function loadCenters() {
        setLoading(true);
        setError("");

        api.get("/centers/")
            .then((response) => {
                setCenters(response.data);
            })
            .catch((err) => {
                console.error("Unable to load centers:", err);
                setError("Unable to load centers.");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        loadCenters();
    }, []);


    function handleChange(event) {
        const { name, value, files, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "file"
                    ? files?.[0] || null
                    : type === "checkbox"
                        ? checked
                        : value,
        }));
    }


    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setFormError("");
        setSuccess("");

        try {
            const data = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (value === null || value === "") return;

                if (typeof value === "boolean") {
                    data.append(key, String(value));
                } else {
                    data.append(key, value);
                }
            });

            const response = await api.post("/centers/", data);

            setSuccess(
                `Center "${response.data.center_name}" created successfully.`
            );

            setCreatedUsername(response.data.created_username || "");

            setForm(initialForm);
            loadCenters();
        } catch (err) {
            console.error("Unable to create center:", err);

            const details = err.response?.data;
            if (details && typeof details === "object") {
                const messages = Object.entries(details).map(
                    ([field, value]) => {
                        const message = Array.isArray(value)
                            ? value.join(" ")
                            : typeof value === "string"
                                ? value
                                : JSON.stringify(value);

                        return `${field}: ${message}`;
                    }
                );

                setFormError(
                    messages.join(" ") || "Unable to create center."
                );
            } else {
                setFormError(
                    "Unable to create center. Check your connection and try again."
                );
            }
        } finally {
            setSaving(false);
        }
    }


async function handleEditCenter(centerId) {
    setEditingCenterId(centerId);
    setEditLoading(true);
    setEditError("");
    setEditForm({});

    try {
        const response = await api.get(`/centers/${centerId}/`);
        const center = response.data;

        setEditForm({
            center_name: center.center_name || "",
            owner_name: center.owner_name || "",
            email: center.email || "",
            phone: center.phone || "",
            address: center.address || "",
            state: center.state || "",
            district: center.district || "PTN",
            city: center.city || "",
            pincode: center.pincode || "",
            status: center.status || "PENDING",
            expiry_date: center.expiry_date || "",
            is_lifetime: Boolean(center.is_lifetime),
            owner_photo: null,
            logo: null,
        });
    } catch (err) {
        console.error("Unable to load center for editing:", err);
        setEditError("Unable to load center details. Please try again.");
    } finally {
        setEditLoading(false);
    }
}

function handleEditChange(event) {
    const { name, value, files } = event.target;

    setEditForm((previous) => ({
        ...previous,
        [name]: event.target.type === "file"
            ? files?.[0] || null
            : name === "is_lifetime"
                ? value === "true"
                : value,
    }));
}

async function handleUpdateCenter(event) {
    event.preventDefault();

    if (editingCenterId === null) return;

    setEditSaving(true);
    setEditError("");

    try {
        const data = new FormData();

        Object.entries(editForm).forEach(([key, value]) => {
            if (key === "expiry_date" && editForm.is_lifetime) {
                data.append(key, "");
                return;
            }

            if (value === null) return;

            if (typeof value === "boolean") {
                data.append(key, String(value));
            } else {
                data.append(key, value);
            }
        });

        await api.patch(`/centers/${editingCenterId}/`, data);

        setEditingCenterId(null);
        setEditForm({});
        loadCenters();
    } catch (err) {
        console.error("Unable to update center:", err);

        const details = err.response?.data;

        if (details && typeof details === "object") {
            setEditError(
                Object.entries(details)
                    .map(([field, value]) => {
                        const message = Array.isArray(value)
                            ? value.join(" ")
                            : typeof value === "string"
                                ? value
                                : JSON.stringify(value);

                        return `${field}: ${message}`;
                    })
                    .join(" ")
            );
        } else {
            setEditError("Unable to update center. Please try again.");
        }
    } finally {
        setEditSaving(false);
    }
}


    return (
        <section className="py-5" id="centers">
            <div className="container">
                <div className="mb-4">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/super-admin-dashboard")}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Dashboard
                    </button>
                </div>

                <div className="text-center mb-5">
                    <h2 className="text-primary fw-bold">
                        Training Centers Management
                    </h2>
                    <p className="text-secondary">
                        Add and manage Acharya Skill Mission training centers.
                    </p>
                </div>

                {/* Add Center Form */}
                <div className="card shadow-sm border-0 mb-5">
                    <div className="card-header bg-primary text-white py-3">
                        <h5 className="mb-0">
                            <i className="bi bi-building-add me-2"></i>
                            Add Training Center
                        </h5>
                    </div>

                    <div className="card-body p-3 p-md-4">
                        {formError && (
                            <div className="alert alert-danger" role="alert">
                                {formError}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success" role="alert">
                                <p className="mb-2">{success}</p>

                                {createdUsername && (
                                    <div>
                                        <strong>Center Login Username:</strong>{" "}
                                        <code>{createdUsername}</code>


                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-success ms-3"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(createdUsername);
                                                    setSuccessMessage("Username copied successfully!");
                                                } catch (error) {
                                                    console.error("Failed to copy username:", error);
                                                    setSuccessMessage(
                                                        "Unable to copy. Please copy the username manually."
                                                    );
                                                }
                                            }}
                                        >
                                            <i className="bi bi-clipboard me-1"></i>
                                            Copy Username
                                        </button>

                                        {successMessage && (
                                            <span className="ms-2 text-success fw-semibold" role="status">
                                                {successMessage}
                                            </span>
                                        )}

                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Center Name *
                                    </label>
                                    <input
                                        className="form-control"
                                        name="center_name"
                                        value={form.center_name}
                                        onChange={handleChange}
                                        required
                                        maxLength={200}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Owner Name *
                                    </label>
                                    <input
                                        className="form-control"
                                        name="owner_name"
                                        value={form.owner_name}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Center Email *
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                        maxLength={15}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Address *
                                    </label>
                                    <textarea
                                        className="form-control"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        rows="2"
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        State *
                                    </label>
                                    <input
                                        className="form-control"
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        District *
                                    </label>
                                    <select
                                        className="form-select"
                                        name="district"
                                        value={form.district}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="PTN">Patna</option>
                                        <option value="GYA">Gaya</option>
                                        <option value="MUZ">Muzaffarpur</option>
                                        <option value="BGP">Bhagalpur</option>
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        City *
                                    </label>
                                    <input
                                        className="form-control"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        PIN Code *
                                    </label>
                                    <input
                                        className="form-control"
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                    />
                                </div>

                                {/* Center Status */}
                                <div className="col-md-6">
                                    <label className="form-label">Center Status *</label>
                                    <select
                                        name="status"
                                        className="form-select"
                                        value={form.status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="SUSPENDED">Suspended</option>
                                        <option value="EXPIRED">Expired</option>
                                    </select>
                                </div>

                                {/* Membership Type */}
                                <div className="col-md-6">
                                    <label className="form-label">Membership Type *</label>
                                    <select
                                        name="is_lifetime"
                                        className="form-select"
                                        value={form.is_lifetime ? "true" : "false"}
                                        onChange={(event) =>
                                            setForm((previous) => ({
                                                ...previous,
                                                is_lifetime: event.target.value === "true",
                                                expiry_date: event.target.value === "true"
                                                    ? ""
                                                    : previous.expiry_date,
                                            }))
                                        }
                                        required
                                    >
                                        <option value="false">Regular Membership</option>
                                        <option value="true">Lifetime Membership</option>
                                    </select>
                                </div>

                                {/* Expiry Date */}
                                {!form.is_lifetime && (
                                    <div className="col-md-6">
                                        <label className="form-label">Expiry Date (optional)</label>
                                        <input
                                            type="date"
                                            name="expiry_date"
                                            className="form-control"
                                            value={form.expiry_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Initial Password *
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <small className="text-secondary">
                                        The password must satisfy your Django
                                        password-validation rules.
                                    </small>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Owner Photo (optional)
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="owner_photo"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Center Logo (optional)
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="logo"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12 mt-4 d-grid d-sm-flex">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    aria-hidden="true"
                                                ></span>
                                                Creating Center...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Create Training Center
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>


                {/* Edit Center Modal */}
                {editingCenterId !== null && (
                    <div
                        className="modal d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable mx-2 mx-sm-auto">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Edit Training Center</h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        aria-label="Close"
                                        onClick={() => {
                                            setEditingCenterId(null);
                                            setEditError("");
                                        }}
                                    />
                                </div>

                                <div className="modal-body">
                                    {editLoading && (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" />
                                            <p className="mt-2">Loading center details...</p>
                                        </div>
                                    )}

                                    {editError && (
                                        <div className="alert alert-danger">
                                            {editError}
                                        </div>
                                    )}

                                    {!editLoading && Object.keys(editForm).length > 0 && (
                                        <form id="edit-center-form" onSubmit={handleUpdateCenter}>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Center Name *</label>
                                                    <input
                                                        className="form-control"
                                                        name="center_name"
                                                        value={editForm.center_name}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Owner Name *</label>
                                                    <input
                                                        className="form-control"
                                                        name="owner_name"
                                                        value={editForm.owner_name}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Email *</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="email"
                                                        value={editForm.email}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Phone *</label>
                                                    <input
                                                        className="form-control"
                                                        name="phone"
                                                        value={editForm.phone}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label">Address *</label>
                                                    <textarea
                                                        className="form-control"
                                                        name="address"
                                                        value={editForm.address}
                                                        onChange={handleEditChange}
                                                        rows="2"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label">State *</label>
                                                    <input
                                                        className="form-control"
                                                        name="state"
                                                        value={editForm.state}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label">District *</label>
                                                    <select
                                                        className="form-select"
                                                        name="district"
                                                        value={editForm.district}
                                                        onChange={handleEditChange}
                                                        required
                                                    >
                                                        <option value="PTN">Patna</option>
                                                        <option value="GYA">Gaya</option>
                                                        <option value="MUZ">Muzaffarpur</option>
                                                        <option value="BGP">Bhagalpur</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label">City *</label>
                                                    <input
                                                        className="form-control"
                                                        name="city"
                                                        value={editForm.city}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">PIN Code *</label>
                                                    <input
                                                        className="form-control"
                                                        name="pincode"
                                                        value={editForm.pincode}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Center Status *</label>
                                                    <select
                                                        className="form-select"
                                                        name="status"
                                                        value={editForm.status}
                                                        onChange={handleEditChange}
                                                        required
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="INACTIVE">Inactive</option>
                                                        <option value="SUSPENDED">Suspended</option>
                                                        <option value="EXPIRED">Expired</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Membership Type *</label>
                                                    <select
                                                        className="form-select"
                                                        name="is_lifetime"
                                                        value={editForm.is_lifetime ? "true" : "false"}
                                                        onChange={handleEditChange}
                                                        required
                                                    >
                                                        <option value="false">Regular Membership</option>
                                                        <option value="true">Lifetime Membership</option>
                                                    </select>
                                                </div>

                                                {!editForm.is_lifetime && (
                                                    <div className="col-md-6">
                                                        <label className="form-label">Expiry Date (optional)</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            name="expiry_date"
                                                            value={editForm.expiry_date}
                                                            onChange={handleEditChange}
                                                        />
                                                    </div>
                                                )}

                                                <div className="col-md-6">
                                                    <label className="form-label">Owner Photo (optional)</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        name="owner_photo"
                                                        accept="image/*"
                                                        onChange={handleEditChange}
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Center Logo (optional)</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        name="logo"
                                                        accept="image/*"
                                                        onChange={handleEditChange}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setEditingCenterId(null);
                                            setEditError("");
                                        }}
                                        disabled={editSaving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        form="edit-center-form"
                                        className="btn btn-primary"
                                        disabled={editLoading || editSaving || Object.keys(editForm).length === 0}
                                    >
                                        {editSaving ? "Saving Changes..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Existing Centers */}
                <div className="mb-4">
                    <h3 className="fw-bold">Existing Training Centers</h3>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-secondary fw-semibold">
                            Loading Centers...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger text-center">
                        {error}
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-3"
                            onClick={loadCenters}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && centers.length === 0 && (
                    <div className="alert alert-warning text-center">
                        No Centers Available.
                    </div>
                )}

                {!loading && !error && centers.length > 0 && (
                    <div className="row g-4">


                    {centers.map((center) => (
                        <CenterCard
                            key={center.id}
                            id={center.id}
                            center_name={center.center_name}
                            center_code={center.center_code}
                            city={center.city}
                            state={center.state}
                            onEdit={handleEditCenter}
                        />
                    ))}


                    </div>
                )}
            </div>
        </section>
    );
}
