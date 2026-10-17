import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { ArrowLeft, Check, GraduationCap, LockKeyhole, Pencil, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import AcademicProfileFields from "./AcademicProfileFields";
import "../../Pages/Auth.css";
import "./StudentProfile.css";

const groupNames = { science: "Science", commerce: "Commerce / Business Studies", arts: "Arts / Humanities" };

export default function StudentProfile() {
  const { user, profile, saveStudentProfile } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: profile.academicProfile });
  const academic = profile.academicProfile;
  const edit = () => { reset(profile.academicProfile); setError(""); setEditing(true); };
  const cancel = () => { setEditing(false); setError(""); };
  const submit = async academicProfile => {
    setSaving(true); setError("");
    try {
      await saveStudentProfile(user, { academicProfile }, { method: "PATCH", path: "/users/me" });
      setEditing(false);
      toast.success("Profile updated successfully.");
    } catch (failure) { setError(failure.message); } finally { setSaving(false); }
  };
  const info = [
    ["Full name", profile.name, true], ["Email address", profile.email, true],
    ["College", academic.college || "Notre Dame College"],
    ["Phone number", academic.phone], ["NDC roll number", academic.ndcRoll, true],
    ["Section", academic.section], ["Session year", academic.sessionYear],
    ["Academic year", academic.academicYear === "first" ? "First year (Class XI)" : "Second year (Class XII)"],
    ["Group", groupNames[academic.group]],
  ];

  return <main className="toolkit-auth student-profile">
    <div className="profile-page-inner">
      <Link className="profile-back" to="/student-dashboard"><ArrowLeft size={16} />Back to dashboard</Link>
      <Link className="profile-back" to="/student-dashboard/quiz-updates"><GraduationCap size={16} />Quiz dates & syllabus</Link>
      <header className="profile-page-heading"><div><span className="profile-eyebrow">MADE FOR YOUR JOURNEY</span><h1>Your student profile.</h1><p>Your details, your subjects, your own learning space.</p></div><span className="profile-status"><Check size={14} />Profile complete</span></header>
      <div className="profile-page-grid">
        <aside className="profile-identity-card">
          <div className="profile-identity-avatar">{profile.photoURL || user.photoURL ? <img src={profile.photoURL || user.photoURL} alt="Your profile" referrerPolicy="no-referrer" /> : <UserRound size={42} />}</div>
          <span className="profile-student-badge"><GraduationCap size={15} />STUDENT</span>
          <h2>{profile.name}</h2><p>{profile.email}</p>
          <div className="profile-academic-badge"><strong>{groupNames[academic.group]}</strong><span>{academic.academicYear === "first" ? "Class XI" : "Class XII"} · {academic.sessionYear}</span></div>
          <div className="profile-identity-note"><LockKeyhole size={18} /><p>Your name, email and roll stay linked to your student identity.</p></div>
        </aside>
        <section className="profile-details-card" aria-labelledby="profile-details-title">
          <div className="profile-card-heading"><div><span className="profile-eyebrow">THE ESSENTIALS</span><h2 id="profile-details-title">{editing ? "Edit your details" : "Personal & academic details"}</h2></div>{!editing && <button type="button" className="profile-edit-button" onClick={edit}><Pencil size={15} />Edit profile</button>}</div>
          {editing ? <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
            <fieldset disabled={saving} className="profile-form-fields">
              <div className="auth-form-grid">
                <div className="auth-input-group"><label className="auth-label" htmlFor="student-profile-name">Full name</label><input id="student-profile-name" className="auth-input academic-input" value={profile.name} readOnly /></div>
                <div className="auth-input-group"><label className="auth-label" htmlFor="student-profile-email">Email address</label><input id="student-profile-email" className="auth-input academic-input" value={profile.email} readOnly /></div>
              </div>
              <AcademicProfileFields register={register} errors={errors} lockedRoll />
              <p className="profile-lock-note"><LockKeyhole size={14} />Name, email and NDC roll cannot be changed.</p>
              {error && <p role="alert" className="profile-save-error">{error}</p>}
              <div className="profile-edit-actions"><button className="auth-submit-btn" type="submit">{saving ? "Saving changes…" : "Save changes"}</button><button className="profile-cancel-button" type="button" onClick={cancel}>Cancel</button></div>
            </fieldset>
          </form> : <dl className="profile-information">{info.map(([label, value, locked]) => <div key={label}><dt>{label}{locked && <LockKeyhole size={12} aria-hidden="true" />}</dt><dd>{value}</dd></div>)}</dl>}
        </section>
      </div>
    </div>
  </main>;
}
