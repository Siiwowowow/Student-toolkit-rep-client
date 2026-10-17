import { dateLabel } from "./adminUtils";
import { useContext, useState } from "react";
import { BookOpenCheck, FileEdit, Megaphone, Plus, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";
import { useAdminData } from "./useAdminData";
import { ConfirmDialog, DataState, PageHeading, Pagination, SearchForm } from "./AdminShared";
import { AnnouncementEditor, QuizEditor } from "./ContentEditors";

export default function AdminContentManager({ kind }) {
  const quizzes = kind === "quizzes";
  const singular = quizzes ? "quiz" : "announcement";
  const { user, refreshRole } = useContext(AuthContext);
  const [filter, setFilter] = useState({ page: 0, q: "", status: "all" });
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const state = useAdminData(`/admin/${kind}?page=${filter.page}&q=${encodeURIComponent(filter.q)}&status=${filter.status}`);
  const handleError = (error) => { toast.error(error.message); if ([401, 403].includes(error.status)) refreshRole(); };
  const edit = async (item) => {
    setBusy(true);
    try { const detail = await authenticatedRequest(user, `/admin/${kind}/${encodeURIComponent(item.id)}`); setEditor(detail); window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (error) { handleError(error); } finally { setBusy(false); }
  };
  const save = async (payload) => {
    setBusy(true);
    try {
      await authenticatedRequest(user, `/admin/${kind}${editor.id ? `/${encodeURIComponent(editor.id)}` : ""}`, { method: editor.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      toast.success(payload.status === "published" ? `${quizzes ? "Quiz" : "Announcement"} published.` : "Draft saved.");
      setEditor(null); state.reload();
    } catch (error) { handleError(error); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await authenticatedRequest(user, `/admin/${kind}/${encodeURIComponent(selected.id)}`, { method: "DELETE" }); toast.success(`${quizzes ? "Quiz" : "Announcement"} removed.`); setSelected(null); if (state.data.items.length === 1 && filter.page > 0) setFilter((value) => ({ ...value, page: value.page - 1 })); else state.reload(); }
    catch (error) { handleError(error); } finally { setBusy(false); }
  };
  const Icon = quizzes ? BookOpenCheck : Megaphone;
  return <><PageHeading eyebrow={quizzes ? "LEARNING CONTENT" : "COMMUNITY UPDATES"} title={quizzes ? "Quiz Update" : "Announcements"} description={quizzes ? "Keep practice fresh. Create, refine, and publish questions for your students." : "Give every student a clear view of what is coming up."}><button type="button" className="adm-icon-button adm-bordered" aria-label={`Refresh ${kind}`} disabled={state.loading || busy} onClick={state.reload}><RefreshCw size={18} /></button><button type="button" className="adm-button" disabled={busy} onClick={() => setEditor({})}><Plus size={17} />{quizzes ? "New quiz" : "New announcement"}</button></PageHeading>{editor && (quizzes ? <QuizEditor key={editor.id || "new-quiz"} item={editor} busy={busy} onCancel={() => setEditor(null)} onSave={save} /> : <AnnouncementEditor key={editor.id || "new-announcement"} item={editor} busy={busy} onCancel={() => setEditor(null)} onSave={save} />)}<section className="adm-panel"><div className="adm-panel-heading"><div><h2>{quizzes ? "Practice quiz library" : "Your announcements"}</h2><p>{quizzes ? "Drafts and generated question sets stay private until published." : "Draft quietly. Publish when your message is ready."}</p></div><span className="adm-subtle-pill">{state.data?.total ?? "-"} {kind}</span></div><SearchForm value={search} onChange={setSearch} onSubmit={() => setFilter((value) => ({ ...value, q: search.trim(), page: 0 }))} placeholder={quizzes ? "Search quiz titles" : "Search announcement titles"}><select aria-label="Filter publishing status" value={filter.status} onChange={(event) => setFilter((value) => ({ ...value, status: event.target.value, page: 0 }))}><option value="all">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option></select></SearchForm><DataState {...state} />{state.data && <>{state.data.items.length ? <div className="adm-content-grid">{state.data.items.map((item) => <article className="adm-content-card" key={item.id}><div className="adm-content-card-top"><span className={`adm-stat-icon ${quizzes ? "tone-blue" : "tone-amber"}`}><Icon size={22} /></span><span className={`adm-status ${item.status === "published" ? "status-active" : "status-draft"}`}><i />{item.status === "published" ? "Published" : "Draft"}</span></div><h3>{quizzes ? item.topic : item.title}</h3><p className="adm-card-preview">{quizzes ? item.description || "A toolkit practice quiz." : item.body}</p><div className="adm-card-meta">{quizzes ? <span>{item.questionCount} questions</span> : <span>{item.priority === "important" ? "Important update" : "Community update"}</span>}<span>{dateLabel(item.updatedAt)}</span></div><div className="adm-card-actions"><button type="button" className="adm-button adm-button-secondary" disabled={busy} onClick={() => edit(item)} aria-label={`Edit ${quizzes ? item.topic : item.title}`}><FileEdit size={15} />Edit {singular}</button><button type="button" className="adm-icon-button adm-danger-text" disabled={busy} aria-label={`Remove ${quizzes ? item.topic : item.title}`} onClick={() => setSelected(item)}><Trash2 size={17} /></button></div></article>)}</div> : <div className="adm-empty"><Icon size={35} /><h3>{filter.q ? "No matching items" : quizzes ? "Start your quiz library" : "Your next update starts here"}</h3><p>{filter.q ? "Try another search or publishing status." : `Create your first ${singular} with the button above.`}</p></div>}<Pagination page={filter.page} pages={state.data.pages} total={state.data.total} onPage={(page) => setFilter((value) => ({ ...value, page }))} /></>}</section>{selected && <ConfirmDialog title={`Remove this ${singular}?`} description={`?${quizzes ? selected.topic : selected.title}? will be removed. Published content will no longer be available to students.`} busy={busy} onClose={() => setSelected(null)} onConfirm={remove} confirmLabel={`Remove ${singular}`} />}</>;
}
