import GoogleSignIn from "./GoogleSignIn.jsx";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext.js";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/products" replace />;

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(form);
      navigate("/products", { replace: true });
    } catch (requestError) {
      const response = requestError.response?.data;
      setError(response?.message || Object.values(response || {})[0] || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  return (
    <section className="auth-section mx-auto max-w-md">
      <div className="auth-panel panel overflow-hidden">
        <div className="auth-heading text-white">
          <p className="eyebrow text-orange-400">Customer account</p>
          <h1 className="mt-2 text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-slate-300">Register to start shopping and track your orders.</p>
        </div>
        <form className="space-y-5 p-8" onSubmit={submit}>
          {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <div>
            <label className="field-label" htmlFor="register-name">Full name</label>
            <input id="register-name" name="name" className="field-input" autoComplete="name" required autoFocus value={form.name} onChange={change} />
          </div>
          <div>
            <label className="field-label" htmlFor="register-email">Email</label>
            <input id="register-email" name="email" className="field-input" type="email" autoComplete="email" required value={form.email} onChange={change} />
          </div>
          <div>
            <label className="field-label" htmlFor="register-password">Password</label>
            <input id="register-password" name="password" className="field-input" type="password" minLength="8" autoComplete="new-password" required value={form.password} onChange={change} />
            <p className="mt-1 text-xs text-slate-500">Use at least 8 characters.</p>
          </div>
          <button className="btn-primary w-full py-3" disabled={submitting}>
            {submitting ? "Creating account…" : "Create Account"}
          </button>
          <GoogleSignIn />
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link className="font-bold text-orange-700 hover:underline" to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
