import { useEffect, useState } from "react";
import apiClient from "../services/apiClient.js";

export default function GoogleSignIn() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    apiClient.get("/api/auth/google/config")
      .then(({ data }) => { if (active) setEnabled(data.enabled === true); })
      .catch(() => { if (active) setEnabled(false); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const origin = (apiClient.defaults.baseURL || "").replace(/\/$/, "");
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
      </div>
      <button type="button" className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading || !enabled} onClick={() => window.location.assign(`${origin}/oauth2/authorization/google`)}>
        Continue with Google
      </button>
      {!loading && !enabled && <p className="text-center text-xs text-slate-500">Google sign-in is currently unavailable. Please use email and password.</p>}
    </div>
  );
}
