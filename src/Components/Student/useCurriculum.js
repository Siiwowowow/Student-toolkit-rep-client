import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { authenticatedRequest } from "../../api";

export default function useCurriculum() {
  const { user, profile } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [revision, setRevision] = useState(0);
  const key = `${user?.uid}:${profile?.academicProfile?.group}:${revision}`;
  useEffect(() => {
    if (!user || !profile?.profileComplete) return;
    const controller = new AbortController();
    authenticatedRequest(user, "/student/curriculum", { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setResult({ key, ...data });
    }).catch((error) => { if (!controller.signal.aborted) setResult({ key, error: error.message }); });
    return () => controller.abort();
  }, [key, user, profile?.profileComplete]);
  const current = result?.key === key ? result : null;
  return { subjects: current?.subjects || [], loading: !current, error: current?.error, retry: () => setRevision((value) => value + 1) };
}
