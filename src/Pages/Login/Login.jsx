import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../Context/AuthContext";
import SocialLogin from "../SocialLogin/SocialLogin";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineLock,
} from "react-icons/ai";
import toast from "react-hot-toast";
import AuthLayout from "../AuthLayout";
import { ArrowRight } from "lucide-react";

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

  // handle login with email/password
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await signInUser(data.email, data.password);
      toast.success("Login Successful! 🎉");
      navigate(result.role === "admin" ? "/admin" : "/student-dashboard", { replace: true });
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

  return <AuthLayout title="Welcome back." description="Sign in and pick up right where you left off.">
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
      <div className="auth-input-group"><label htmlFor="login-email" className="auth-label">Email address</label><div className="auth-input-wrapper"><AiOutlineMail className="auth-input-icon" /><input id="login-email" type="email" autoComplete="email" {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Enter a valid email address" } })} aria-invalid={!!errors.email} aria-describedby={errors.email ? "login-email-error" : undefined} className="auth-input" placeholder="student@university.edu" /></div>{errors.email && <span id="login-email-error" className="auth-error-text" role="alert">{errors.email.message}</span>}</div>
      <div className="auth-input-group"><label htmlFor="login-password" className="auth-label">Password</label><div className="auth-input-wrapper"><AiOutlineLock className="auth-input-icon" /><input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" {...register("password", { required: "Password is required" })} aria-invalid={!!errors.password} aria-describedby={errors.password ? "login-password-error" : undefined} className="auth-input auth-password-input" placeholder="Enter your password" /><button type="button" onClick={togglePasswordVisibility} className="auth-eye-btn" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}</button></div>{errors.password && <span id="login-password-error" className="auth-error-text" role="alert">{errors.password.message}</span>}</div>
      <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>{isSubmitting ? <><span className="loading loading-spinner loading-xs" />Signing in...</> : <>Sign in to Toolkit<ArrowRight size={17} /></>}</button>
    </form>
    <SocialLogin />
    <p className="auth-switch-text">New to Toolkit? <Link to="/signUp">Create an account</Link></p>
  </AuthLayout>;
};

export default Login;
