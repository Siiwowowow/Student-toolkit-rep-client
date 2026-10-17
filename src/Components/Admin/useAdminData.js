import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";

export function useAdminData(path) {
  const { user, refreshRole } = useContext(AuthContext);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const key = `${user.uid}:${path}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    authenticatedRequest(user, path, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setResult({ key, data });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      setResult({ key, error: error.message });
      if (error.status === 401 || error.status === 403) refreshRole();
    });
    return () => controller.abort();
  }, [key, path, user, refreshRole]);
  const current = result?.key === key ? result : null;
  return { data: current?.data, error: current?.error, loading: !current, reload: () => setRevision((value) => value + 1) };
}
