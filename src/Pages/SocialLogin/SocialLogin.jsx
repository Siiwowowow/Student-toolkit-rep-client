import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useAuth from '../../Context/useAuth';

const SocialLogin = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleWithGoogle = async () => {
    setIsLoading(true);
    try {
      // 1. Sign in with Google
      const result = await signInWithGoogle();

      // 4. Show success toast
      toast.success('Login successful!', { duration: 1000, position: 'top-center' });

      // 5. Navigate after toast
      navigate(result.role === 'admin' ? '/admin' : '/student-dashboard', { replace: true });

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
    <div className="auth-social">
      <div className="auth-social-divider">or continue with</div>

      <button
        onClick={handleWithGoogle}
        disabled={isLoading}
        type="button"
        className="auth-google-button"
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <svg
            aria-hidden="true"
            focusable="false"
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
        {isLoading ? 'Logging in...' : 'Continue with Google'}
      </button>
    </div>
  );
};

export default SocialLogin;
