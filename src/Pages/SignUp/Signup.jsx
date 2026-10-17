import AcademicProfileFields from "../../Components/Student/AcademicProfileFields";
import React, { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../Context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineCloudUpload,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import SocialLogin from "../SocialLogin/SocialLogin";
import AuthLayout from "../AuthLayout";
import { ArrowRight } from "lucide-react";

const Signup = () => {
  const { user, createUser, uploadProfile, saveStudentProfile } = useContext(AuthContext);
  const createdAccount = useRef(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();
  const password = watch("password");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Image upload to imgbb
  const handleImageUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(image.type)) {
      toast.error("Please select a valid image (JPEG, PNG, GIF)");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", image);

    const uploadUrl = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_key}`;
    try {
      const res = await axios.post(uploadUrl, formData);
      setProfile(res.data.data.url);
      toast.success("Profile image uploaded successfully! 📸");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed. Please try again. ❌");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!profile) {
      toast.error("Please upload a profile avatar! 📸");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating your account...");

    try {
      // 1. Create Firebase user
      const retryAccount = createdAccount.current;
      const result = retryAccount?.uid === user?.uid && retryAccount?.email?.toLowerCase() === data.email.trim().toLowerCase()
        ? { user: retryAccount }
        : await createUser(data.email, data.password);
      createdAccount.current = result.user;

      // 2. Update Firebase profile
      await uploadProfile({
        displayName: data.name,
        photoURL: profile,
      });

      // 3. Save user to backend (MongoDB)
      const userToSave = {
        name: data.name,
        email: data.email,
        photoURL: profile,
        firebaseUID: result.user.uid,
        academicProfile: { college: data.college, phone: data.phone, section: data.section, sessionYear: data.sessionYear, ndcRoll: data.ndcRoll, academicYear: data.academicYear, group: data.group },
      };

      await result.user.getIdToken(true);
      const saved = await saveStudentProfile(result.user, userToSave);
      if (saved.profileComplete) {
        createdAccount.current = null;
        toast.success("Account created successfully! Welcome! 🎉");
        navigate(saved.role === "admin" ? "/admin" : "/student-dashboard", { replace: true });
        reset();
        setProfile(null);
      } else {
        toast.error("Failed to save user in database. Please try again. 😢");
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please login instead.");
      } else {
        toast.error(error.message || "Sign up failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  return <AuthLayout mode="signup" title="Make it your own." description="Create your account. Build a study space that works for you.">
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
      <div className="auth-section-heading"><span>01</span> A little about you</div>
      <div className="auth-input-group"><label className="auth-label"><span>Profile photo</span>{profile && <span className="auth-upload-ready"><AiOutlineCheckCircle />Ready</span>}</label><div className="auth-avatar-box"><div className="auth-avatar-preview">{profile ? <img src={profile} alt="Your profile preview" /> : <AiOutlineUser size={23} />}{uploading && <span className="auth-avatar-overlay"><span className="loading loading-spinner loading-xs" /></span>}</div><div><label className="auth-avatar-upload-btn"><AiOutlineCloudUpload size={16} />{profile ? "Change photo" : "Upload a photo"}<input type="file" aria-label="Upload profile photo" disabled={uploading || isSubmitting} onChange={handleImageUpload} accept="image/jpeg,image/png,image/gif" /></label><p>JPG, PNG or GIF. Up to 5 MB.</p></div></div></div>
      <div className="auth-form-grid">
        <div className="auth-input-group"><label htmlFor="signup-name" className="auth-label">Full name</label><div className="auth-input-wrapper"><AiOutlineUser className="auth-input-icon" /><input id="signup-name" type="text" autoComplete="name" {...register("name", { required: "Name is required", minLength: { value: 2, message: "Enter at least 2 characters" }, maxLength: { value: 100, message: "Use up to 100 characters" } })} aria-invalid={!!errors.name} className="auth-input" placeholder="Alex Morgan" /></div>{errors.name && <span className="auth-error-text" role="alert">{errors.name.message}</span>}</div>
        <div className="auth-input-group"><label htmlFor="signup-email" className="auth-label">Email address</label><div className="auth-input-wrapper"><AiOutlineMail className="auth-input-icon" /><input id="signup-email" type="email" autoComplete="email" {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Enter a valid email address" } })} aria-invalid={!!errors.email} className="auth-input" placeholder="alex@university.edu" /></div>{errors.email && <span className="auth-error-text" role="alert">{errors.email.message}</span>}</div>
      </div>
      <AcademicProfileFields register={register} errors={errors} step="02" />
      <div className="auth-section-heading"><span>03</span> Keep your account secure</div>
      <div className="auth-form-grid">
        <div className="auth-input-group"><label htmlFor="signup-password" className="auth-label">Password</label><div className="auth-input-wrapper"><AiOutlineLock className="auth-input-icon" /><input id="signup-password" type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Use at least 6 characters" }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, message: "Include uppercase, lowercase and a number" } })} aria-invalid={!!errors.password} className="auth-input auth-password-input" placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-eye-btn" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}</button></div>{errors.password && <span className="auth-error-text" role="alert">{errors.password.message}</span>}</div>
        <div className="auth-input-group"><label htmlFor="signup-confirm-password" className="auth-label">Confirm password</label><div className="auth-input-wrapper"><AiOutlineLock className="auth-input-icon" /><input id="signup-confirm-password" type={showConfirm ? "text" : "password"} autoComplete="new-password" {...register("confirmPassword", { required: "Confirm your password", validate: (value) => value === password || "Passwords do not match" })} aria-invalid={!!errors.confirmPassword} className="auth-input auth-password-input" placeholder="Re-enter your password" /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="auth-eye-btn" aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}>{showConfirm ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}</button></div>{errors.confirmPassword && <span className="auth-error-text" role="alert">{errors.confirmPassword.message}</span>}</div>
      </div>
      <p className="auth-password-hint">Use 6 or more characters with an uppercase letter, a lowercase letter and a number.</p>
      <button type="submit" className="auth-submit-btn" disabled={uploading || isSubmitting}>{isSubmitting ? <><span className="loading loading-spinner loading-xs" />Creating account...</> : <>Create my account<ArrowRight size={17} /></>}</button>
    </form>
    <SocialLogin />
    <p className="auth-switch-text">Already have an account? <Link to="/logIn">Sign in</Link></p>
  </AuthLayout>;
};

export default Signup;
