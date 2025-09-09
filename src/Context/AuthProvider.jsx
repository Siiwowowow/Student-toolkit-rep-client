import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { auth } from "../Firebase/firebase.init";
import axios from "axios";
import toast from "react-hot-toast";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // create account
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // login with email/pass
  const signInUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // login with google
  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  // update profile
  const uploadProfile = (profileInfo) => {
    return updateProfile(auth.currentUser, profileInfo);
  };

  // logout
  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  // track auth state
  useEffect(() => {
  const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);

    if (currentUser?.email) {
      const userData = { email: currentUser.email };

      // Use environment variable for API base
      const API_BASE = import.meta.env.VITE_API_BASE;

      axios.post(`${API_BASE}/jwt`, userData, {
        withCredentials: true
      })
        .then(res => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err.message);
          setLoading(false);
          toast.error(err.message);
        });
    }
  });

  return () => {
    unSubscribe();
  };
}, []);


  const AuthInfo = {
    createUser,
    signInUser,
    logOut,
    signInWithGoogle,
    uploadProfile,
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={AuthInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
