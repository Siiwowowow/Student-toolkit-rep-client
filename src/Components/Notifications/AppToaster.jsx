import { useEffect } from "react";
import toast, { Toaster, ToastBar } from "react-hot-toast";

const toastOptions = {
  duration: 3000,
  removeDelay: 400,
  success: { duration: 2500 },
  error: { duration: 4000 },
  loading: { duration: Infinity },
};

function AutoDismissToast({ notification }) {
  const { id, createdAt, duration, visible, type } = notification;
  useEffect(() => {
    // Completion notices expire even when the pointer stays over the toast.
    // Loading notices remain until their operation completes or dismisses them.
    if (!visible || type === "loading" || !Number.isFinite(duration)) return;
    const remaining = Math.max(0, createdAt + duration - Date.now());
    const timer = setTimeout(() => toast.dismiss(id), remaining);
    return () => clearTimeout(timer);
  }, [id, createdAt, duration, visible, type]);

  return <ToastBar toast={notification} />;
}

export default function AppToaster() {
  return (
    <Toaster position="top-right" reverseOrder={false} toastOptions={toastOptions}>
      {(notification) => <AutoDismissToast notification={notification} />}
    </Toaster>
  );
}
