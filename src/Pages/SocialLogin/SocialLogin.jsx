import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useAuth from '../../Context/useAuth';
import axios from 'axios';

const SocialLogin = () => {
  const { signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  const [isLoading, setIsLoading] = useState(false);

  const handleWithGoogle = async () => {
    setIsLoading(true);
    try {
      // 1. Sign in with Google
      const result = await signInWithGoogle();
      const { user } = result;

      // 2. Prepare user data for backend
      const userInfo = {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        role: 'user',
        photoURL: user.photoURL || null,
        created_at: new Date().toISOString(),
        last_log_in: new Date().toISOString(),
      };

      // 3. Check if user already exists
      const checkUser = await axios.get(`http://localhost:3000/users?email=${user.email}`);

      if (checkUser.data.exists) {
        // Update last_log_in if needed
        await axios.put(`http://localhost:3000/users/${checkUser.data.user._id}`, {
          last_log_in: new Date().toISOString(),
        });
      } else {
        // Add new user
        await axios.post("http://localhost:3000/users", userInfo);
      }

      // 4. Show success toast
      toast.success('Login successful!', { duration: 1000, position: 'top-center' });

      // 5. Navigate after toast
      navigate(from, { replace: true });

    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please try again.';
        toast.error(errorMessage, { duration: 1000, position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='text-center'>
      <div className="divider font-bold">Or</div>

      <button
        onClick={handleWithGoogle}
        disabled={isLoading}
        className={`btn w-full bg-white text-black border-[#e5e5e5] hover:bg-gray-50 transition-colors ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <svg
            aria-label="Google logo"
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="mr-2"
          >
            <g>
              <path d="m0 0H512V512H0" fill="#fff"></path>
              <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path>
              <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path>
              <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path>
              <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path>
            </g>
          </svg>
        )}
        {isLoading ? 'Logging in...' : 'Login with Google'}
      </button>
    </div>
  );
};

export default SocialLogin;
