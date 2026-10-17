import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import SuperAdminLayout from "../router/SuperAdminLayout";


const emptyForm = {
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "CENTER",
    is_active: true,
    password: "",
};


function getApiError(error) {
    const data = error.response?.data;

    if (!data) {
        return "Unable to connect to the server.";
    }

    if (typeof data.detail === "string") {
        return data.detail;
    }

    if (typeof data === "string") {
        return data;
    }

    return Object.entries(data)
        .map(([field, messages]) => {
            const text = Array.isArray(messages)
                ? messages.join(" ")
                : typeof messages === "string"
                    ? messages
                    : JSON.stringify(messages);

            return `${field}: ${text}`;
        })
        .join(" | ");
}


function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString();
}


export default function SuperAdminUsers() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const loadUsers = useCallback(async (query = "") => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response = await api.get("/accounts/users/", {
                params: query ? { search: query } : {},
            });

            const data = response.data;

            setUsers(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.results)
                        ? data.results
                        : []
            );
        } catch (error) {
            setErrorMessage(getApiError(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers(searchTerm);
    }, [loadUsers, searchTerm]);

    function openCreateForm() {
        setEditingUser(null);
        setForm({ ...emptyForm });
        setMessage("");
        setErrorMessage("");
        setFormOpen(true);
    }

    function openEditForm(user) {
        setEditingUser(user);

        setForm({
            username: user.username || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            role: user.role || "STUDENT",
            is_active: Boolean(user.is_active),
            password: "",
        });

        setMessage("");
        setErrorMessage("");
        setFormOpen(true);
    }

    function closeForm() {
        if (saving) {
            return;
        }

        setFormOpen(false);
        setEditingUser(null);
        setForm({ ...emptyForm });
    }

    function updateField(event) {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSave(event) {
        event.preventDefault();

        setSaving(true);
        setMessage("");
        setErrorMessage("");

        try {
            const payload = {
                ...form,
            };

            if (!payload.password) {
                delete payload.password;
            }

            if (editingUser) {
                await api.patch(
                    `/accounts/users/${editingUser.id}/`,
                    payload
                );

                setMessage("User account updated successfully.");
            } else {
                await api.post("/accounts/users/", payload);

                setMessage("User account created successfully.");
            }

            setFormOpen(false);
            setEditingUser(null);
            setForm({ ...emptyForm });

            await loadUsers(searchTerm);
        } catch (error) {
            setErrorMessage(getApiError(error));
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(user) {
        const confirmed = window.confirm(
            `Delete the user account "${user.username}"? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setErrorMessage("");

        try {
            await api.delete(`/accounts/users/${user.id}/`);

            setMessage("User account deleted successfully.");

            await loadUsers(searchTerm);
        } catch (error) {
            setErrorMessage(getApiError(error));
        }
    }

    async function handleSearch(event) {
        event.preventDefault();
        setSearchTerm(searchInput.trim());
    }

    return (
        <SuperAdminLayout active="users">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1">
                        User Management
                    </h3>
                    <p className="text-muted mb-0">
                        Manage the login accounts and roles used across the IMS.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-success"
                    onClick={openCreateForm}
                >
                    <i className="bi bi-person-plus me-2"></i>
                    Add User
                </button>
            </div>

            {message && (
                <div className="alert alert-success alert-dismissible">
                    {message}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage("")}
                    ></button>
                </div>
            )}

            {errorMessage && (
                <div className="alert alert-danger alert-dismissible">
                    {errorMessage}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setErrorMessage("")}
                    ></button>
                </div>
            )}

            <div
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: "16px" }}
            >
                <div className="card-body p-4">
                    <form
                        className="row g-3 align-items-end"
                        onSubmit={handleSearch}
                    >
                        <div className="col-md-8">
                            <label className="form-label fw-semibold">
                                Search accounts
                            </label>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Username, name or email..."
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                            />
                        </div>

                        <div className="col-md-4 d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-dark flex-grow-1"
                            >
                                <i className="bi bi-search me-2"></i>
                                Search
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setSearchInput("");
                                    setSearchTerm("");
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div
                className="card border-0 shadow-sm"
                style={{ borderRadius: "16px" }}
            >
                <div className="card-body p-0">
                    <div className="p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold mb-1">
                                System Accounts
                            </h5>
                            <small className="text-muted">
                                Accounts returned by the administrative API
                            </small>
                        </div>

                        <span className="badge text-bg-light border fs-6">
                            {users.length} shown
                        </span>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Account</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th className="pe-4 text-end">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {!loading && users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center text-muted py-5"
                                        >
                                            No matching user accounts found.
                                        </td>
                                    </tr>
                                )}

                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="ps-4">
                                            <div className="fw-semibold">
                                                {user.username}
                                            </div>
                                            <small className="text-muted">
                                                ID: {user.id}
                                            </small>
                                        </td>

                                        <td>
                                            {[user.first_name, user.last_name]
                                                .filter(Boolean)
                                                .join(" ") || "—"}
                                        </td>

                                        <td>{user.email || "—"}</td>

                                        <td>
                                            <span className="badge text-bg-light border">
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`badge ${
                                                    user.is_active
                                                        ? "text-bg-success"
                                                        : "text-bg-secondary"
                                                }`}
                                            >
                                                {user.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>{formatDate(user.date_joined)}</td>

                                        <td className="pe-4 text-end">
                                            <div className="d-inline-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Edit user"
                                                    onClick={() =>
                                                        openEditForm(user)
                                                    }
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete user"
                                                    onClick={() =>
                                                        handleDelete(user)
                                                    }
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {loading && (
                        <div className="text-center p-4 text-muted">
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Loading accounts...
                        </div>
                    )}
                </div>
            </div>

            <div className="alert alert-info mt-4 small">
                <i className="bi bi-info-circle me-2"></i>
                This page manages login accounts. Creating a CENTER or STUDENT
                account here does not automatically create its linked center or
                student profile. We'll connect those workflows as part of
                Center Management.
            </div>

            {/* User form */}
            {formOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
                    style={{
                        backgroundColor: "rgba(15, 23, 42, 0.55)",
                        zIndex: 2000,
                        overflowY: "auto",
                    }}
                >
                    <div
                        className="bg-white shadow-lg w-100"
                        style={{
                            maxWidth: "650px",
                            borderRadius: "18px",
                            maxHeight: "92vh",
                            overflowY: "auto",
                        }}
                    >
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold mb-1">
                                    {editingUser
                                        ? "Edit User Account"
                                        : "Create User Account"}
                                </h5>
                                <small className="text-muted">
                                    Enter the account details below.
                                </small>
                            </div>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={closeForm}
                                disabled={saving}
                            ></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Username *
                                        </label>
                                        <input
                                            className="form-control"
                                            name="username"
                                            value={form.username}
                                            onChange={updateField}
                                            required
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Role *
                                        </label>
                                        <select
                                            className="form-select"
                                            name="role"
                                            value={form.role}
                                            onChange={updateField}
                                            required
                                        >
                                            <option value="SUPER_ADMIN">
                                                Super Admin
                                            </option>
                                            <option value="CENTER">
                                                Center
                                            </option>
                                            <option value="STUDENT">
                                                Student
                                            </option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            First Name
                                        </label>
                                        <input
                                            className="form-control"
                                            name="first_name"
                                            value={form.first_name}
                                            onChange={updateField}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Last Name
                                        </label>
                                        <input
                                            className="form-control"
                                            name="last_name"
                                            value={form.last_name}
                                            onChange={updateField}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-semibold">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={form.email}
                                            onChange={updateField}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-semibold">
                                            {editingUser
                                                ? "New Password (optional)"
                                                : "Password *"}
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={form.password}
                                            onChange={updateField}
                                            required={!editingUser}
                                            autoComplete="new-password"
                                        />
                                        <small className="text-muted">
                                            {editingUser
                                                ? "Leave blank to keep the current password."
                                                : "Use a strong password that meets the server's password rules."}
                                        </small>
                                    </div>

                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                name="is_active"
                                                id="userActive"
                                                checked={form.is_active}
                                                onChange={updateField}
                                            />
                                            <label
                                                className="form-check-label fw-semibold"
                                                htmlFor="userActive"
                                            >
                                                Account active
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-top d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check2-circle me-2"></i>
                                            {editingUser
                                                ? "Save Changes"
                                                : "Create Account"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mt-4">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/super-admin-dashboard")}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Overview
                </button>
            </div>
        </SuperAdminLayout>
    );
}