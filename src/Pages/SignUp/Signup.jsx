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
  AiOutlineCheckCircle
} from "react-icons/ai";
import SocialLogin from "../SocialLogin/SocialLogin";

const Signup = () => {
  const { createUser, uploadProfile } = useContext(AuthContext);
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const password = watch("password");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Image upload to imgbb
  const handleImageUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(image.type)) {
      toast.error('Please select a valid image (JPEG, PNG, GIF)');
      return;
    }

    if (image.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", image);

    const uploadUrl = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_key}`;
    try {
      const res = await axios.post(uploadUrl, formData);
      setProfile(res.data.data.url);
      toast.success("Profile image uploaded successfully! ✅");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed. Please try again. ❌");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!profile) {
      toast.error("Please upload a profile image");
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

      const response = await axios.post("http://localhost:3000/users", userToSave);
      if (response.data.success) {
        toast.success("Account created successfully! Welcome! 🎉");
        reset();
        setProfile(null);
        navigate(from, { replace: true });
      } else {
        toast.error("Failed to save user in database. Please try again. 😢");
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please login instead.');
      } else {
        toast.error(error.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join our community today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Profile Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {profile ? (
                    <img src={profile} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <AiOutlineCloudUpload className="text-gray-400 text-xl" />
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <label className="flex-1">
                <div className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 text-center">
                  {profile ? 'Change Image' : 'Upload Image'}
                </div>
                <input 
                  type="file" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">JPEG, PNG or GIF (Max 5MB)</p>
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <div className="relative">
              <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                {...register("name", { 
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name should be at least 2 characters"
                  }
                })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { 
                    value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, 
                    message: "Please enter a valid email address" 
                  },
                })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: { 
                    value: 6, 
                    message: "Password must be at least 6 characters" 
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                  }
                })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={uploading || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Sign In
          </Link>
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login would go here */}
        <SocialLogin></SocialLogin>
      </div>
    </div>
  );
};

export default Signup;