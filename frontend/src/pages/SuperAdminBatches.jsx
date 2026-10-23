import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import SuperAdminLayout from "../router/SuperAdminLayout";

const emptyForm = { batch_name: "", center: "", course: "", start_date: "", end_date: "", capacity: "30", status: "UPCOMING" };
function errorText(error) {
    const data = error.response?.data;
    if (!data) return "Unable to connect to the server.";
    if (typeof data.detail === "string") return data.detail;
    if (typeof data === "string") return data;
    return Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : JSON.stringify(value)}`).join(" | ");
}
function listData(data) { return Array.isArray(data) ? data : data?.results || []; }

export default function SuperAdminBatches() {
    const [batches, setBatches] = useState([]); const [centers, setCenters] = useState([]); const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
    const [formOpen, setFormOpen] = useState(false); const [editing, setEditing] = useState(null); const [form, setForm] = useState({ ...emptyForm }); const [saving, setSaving] = useState(false); const [search, setSearch] = useState("");

    const loadReferenceData = useCallback(async () => {
        const [centerResponse, courseResponse] = await Promise.all([api.get("/centers/"), api.get("/courses/")]);
        setCenters(listData(centerResponse.data)); setCourses(listData(courseResponse.data));
    }, []);
    const loadBatches = useCallback(async () => {
        setLoading(true); setError("");
        try { const response = await api.get("/batches/"); setBatches(listData(response.data)); }
        catch (err) { setError(errorText(err)); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { loadBatches(); loadReferenceData().catch((err) => setError(`Unable to load Centers or Courses: ${errorText(err)}`)); }, [loadBatches, loadReferenceData]);

    function openCreate() { setEditing(null); setForm({ ...emptyForm }); setNotice(""); setError(""); setFormOpen(true); }
    function openEdit(batch) { setEditing(batch); setForm({ batch_name: batch.batch_name || "", center: String(batch.center ?? ""), course: String(batch.course ?? ""), start_date: batch.start_date || "", end_date: batch.end_date || "", capacity: String(batch.capacity ?? 30), status: batch.status || "UPCOMING" }); setNotice(""); setError(""); setFormOpen(true); }
    async function saveBatch(event) {
        event.preventDefault(); setSaving(true); setError(""); setNotice("");
        const payload = { ...form, center: Number(form.center), course: Number(form.course), capacity: Number(form.capacity) };
        try { if (editing) await api.patch(`/batches/${editing.id}/`, payload); else await api.post("/batches/", payload); setNotice(editing ? "Batch updated successfully." : "Batch created successfully."); setFormOpen(false); setEditing(null); setForm({ ...emptyForm }); await loadBatches(); }
        catch (err) { setError(errorText(err)); } finally { setSaving(false); }
    }
    async function deleteBatch(batch) {
        if (!window.confirm(`Delete batch "${batch.batch_name}"? This may be blocked if records use it.`)) return;
        setError(""); setNotice(""); try { await api.delete(`/batches/${batch.id}/`); setNotice("Batch deleted successfully."); await loadBatches(); } catch (err) { setError(errorText(err)); }
    }
    const visibleBatches = batches.filter((batch) => `${batch.batch_code} ${batch.batch_name} ${batch.center_name || ""} ${batch.course_name || ""}`.toLowerCase().includes(search.toLowerCase()));

    return <SuperAdminLayout active="batches">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"><div><h3 className="fw-bold mb-1">Batch Management</h3><p className="text-muted mb-0">Schedule course batches and assign them to a training center.</p></div><button className="btn btn-success" onClick={openCreate}><i className="bi bi-plus-lg me-2" />Add Batch</button></div>
        {notice && <div className="alert alert-success">{notice}</div>}{error && <div className="alert alert-danger" role="alert">{error}</div>}
        {formOpen && <div className="card border-0 shadow-sm mb-4"><div className="card-body p-4"><div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold mb-0">{editing ? "Edit Batch" : "New Batch"}</h5><button className="btn-close" aria-label="Close" onClick={() => setFormOpen(false)} /></div>
            {(centers.length === 0 || courses.length === 0) && <div className="alert alert-warning">You need at least one Center and one Course before creating a batch.</div>}
            <form className="row g-3" onSubmit={saveBatch}>
                <div className="col-md-6"><label className="form-label">Batch Name</label><input className="form-control" required maxLength={100} value={form.batch_name} onChange={(e) => setForm({ ...form, batch_name: e.target.value })} placeholder="e.g. Python Full Stack - Morning" /></div>
                <div className="col-md-6"><label className="form-label">Training Center</label><select className="form-select" required value={form.center} onChange={(e) => setForm({ ...form, center: e.target.value })}><option value="">Select a center</option>{centers.map((center) => <option key={center.id} value={center.id}>{center.center_name || center.name || `Center #${center.id}`}</option>)}</select></div>
                <div className="col-md-6"><label className="form-label">Course</label><select className="form-select" required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}><option value="">Select a course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.course_code} — {course.course_name}</option>)}</select></div>
                <div className="col-md-3"><label className="form-label">Start Date</label><input className="form-control" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">End Date</label><input className="form-control" type="date" required min={form.start_date || undefined} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Capacity</label><input className="form-control" type="number" min="1" required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="UPCOMING">Upcoming</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></div>
                <div className="col-12 d-flex gap-2"><button className="btn btn-success" disabled={saving || centers.length === 0 || courses.length === 0}>{saving ? "Saving…" : "Save Batch"}</button><button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setFormOpen(false)}>Cancel</button></div>
            </form>
        </div></div>}
        <div className="card border-0 shadow-sm"><div className="card-body p-3 p-md-4"><div className="row g-3 align-items-end mb-3"><div className="col-md-6"><label className="form-label">Search batches</label><input className="form-control" placeholder="Batch code, name, center or course" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="col-md-6 text-md-end"><span className="text-muted small">{visibleBatches.length} batch(es)</span> <button className="btn btn-outline-secondary btn-sm ms-2" onClick={() => { loadBatches(); loadReferenceData().catch((err) => setError(errorText(err))); }}><i className="bi bi-arrow-clockwise me-1" />Refresh</button></div></div>
            {loading ? <div className="text-center py-5"><div className="spinner-border text-success" role="status" /><div className="text-muted mt-2">Loading batches…</div></div> : visibleBatches.length === 0 ? <div className="text-center text-muted py-5">No batches found. Use Add Batch to create one.</div> : <div className="table-responsive"><table className="table table-hover align-middle"><thead className="table-light"><tr><th>Batch Code</th><th>Batch</th><th>Center</th><th>Course</th><th>Dates</th><th>Capacity</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{visibleBatches.map((batch) => <tr key={batch.id}><td className="fw-semibold">{batch.batch_code || "—"}</td><td>{batch.batch_name}</td><td>{batch.center_name || centers.find((c) => String(c.id) === String(batch.center))?.center_name || `#${batch.center}`}</td><td>{batch.course_name || courses.find((c) => String(c.id) === String(batch.course))?.course_name || `#${batch.course}`}</td><td className="text-nowrap">{batch.start_date} – {batch.end_date}</td><td>{batch.capacity}</td><td><span className={`badge ${batch.status === "ACTIVE" ? "text-bg-success" : batch.status === "CANCELLED" ? "text-bg-danger" : batch.status === "COMPLETED" ? "text-bg-secondary" : "text-bg-warning"}`}>{batch.status}</span></td><td className="text-end text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(batch)}><i className="bi bi-pencil me-1" />Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => deleteBatch(batch)}><i className="bi bi-trash me-1" />Delete</button></td></tr>)}</tbody></table></div>}
        </div></div>
    </SuperAdminLayout>;
}
