import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { ArrowRight, BookOpen, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../Context/AuthContext";
import AcademicProfileFields from "./AcademicProfileFields";
import "../../Pages/Auth.css";
import "./StudentProfile.css";

export default function ProfileCompletionModal() {
  const { user, profile, saveStudentProfile, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const dialog = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { name: profile?.name || user.displayName || "", ...profile?.academicProfile } });

  useEffect(() => {
    const element = dialog.current;
    const before = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!element.open) element.showModal();
    return () => { element.close(); document.body.style.overflow = overflow; if (before?.isConnected) before.focus(); };
  }, []);

  const submit = async ({ name, ...academicProfile }) => {
    setSaving(true); setError("");
    try {
      await saveStudentProfile(user, { name, academicProfile }, { method: "PATCH", path: "/users/me" });
      toast.success("Your student profile is ready!");
      navigate("/profile", { replace: true });
    } catch (failure) { setError(failure.message); setSaving(false); }
  };
  const leave = async () => {
    setSaving(true); setError("");
    try { await logOut(); navigate("/logIn", { replace: true }); }
    catch (failure) { setError(failure.message); setSaving(false); }
  };

  return <div className="profile-onboarding-background"><span>TOOLKIT<span>+</span></span><p>Your next chapter starts here.</p>
    <dialog ref={dialog} className="profile-completion-modal toolkit-auth" aria-labelledby="completion-title" aria-describedby="completion-description" onCancel={event => event.preventDefault()}>
      <div className="profile-modal-heading"><span className="profile-modal-icon"><BookOpen size={24} /></span><span className="profile-eyebrow">YOUR STUDENT SPACE</span><h1 id="completion-title">A little about you.</h1><p id="completion-description">Complete your profile once to unlock your subjects, planner and dashboard.</p></div>
      <form onSubmit={handleSubmit(submit)} className="auth-form" noValidate>
        <fieldset disabled={saving} className="profile-form-fields">
          <div className="auth-form-grid">
            <div className="auth-input-group"><label htmlFor="completion-name" className="auth-label">Full name</label><input id="completion-name" autoComplete="name" className="auth-input academic-input" {...register("name", { required: "Name is required", minLength: { value: 2, message: "Enter at least 2 characters" }, maxLength: { value: 100, message: "Use up to 100 characters" } })} />{errors.name && <span className="auth-error-text" role="alert">{errors.name.message}</span>}</div>
            <div className="auth-input-group"><label className="auth-label" htmlFor="completion-email">Email address</label><input id="completion-email" type="email" className="auth-input academic-input" value={profile?.email || user.email} readOnly /></div>
          </div>
          <AcademicProfileFields register={register} errors={errors} />
          <p className="profile-lock-note">Check your name and roll carefully. They will be fixed after you save.</p>
          {error && <p className="profile-save-error" role="alert">{error}</p>}
          <button className="auth-submit-btn" type="submit">{saving ? "Saving profile…" : <>Save profile & continue<ArrowRight size={17} /></>}</button>
        </fieldset>
      </form>
      <button className="profile-signout" type="button" onClick={leave} disabled={saving}><LogOut size={15} />Sign out</button>
    </dialog>
  </div>;
}
