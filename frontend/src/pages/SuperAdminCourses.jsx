import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import SuperAdminLayout from "../router/SuperAdminLayout";

const emptyForm = { course_code: "", course_name: "", duration: "", fee: "", status: "ACTIVE" };

function errorText(error) {
    const data = error.response?.data;
    if (!data) return "Unable to connect to the server.";
    if (typeof data.detail === "string") return data.detail;
    if (typeof data === "string") return data;
    return Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : JSON.stringify(value)}`).join(" | ");
}

export default function SuperAdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");

    const loadCourses = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/courses/");
            const data = response.data;
            setCourses(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            setError(errorText(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadCourses(); }, [loadCourses]);

    function openCreate() {
        setEditing(null);
        setForm({ ...emptyForm });
        setNotice(""); setError(""); setFormOpen(true);
    }

    function openEdit(course) {
        setEditing(course);
        setForm({ course_code: course.course_code || "", course_name: course.course_name || "", duration: course.duration || "", fee: String(course.fee ?? ""), status: course.status || "ACTIVE" });
        setNotice(""); setError(""); setFormOpen(true);
    }

    async function saveCourse(event) {
        event.preventDefault(); setSaving(true); setError(""); setNotice("");
        const payload = { ...form, fee: Number(form.fee) };
        try {
            if (editing) await api.patch(`/courses/${editing.id}/`, payload);
            else await api.post("/courses/", payload);
            setNotice(editing ? "Course updated successfully." : "Course created successfully.");
            setFormOpen(false); setEditing(null); setForm({ ...emptyForm });
            await loadCourses();
        } catch (err) { setError(errorText(err)); }
        finally { setSaving(false); }
    }

    async function deleteCourse(course) {
        if (!window.confirm(`Delete course "${course.course_name}"? This may be blocked if batches or other records use it.`)) return;
        setError(""); setNotice("");
        try { await api.delete(`/courses/${course.id}/`); setNotice("Course deleted successfully."); await loadCourses(); }
        catch (err) { setError(errorText(err)); }
    }

    const visibleCourses = courses.filter((course) => `${course.course_code} ${course.course_name} ${course.duration}`.toLowerCase().includes(search.toLowerCase()));

    return <SuperAdminLayout active="courses">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div><h3 className="fw-bold mb-1">Course Management</h3><p className="text-muted mb-0">Create and maintain the courses offered by your institute.</p></div>
            <button className="btn btn-success" onClick={openCreate}><i className="bi bi-plus-lg me-2" />Add Course</button>
        </div>
        {notice && <div className="alert alert-success">{notice}</div>}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {formOpen && <div className="card border-0 shadow-sm mb-4"><div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold mb-0">{editing ? "Edit Course" : "New Course"}</h5><button className="btn-close" aria-label="Close" onClick={() => setFormOpen(false)} /></div>
            <form className="row g-3" onSubmit={saveCourse}>
                <div className="col-md-4"><label className="form-label">Course Code</label><input className="form-control" name="course_code" required maxLength={20} value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} /></div>
                <div className="col-md-8"><label className="form-label">Course Name</label><input className="form-control" name="course_name" required maxLength={100} value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Duration</label><input className="form-control" name="duration" required placeholder="e.g. 6 months" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Fee (₹)</label><input className="form-control" type="number" min="0" step="0.01" required value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
                <div className="col-12 d-flex gap-2"><button className="btn btn-success" disabled={saving}>{saving ? "Saving…" : "Save Course"}</button><button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setFormOpen(false)}>Cancel</button></div>
            </form>
        </div></div>}
        <div className="card border-0 shadow-sm"><div className="card-body p-3 p-md-4">
            <div className="row g-3 align-items-end mb-3"><div className="col-md-6"><label className="form-label">Search courses</label><input className="form-control" placeholder="Code, course name or duration" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="col-md-6 text-md-end"><span className="text-muted small">{visibleCourses.length} course(s)</span> <button className="btn btn-outline-secondary btn-sm ms-2" onClick={loadCourses}><i className="bi bi-arrow-clockwise me-1" />Refresh</button></div></div>
            {loading ? <div className="text-center py-5"><div className="spinner-border text-success" role="status" /><div className="text-muted mt-2">Loading courses…</div></div> : visibleCourses.length === 0 ? <div className="text-center text-muted py-5">No courses found. Use Add Course to create one.</div> : <div className="table-responsive"><table className="table table-hover align-middle"><thead className="table-light"><tr><th>Code</th><th>Course</th><th>Duration</th><th>Fee</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{visibleCourses.map((course) => <tr key={course.id}><td className="fw-semibold">{course.course_code}</td><td>{course.course_name}</td><td>{course.duration}</td><td>₹{Number(course.fee).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td><span className={`badge ${course.status === "ACTIVE" ? "text-bg-success" : "text-bg-secondary"}`}>{course.status}</span></td><td className="text-end text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(course)}><i className="bi bi-pencil me-1" />Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => deleteCourse(course)}><i className="bi bi-trash me-1" />Delete</button></td></tr>)}</tbody></table></div>}
        </div></div>
    </SuperAdminLayout>;
}
