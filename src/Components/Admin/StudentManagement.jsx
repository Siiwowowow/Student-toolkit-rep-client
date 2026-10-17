import { dateLabel } from "./adminUtils";
import { useContext, useState } from "react";
import { Globe, Mail, RefreshCw, ShieldCheck, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";
import { useAdminData } from "./useAdminData";
import { ConfirmDialog, DataState, PageHeading, Pagination, SearchForm } from "./AdminShared";

const loginMethodLabel = (method) => ({
  google: "Google / Social",
  social: "Other social",
  email: "Email / Password",
  unknown: "Unknown",
}[method] || "Unknown");

export default function StudentManagement() {
  const { user, refreshRole } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ page: 0, q: "", status: "all" });
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const state = useAdminData(`/admin/students?page=${filter.page}&q=${encodeURIComponent(filter.q)}&status=${filter.status}`);
  const remove = async () => {
    setBusy(true);
    try {
      await authenticatedRequest(user, `/admin/students/${encodeURIComponent(selected.uid)}`, { method: "DELETE" });
      toast.success("Student removed."); setSelected(null);
      if (state.data.students.length === 1 && filter.page > 0) setFilter((value) => ({ ...value, page: value.page - 1 })); else state.reload();
    } catch (error) { toast.error(error.message); if ([401, 403].includes(error.status)) refreshRole(); }
    finally { setBusy(false); }
  };
  return <><PageHeading eyebrow="PEOPLE & ACCESS" title="Student Management" description="Manage student accounts and review their access status."><button type="button" className="adm-button adm-button-secondary" disabled={state.loading} onClick={state.reload}><RefreshCw size={16} />Refresh</button></PageHeading><div className="adm-info-strip"><ShieldCheck size={18} /><span>Live student records from the database. Administrator accounts are excluded and protected.</span></div><section className="adm-student-stats" aria-label="Student account totals"><article className="adm-stat"><div><span className="adm-stat-icon tone-violet"><Users size={20} /></span><span className="adm-stat-tag">ALL ACCOUNTS</span></div><strong>{state.data?.activeStudents != null ? state.data.activeStudents + state.data.disabledStudents : "—"}</strong><small>Student profiles in database</small></article><article className="adm-stat"><div><span className="adm-stat-icon tone-green"><ShieldCheck size={20} /></span><span className="adm-stat-tag">ACTIVE</span></div><strong>{state.data?.activeStudents ?? "—"}</strong><small>Can access student features</small></article><article className="adm-stat"><div><span className="adm-stat-icon tone-amber"><ShieldCheck size={20} /></span><span className="adm-stat-tag">DISABLED</span></div><strong>{state.data?.disabledStudents ?? "—"}</strong><small>Account access is blocked</small></article><article className="adm-stat"><div><span className="adm-stat-icon tone-blue"><Globe size={20} /></span><span className="adm-stat-tag">GOOGLE / SOCIAL</span></div><strong>{state.data?.googleStudents ?? "—"}</strong><small>Social sign-up method</small></article><article className="adm-stat"><div><span className="adm-stat-icon tone-violet"><Mail size={20} /></span><span className="adm-stat-tag">EMAIL / PASSWORD</span></div><strong>{state.data?.emailStudents ?? "—"}</strong><small>Direct form sign-up method</small></article></section><section className="adm-panel"><div className="adm-panel-heading"><div><h2>Student directory</h2><p>Search by student name, email, or sign-in method.</p></div><span className="adm-subtle-pill">{state.data?.total ?? "—"} matching students</span></div><SearchForm value={search} onChange={setSearch} onSubmit={() => setFilter((value) => ({ ...value, page: 0, q: search.trim() }))} placeholder="Search name, email, Google, or email/password"><select aria-label="Filter students by status" value={filter.status} onChange={(event) => setFilter((value) => ({ ...value, page: 0, status: event.target.value }))}><option value="all">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option></select></SearchForm><DataState {...state} />{state.data && <><div className="adm-table-scroll"><table className="adm-table"><thead><tr><th>Student</th><th>Sign-in method</th><th>Account status</th><th>Joined</th><th>Last sign-in</th><th className="adm-align-right">Actions</th></tr></thead><tbody>{state.data.students.map((student) => <tr key={student.uid}><td><div className="adm-user-cell"><span className="adm-user-initial">{student.name[0].toUpperCase()}</span><div><strong>{student.name}</strong><small>{student.email || "No email address"}</small></div></div></td><td><span className={`adm-method-badge method-${student.loginMethod}`}><i />{loginMethodLabel(student.loginMethod)}</span></td><td><span className={`adm-status ${student.disabled ? "status-disabled" : "status-active"}`}><i />{student.disabled ? "Disabled" : "Active"}</span></td><td>{dateLabel(student.createdAt)}</td><td>{dateLabel(student.lastSignInAt)}</td><td className="adm-align-right"><button type="button" className="adm-remove-button" aria-label={`Remove ${student.name}`} onClick={() => setSelected(student)}><Trash2 size={15} />Remove</button></td></tr>)}</tbody></table></div>{!state.data.students.length && <div className="adm-empty"><Users size={34} /><h3>{filter.q || filter.status !== "all" ? "No students match these filters" : "No students in the database yet"}</h3><p>{filter.q || filter.status !== "all" ? "Try a different search or account status." : "Registered student accounts will appear here."}</p></div>}<Pagination page={filter.page} pages={state.data.pages} total={state.data.total} onPage={(page) => setFilter((value) => ({ ...value, page }))} /></>}</section>{selected && <ConfirmDialog title={`Remove ${selected.name}?`} description={`All study records for ${selected.email || "this student"} will be permanently deleted. A minimal identity block will be retained to prevent the account from signing in again.`} confirmLabel="Remove student" busy={busy} onClose={() => setSelected(null)} onConfirm={remove} />}</>;
}
