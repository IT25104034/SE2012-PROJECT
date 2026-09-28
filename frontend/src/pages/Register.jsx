import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";


export default function Register() {

    const navigate = useNavigate();

    const {
        register,
    } = useAuth();


    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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


        if (form.password.length < 8) {

            setError(
                "Password must be at least 8 characters."
            );

            return;
        }


        if (
            form.password !==
            form.confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        setLoading(true);


        try {

            await register({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });


            navigate("/login", {
                state: {
                    message:
                        "Account created successfully. Please sign in.",
                },
            });


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
                    "Unable to create account."
                );

            } else {

                setError(
                    "Unable to create account. Please try again."
                );
            }


        } finally {

            setLoading(false);
        }
    }


    return (
        <section className="industrial-dark industrial-grid min-h-[calc(100vh-85px)] px-5 py-16 lg:px-8">

            <div className="mx-auto grid w-full max-w-[1200px] overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl lg:grid-cols-[0.9fr_1fr]">

                {/* REGISTER FORM */}

                <div className="bg-[#f3f1eb] p-7 sm:p-10 lg:p-12">

                    <div className="mx-auto max-w-md">

                        <p className="section-kicker">
                            New Customer
                        </p>

                        <h1 className="section-title mt-3 text-4xl sm:text-5xl">
                            CREATE
                            <span className="block text-orange-500">
                ACCOUNT.
              </span>
                        </h1>

                        <p className="mt-5 text-sm leading-7 text-black/45">
                            Create your Mustafa Hardware
                            customer account to access
                            shopping and order features.
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

                            {/* NAME */}

                            <div>

                                <label
                                    htmlFor="register-name"
                                    className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="register-name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={change}
                                    required
                                    autoComplete="name"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-black/10 bg-white px-4 py-4 text-sm font-medium outline-none transition placeholder:text-black/25 focus:border-orange-500"
                                    placeholder="Enter your name"
                                />

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label
                                    htmlFor="register-email"
                                    className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="register-email"
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
                                    htmlFor="register-password"
                                    className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
                                >
                                    Password
                                </label>

                                <input
                                    id="register-password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={change}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-black/10 bg-white px-4 py-4 text-sm font-medium outline-none transition placeholder:text-black/25 focus:border-orange-500"
                                    placeholder="Minimum 8 characters"
                                />

                            </div>


                            {/* CONFIRM PASSWORD */}

                            <div>

                                <label
                                    htmlFor="register-confirm-password"
                                    className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    id="register-confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    value={
                                        form.confirmPassword
                                    }
                                    onChange={change}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-black/10 bg-white px-4 py-4 text-sm font-medium outline-none transition placeholder:text-black/25 focus:border-orange-500"
                                    placeholder="Enter password again"
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4"
                            >
                                {loading
                                    ? "Creating Account..."
                                    : "Create Account →"}
                            </button>

                        </form>


                        <div className="mt-8 border-t border-black/10 pt-6 text-center">

                            <p className="text-sm text-black/45">
                                Already have an account?
                            </p>

                            <Link
                                to="/login"
                                className="mt-2 inline-block text-sm font-black uppercase tracking-[0.1em] text-orange-600 transition hover:text-orange-700"
                            >
                                Sign In →
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


                {/* RIGHT SIDE */}

                <div className="relative hidden min-h-[760px] overflow-hidden border-l border-white/10 p-12 text-white lg:flex lg:flex-col lg:justify-between">

                    <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-orange-500/15 blur-[110px]" />


                    <div className="relative">

                        <p className="section-kicker">
                            Mustafa Hardware
                        </p>

                        <h2 className="display-title mt-6 text-6xl text-white">
                            START YOUR
                            <span className="block text-orange-500">
                NEXT PROJECT.
              </span>
                        </h2>

                        <p className="mt-7 max-w-md text-base leading-8 text-white/45">
                            One account gives you access to
                            products, shopping features and
                            your order history.
                        </p>

                    </div>


                    <div className="relative space-y-5">

                        {[
                            [
                                "01",
                                "Browse professional products",
                            ],
                            [
                                "02",
                                "Manage your shopping cart",
                            ],
                            [
                                "03",
                                "View your previous orders",
                            ],
                        ].map(
                            ([number, text]) => (

                                <div
                                    key={number}
                                    className="flex items-center gap-5 border-t border-white/10 pt-5"
                                >

                  <span className="text-xs font-black tracking-[0.16em] text-orange-500">
                    {number}
                  </span>

                                    <p className="text-sm font-bold text-white/75">
                                        {text}
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                </div>

            </div>

        </section>
    );
}