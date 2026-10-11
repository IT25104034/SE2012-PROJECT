import { useState } from "react";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../auth/authContext.js";

function routeForRole(role) {
  if (role === "ADMIN") {
    return "/admin/products";
  }

  if (role === "STAFF") {
    return "/staff/orders";
  }

  return "/products";
}

export default function LoginPage() {
  const { user, login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
      useState(false);

  if (user) {
    return (
        <Navigate
            to={location.state?.from || routeForRole(user.role)}
            replace
        />
    );
  }

  async function submit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const loggedInUser =
          await login(form);

      const requestedPage =
          location.state?.from;

      navigate(
          requestedPage ||
          routeForRole(
              loggedInUser.role
          ),
          {
            replace: true,
          }
      );
    } catch (requestError) {
      setError(
          requestError.response?.data
              ?.message ||
          "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
      <section className="auth-section mx-auto max-w-md">
        <div className="auth-panel panel overflow-hidden">
          <div className="auth-heading text-white">
            <p className="eyebrow text-orange-400">
              Account Access
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              Sign in to Mustafa Hardware.
            </p>
          </div>

          <form
              className="space-y-5 p-8"
              onSubmit={submit}
          >
            {error && (
                <p
                    role="alert"
                    className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700"
                >
                  {error}
                </p>
            )}

            <div>
              <label
                  className="field-label"
                  htmlFor="login-email"
              >
                Email
              </label>

              <input
                  id="login-email"
                  className="field-input"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={form.email}
                  onChange={(event) =>
                      setForm({
                        ...form,
                        email:
                        event.target.value,
                      })
                  }
              />
            </div>

            <div>
              <label
                  className="field-label"
                  htmlFor="login-password"
              >
                Password
              </label>

              <input
                  id="login-password"
                  className="field-input"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(event) =>
                      setForm({
                        ...form,
                        password:
                        event.target.value,
                      })
                  }
              />
            </div>

            <button
                type="submit"
                className="btn-primary w-full py-3"
                disabled={submitting}
            >
              {submitting
                  ? "Signing in..."
                  : "Sign In"}
            </button>

            <p className="text-center text-sm text-slate-500">
              New to Mustafa Hardware?{" "}
              <Link
                  className="font-bold text-orange-700 hover:underline"
                  to="/register"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </section>
  );
}
