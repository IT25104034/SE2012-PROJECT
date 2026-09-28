import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
    const navigate = useNavigate();

    const {
        login,
    } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    function change(event) {
        setForm((previous) => ({
            ...previous,
            [event.target.name]:
            event.target.value,
        }));

        setError("");
    }


    async function submit(event) {
        event.preventDefault();

        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const user = await login({
                email: form.email.trim(),
                password: form.password,
            });

            if (user.role === "ADMIN") {
                navigate("/admin/products");
            } else {
                navigate("/");
            }

        } catch (error) {
            const data =
                error.response?.data;

            if (data?.message) {
                setError(data.message);
            } else if (
                data &&
                typeof data === "object"
            ) {
                setError(
                    Object.values(data)[0] ||
                    "Unable to login."
                );
            } else {
                setError(
                    "Unable to login. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    }


    return (
        <section className="industrial-dark industrial-grid min-h-[calc(100vh-85px)] px-5 py-16 lg:px-8">

            <div className="mx-auto grid w-full max-w-[1200px] overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl lg:grid-cols-[1fr_0.9fr]">

                {/* LEFT SIDE */}

                <div className="relative hidden min-h-[680px] overflow-hidden border-r border-white/10 p-12 text-white lg:flex lg:flex-col lg:justify-between">

                    <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-500/15 blur-[100px]" />

                    <div className="relative">

                        <p className="section-kicker">
                            Mustafa Hardware
                        </p>

                        <h1 className="display-title mt-6 text-6xl text-white">
                            BUILT FOR
                            <span className="block text-orange-500">
                REAL WORK.
              </span>
                        </h1>

                        <p className="mt-7 max-w-md text-base leading-8 text-white/45">
                            Sign in to manage your account,
                            orders and hardware experience.
                        </p>

                    </div>


                    <div className="relative">

                        <div className="metal-line mb-6" />

                        <div className="grid grid-cols-3 gap-5">

                            <div>
                                <p className="text-xl font-black">
                                    Secure
                                </p>

                                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/35">
                                    Session Login
                                </p>
                            </div>


                            <div>
                                <p className="text-xl font-black">
                                    Fast
                                </p>

                                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/35">
                                    Access
                                </p>
                            </div>


                            <div>
                                <p className="text-xl font-black text-orange-500">
                                    MH
                                </p>

                                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/35">
                                    Account
                                </p>
                            </div>

                        </div>

                    </div>

                </div>


                {/* LOGIN FORM */}

                <div className="bg-[#f3f1eb] p-7 sm:p-10 lg:p-12">

                    <div className="mx-auto max-w-md">

                        <p className="section-kicker">
                            Member Access
                        </p>

                        <h2 className="section-title mt-3 text-4xl sm:text-5xl">
                            WELCOME
                            <span className="block text-orange-500">
                BACK.
              </span>
                        </h2>

                        <p className="mt-5 text-sm leading-7 text-black/45">
                            Login using your Mustafa Hardware
                            account details.
                        </p>


                        {error && (
                            <div
                                role="alert"
                                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"
                            >
                                {error}
                            </div>
                        )}


                        <form
                            onSubmit={submit}
                            className="mt-8 space-y-5"
                        >

                            {/* EMAIL */}

                            <div>

                                <label
                                    htmlFor="login-email"
                                    className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={change}
                                    required
                                    autoComplete="email"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-black/10 bg-white px-4 py-4 text-sm font-medium outline-none transition placeholder:text-black/25 focus:border-orange-500"
                                    placeholder="you@example.com"
                                />

                            </div>


                            {/* PASSWORD */}

                            <div>

                                <label
                                    htmlFor="login-password"
                                    className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
                                >
                                    Password
                                </label>

                                <input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={change}
                                    required
                                    autoComplete="current-password"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-black/10 bg-white px-4 py-4 text-sm font-medium outline-none transition placeholder:text-black/25 focus:border-orange-500"
                                    placeholder="Enter your password"
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4"
                            >
                                {loading
                                    ? "Signing In..."
                                    : "Sign In →"}
                            </button>

                        </form>


                        <div className="mt-8 border-t border-black/10 pt-6 text-center">

                            <p className="text-sm text-black/45">
                                Don't have an account?
                            </p>

                            <Link
                                to="/register"
                                className="mt-2 inline-block text-sm font-black uppercase tracking-[0.1em] text-orange-600 transition hover:text-orange-700"
                            >
                                Create Account →
                            </Link>

                        </div>


                        <Link
                            to="/"
                            className="mt-8 block text-center text-xs font-bold uppercase tracking-[0.12em] text-black/35 transition hover:text-black"
                        >
                            ← Back to Store
                        </Link>

                    </div>

                </div>

            </div>

        </section>
    );
}