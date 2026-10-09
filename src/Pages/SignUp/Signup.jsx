import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../Context/AuthContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, useNavigate, Link } from "react-router";
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
import { API_BASE } from "../../api";
import "../AuthMaximalism.css";

const Signup = () => {
  const { createUser, uploadProfile } = useContext(AuthContext);
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

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

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
      const result = await createUser(data.email, data.password);

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
      };

      const response = await axios.post(`${API_BASE}/users`, userToSave);
      if (response.data.success) {
        toast.success("Account created successfully! Welcome! 🎉");
        navigate(from, { replace: true });
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

  return (
    <div className="auth-maximalist-wrap">
      {/* Background Floating Ambient Orbs */}
      <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-3" aria-hidden="true" />

      {/* Floating Retro Starbursts */}
      <span className="auth-starburst auth-starburst-1" aria-hidden="true">✦</span>
      <span className="auth-starburst auth-starburst-2" aria-hidden="true">✸</span>

      {/* Maximalist Decorative Stickers (Visible on Desktop) */}
      <div className="auth-sticker auth-sticker-tl" aria-hidden="true">
        <span>🚀</span> JOIN 10,000+ STUDENTS
      </div>
      <div className="auth-sticker auth-sticker-tr" aria-hidden="true">
        <span>⭐</span> 100% FREE FOREVER
      </div>
      <div className="auth-sticker auth-sticker-bl" aria-hidden="true">
        <span>✦</span> SMARTER HABITS
      </div>
      <div className="auth-sticker auth-sticker-br" aria-hidden="true">
        <span>🎯</span> GRADE A+ GUARANTEED
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#11141e",
            color: "#fff",
            border: "2px solid #f8fb38",
            fontWeight: "700",
          },
        }}
      />

      {/* Central Maximalist Card */}
      <div className="auth-maximalist-card">
        <div className="auth-card-header">
          <div className="auth-badge-pill">
            <span>✦</span> NEW MEMBER ACCESS
          </div>
          <h1 className="auth-card-title">
            Create <span>Account</span>
          </h1>
          <p className="auth-card-subtitle">
            Supercharge your studies with smart tools & planners
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {/* Profile Picture Upload Box */}
          <div className="auth-input-group">
            <label className="auth-label">
              <span>Profile Avatar</span>
              {profile && (
                <span style={{ color: "var(--m-cyan)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <AiOutlineCheckCircle /> Ready
                </span>
              )}
            </label>
            <div className="auth-avatar-box">
              <div className="auth-avatar-preview">
                {profile ? (
                  <img src={profile} alt="Avatar Preview" />
                ) : (
                  <AiOutlineCloudUpload style={{ fontSize: "24px", color: "var(--m-ink)" }} />
                )}
                {uploading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span className="loading loading-spinner loading-xs text-white" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label className="auth-avatar-upload-btn">
                  {profile ? "Change Avatar 📸" : "Upload Picture ✦"}
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                </label>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "600" }}>
                  JPEG, PNG or GIF (Max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="auth-input-group">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrapper">
              <AiOutlineUser className="auth-input-icon" />
              <input
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name should be at least 2 characters",
                  },
                })}
                className={`auth-input ${errors.name ? "has-error" : ""}`}
                placeholder="Alex Morgan"
              />
            </div>
            {errors.name && (
              <span className="auth-error-text">⚠ {errors.name.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <AiOutlineMail className="auth-input-icon" />
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                className={`auth-input ${errors.email ? "has-error" : ""}`}
                placeholder="alex@university.edu"
              />
            </div>
            {errors.email && (
              <span className="auth-error-text">⚠ {errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <AiOutlineLock className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                    message:
                      "Must contain at least 1 uppercase, 1 lowercase & 1 digit",
                  },
                })}
                className={`auth-input ${errors.password ? "has-error" : ""}`}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-eye-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="auth-error-text">⚠ {errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-input-group">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrapper">
              <AiOutlineLock className="auth-input-icon" />
              <input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className={`auth-input ${errors.confirmPassword ? "has-error" : ""}`}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="auth-eye-btn"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="auth-error-text">
                ⚠ {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={uploading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Creating Account...
              </>
            ) : (
              <>Create My Account ➔</>
            )}
          </button>
        </form>

        {/* Social Login */}
        <div style={{ marginTop: "16px" }}>
          <SocialLogin />
        </div>

        {/* Switch Link */}
        <p className="auth-switch-text">
          Already have an account?
          <Link to="/login">Sign In here ✦</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;