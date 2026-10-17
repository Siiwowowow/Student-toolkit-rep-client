import React, { useCallback, useEffect, useRef, useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, onIdTokenChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { auth } from "../Firebase/firebase.init";
import { API_BASE, authenticatedRequest } from "../api";

const googleProvider = new GoogleAuthProvider();
const storageKey = "toolkit-session";
const storedToken = () => { try { return localStorage.getItem(storageKey); } catch { return null; } };
const saveToken = (token) => { try { if (token) localStorage.setItem(storageKey, token); else localStorage.removeItem(storageKey); } catch { /* Session still works until reload. */ } };
const localUser = (profile, token) => ({ uid: profile.uid, email: profile.email, displayName: profile.name, photoURL: profile.photoURL, provider: "local", getIdToken: async () => token });

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState({ uid: null, role: null, loading: false, error: null });
  const currentUser = useRef(null);
  const localToken = useRef(storedToken());
  const version = useRef(0);

  const bootstrapAccount = useRef(null);
  const signInBusy = useRef(false);
  const validationRequest = useRef(null);

  const clearSession = useCallback(async () => {
    version.current += 1;
    validationRequest.current = null;
    bootstrapAccount.current = null;
    saveToken(null); localToken.current = null; currentUser.current = null;
    setUser(null);
    setAccess({ uid: null, role: null, loading: false, error: null });
    setLoading(false);
    try { await signOut(auth); } catch { /* The application session is already cleared. */ }
  }, []);

  const refreshRole = useCallback((account = currentUser.current) => {
    if (!account || signInBusy.current || bootstrapAccount.current?.uid === account.uid) return Promise.resolve();
    if (validationRequest.current?.account === account) return validationRequest.current.promise;
    const requestVersion = ++version.current;
    const request = { account };
    setAccess((previous) => previous.uid === account.uid && previous.role ? { ...previous, error: null } : { uid: account.uid, role: null, loading: true, error: null });
    request.promise = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const profile = await authenticatedRequest(account, "/auth/me", { signal: controller.signal });
        if (requestVersion !== version.current || currentUser.current !== account) return;
        let resolvedAccount = account;
        if (account.provider === "local" && account.uid !== profile.uid) {
          resolvedAccount = localUser(profile, localToken.current);
          currentUser.current = resolvedAccount;
          setUser(resolvedAccount);
        }
        setAccess({ uid: resolvedAccount.uid, role: profile.role === "admin" ? "admin" : "student", profile, loading: false, error: null });
      } catch (error) {
        if (requestVersion !== version.current || currentUser.current !== account) return;
        if (error.status === 401) { await clearSession(); return; }
        const message = error.name === "AbortError" ? "Account verification timed out. Retrying automatically." : error.message;
        // Retain the verified profile so a temporary outage cannot erase onboarding input.
        // Protected routes still block on roleError until verification succeeds again.
        setAccess(previous => previous.uid === account.uid ? { ...previous, loading: false, error: message } : { uid: account.uid, role: null, loading: false, error: message });
      } finally {
        clearTimeout(timeout);
        if (validationRequest.current === request) validationRequest.current = null;
      }
    })();
    validationRequest.current = request;
    return request.promise;
  }, [clearSession]);

  const activate = useCallback((account, profile) => {
    currentUser.current = account;
    setUser(account);
    setLoading(false);
    if (profile) {
      version.current += 1;
      setAccess({ uid: account.uid, role: profile.role === "admin" ? "admin" : "student", profile, loading: false, error: null });
    } else refreshRole(account);
  }, [refreshRole]);

  const saveStudentProfile = useCallback(async (account, body, { method = "POST", path = "/users" } = {}) => {
    const profile = await authenticatedRequest(account, path, {
      method,
      ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
    if (typeof profile?.profileComplete !== "boolean" || body?.academicProfile && !profile.profileComplete) {
      throw new Error("Your profile was not saved. Please try again. Your form details have been kept.");
    }
    if (currentUser.current?.uid !== account.uid && bootstrapAccount.current?.uid !== account.uid) throw new Error("Your account changed. Please sign in again.");
    // The confirmed write supersedes any earlier /auth/me request made during sign-in.
    validationRequest.current = null;
    bootstrapAccount.current = null;
    activate(account, profile);
    return profile;
  }, [activate]);

  useEffect(() => {
    let active = true;
    const unsubscribe = onIdTokenChanged(auth, (account) => {
      if (active && !localToken.current && !signInBusy.current && (!bootstrapAccount.current || !account || bootstrapAccount.current.uid !== account.uid)) activate(account);
    });
    const token = localToken.current;
    if (token) {
      authenticatedRequest({ getIdToken: async () => token }, "/auth/me").then((profile) => {
        if (active && localToken.current === token) activate(localUser(profile, token), profile);
      }).catch((error) => {
        if (!active || localToken.current !== token) return;
        if (error.status === 401) { clearSession(); }
        else {
          const account = localUser({ uid: "pending-local-session", email: "", name: "Account" }, token);
          activate(account);
        }
      });
    }
    return () => { active = false; unsubscribe(); };
  }, [activate, clearSession]);

  useEffect(() => {
    const revalidate = () => { if (document.visibilityState === "visible" && navigator.onLine && currentUser.current) refreshRole(); };
    const timer = setInterval(revalidate, 5000);
    window.addEventListener("focus", revalidate);
    window.addEventListener("online", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => { clearInterval(timer); window.removeEventListener("focus", revalidate); window.removeEventListener("online", revalidate); document.removeEventListener("visibilitychange", revalidate); };
  }, [refreshRole]);

  const holdForProfile = (account) => {
    bootstrapAccount.current = account;
    version.current += 1;
    validationRequest.current = null;
    currentUser.current = null;
    setUser(null);
    setAccess({ uid: null, role: null, loading: false, error: null });
    saveToken(null); localToken.current = null;
  };

  const createUser = async (email, password) => {
    setLoading(true);
    signInBusy.current = true;
    try {
      if (bootstrapAccount.current?.email?.toLowerCase() === email.trim().toLowerCase() && auth.currentUser?.uid === bootstrapAccount.current.uid) return { user: bootstrapAccount.current };
      const result = await createUserWithEmailAndPassword(auth, email, password);
      holdForProfile(result.user);
      return result;
    } finally { signInBusy.current = false; setLoading(false); }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    signInBusy.current = true;
    try {
      const response = await fetch(`${API_BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.success) {
        const { token, user: profile } = result.data;
        localToken.current = token;
        saveToken(token);
        bootstrapAccount.current = null;
        await signOut(auth);
        const account = localUser(profile, token);
        activate(account, profile);
        return { user: account, role: profile.role };
      }
      if (response.status !== 401) throw new Error(result?.message || "Sign-in service is unavailable.");
      const firebaseResult = await signInWithEmailAndPassword(auth, email, password);
      holdForProfile(firebaseResult.user);
      // Password sign-in cannot silently recreate an account removed from MongoDB.
      const profile = await authenticatedRequest(firebaseResult.user, "/auth/me");
      bootstrapAccount.current = null;
      activate(firebaseResult.user, profile);
      return { ...firebaseResult, role: profile.role, profile };
    } catch (error) {
      await clearSession();
      throw error;
    } finally { signInBusy.current = false; setLoading(false); }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    signInBusy.current = true;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      holdForProfile(result.user);
      const profile = await saveStudentProfile(result.user);
      return { ...result, role: profile.role, profile };
    } catch (error) {
      await clearSession();
      throw error;
    } finally { signInBusy.current = false; setLoading(false); }
  };

  const uploadProfile = (profile) => updateProfile(auth.currentUser, profile);
  const logOut = async () => {
    const account = currentUser.current;
    setLoading(true);
    try {
      if (account?.provider === "local") await authenticatedRequest(account, "/auth/logout", { method: "POST" });
    } finally { await clearSession(); }
  };

  return <AuthContext.Provider value={{ user, loading, createUser, signInUser, signInWithGoogle, uploadProfile, saveStudentProfile, logOut, refreshRole,
    role: access.uid === user?.uid ? access.role : null,
    profile: access.uid === user?.uid ? access.profile : null,
    roleLoading: !!user && (access.uid !== user.uid || access.loading),
    roleError: access.uid === user?.uid ? access.error : null,
  }}>{children}</AuthContext.Provider>;
}
