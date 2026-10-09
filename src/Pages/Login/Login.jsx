import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { AuthContext } from "../../Context/AuthContext";
import SocialLogin from "../SocialLogin/SocialLogin";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineLock,
} from "react-icons/ai";
import { toast, Toaster } from "react-hot-toast";
import "../AuthMaximalism.css";

const Login = () => {
  const { signInUser } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // handle login with email/password
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await signInUser(data.email, data.password);
      console.log("User Logged In:", result.user);
      toast.success("Login Successful! 🎉");
      navigate(from, { replace: true });
      reset();
    } catch (error) {
      console.error("Login Error:", error.message);
      if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Please try again later.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        <span>⚡</span> LEVEL UP YOUR GRADES
      </div>
      <div className="auth-sticker auth-sticker-tr" aria-hidden="true">
        <span>🎯</span> 100% FOCUS MODE
      </div>
      <div className="auth-sticker auth-sticker-bl" aria-hidden="true">
        <span>✦</span> NEVER MISS A DEADLINE
      </div>
      <div className="auth-sticker auth-sticker-br" aria-hidden="true">
        <span>🚀</span> ACADEMIA MAX EDITION
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
            <span>⚡</span> STUDENT PORTAL
          </div>
          <h1 className="auth-card-title">
            Welcome <span>Back!</span>
          </h1>
          <p className="auth-card-subtitle">
            Sign in to unlock your study planner & schedule
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
                    message: "Invalid email address",
                  },
                })}
                className={`auth-input ${errors.email ? "has-error" : ""}`}
                placeholder="student@university.edu"
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
                })}
                className={`auth-input ${errors.password ? "has-error" : ""}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
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

          {/* Remember me & Forgot Password */}
          <div className="auth-extra-row">
            <label className="auth-checkbox-label">
              <input type="checkbox" id="remember-me" name="remember-me" />
              <span>Remember me</span>
            </label>
            <a href="#" className="auth-link">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Signing in...
              </>
            ) : (
              <>Sign in to Toolkit ➔</>
            )}
          </button>
        </form>

        {/* Social Login */}
        <div style={{ marginTop: "16px" }}>
          <SocialLogin />
        </div>

        {/* Switch Link */}
        <p className="auth-switch-text">
          Don't have an account?
          <Link to="/signUp">Create one now ✦</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;