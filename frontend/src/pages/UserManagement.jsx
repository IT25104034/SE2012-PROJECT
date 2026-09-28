import { useMemo } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getUsers,
    updateUserRole,
} from "../services/userService.js";

import { useAuth } from "../context/AuthContext.jsx";

function getInitials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export default function UserManagement() {
    const queryClient = useQueryClient();

    const {
        user: currentUser,
        isAdmin,
    } = useAuth();

    const {
        data: users = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
        enabled: isAdmin,
    });

    const roleMutation = useMutation({
        mutationFn: updateUserRole,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });

    const statistics = useMemo(() => {
        const totalUsers = users.length;

        const admins = users.filter(
            (user) => user.role === "ADMIN"
        ).length;

        const customers = users.filter(
            (user) => user.role === "CUSTOMER"
        ).length;

        return {
            totalUsers,
            admins,
            customers,
        };
    }, [users]);

    function handleRoleChange(userId, role) {
        roleMutation.reset();

        roleMutation.mutate({
            userId,
            role,
        });
    }

    if (!isAdmin) {
        return (
            <section className="min-h-[70vh] bg-[#f4efe6] px-6 py-16">
                <div className="mx-auto max-w-4xl">
                    <div className="panel p-10">
                        <p className="eyebrow">
                            Restricted Area
                        </p>

                        <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-black">
                            Admin access required.
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600">
                            User access and role management can only
                            be performed by an administrator.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4efe6]">
            {/* HEADER */}
            <section className="industrial-dark border-b border-white/10 px-6 py-12 text-white">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                        <div>
                            <p className="section-kicker text-orange-500">
                                User Access Management
                            </p>

                            <h1 className="display-title mt-3 max-w-4xl">
                                ACCESS
                                <br />
                                CONTROL.
                            </h1>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-400">
                                Review registered accounts and control
                                administrative access across the Mustafa
                                Hardware management system.
                            </p>
                        </div>

                        <div className="glass-panel min-w-[260px] p-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                                Signed in as
                            </p>

                            <p className="mt-2 text-lg font-black uppercase text-white">
                                {currentUser?.name}
                            </p>

                            <div className="mt-3 inline-flex bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-black">
                                {currentUser?.role}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-6 py-10">
                {/* STATS */}
                <section className="grid gap-4 md:grid-cols-3">
                    <div className="stat-card">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-neutral-500">
                            Registered Users
                        </p>

                        <p className="mt-4 text-5xl font-black text-black">
                            {statistics.totalUsers}
                        </p>
                    </div>

                    <div className="stat-card">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-neutral-500">
                            Administrators
                        </p>

                        <p className="mt-4 text-5xl font-black text-black">
                            {statistics.admins}
                        </p>
                    </div>

                    <div className="stat-card">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-neutral-500">
                            Customers
                        </p>

                        <p className="mt-4 text-5xl font-black text-black">
                            {statistics.customers}
                        </p>
                    </div>
                </section>

                {/* EXPLANATION */}
                <section className="mt-8 border border-black/10 bg-black p-6 text-white">
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                                Step 01
                            </p>

                            <h3 className="mt-2 text-xl font-black uppercase">
                                Registration
                            </h3>

                            <p className="mt-2 text-sm text-neutral-400">
                                New accounts are created with CUSTOMER
                                access by default.
                            </p>
                        </div>

                        <span className="hidden text-2xl text-orange-500 lg:block">
              →
            </span>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                                Step 02
                            </p>

                            <h3 className="mt-2 text-xl font-black uppercase">
                                Admin Review
                            </h3>

                            <p className="mt-2 text-sm text-neutral-400">
                                Administrator reviews the registered user
                                before granting management access.
                            </p>
                        </div>

                        <span className="hidden text-2xl text-orange-500 lg:block">
              →
            </span>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                                Step 03
                            </p>

                            <h3 className="mt-2 text-xl font-black uppercase">
                                Access Granted
                            </h3>

                            <p className="mt-2 text-sm text-neutral-400">
                                Approved users can be promoted to the
                                ADMIN role.
                            </p>
                        </div>
                    </div>
                </section>

                {/* MESSAGES */}
                {roleMutation.isSuccess && (
                    <div className="mt-6 border border-green-700/20 bg-green-50 px-5 py-4 text-sm font-bold text-green-800">
                        User role updated successfully.
                    </div>
                )}

                {roleMutation.isError && (
                    <div className="mt-6 border border-red-700/20 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                        {roleMutation.error?.response?.data?.message ||
                            "Unable to update user role."}
                    </div>
                )}

                {/* USER TABLE */}
                <section className="mt-8 overflow-hidden border border-black/10 bg-white">
                    <div className="flex flex-col justify-between gap-4 border-b border-black/10 p-6 md:flex-row md:items-center">
                        <div>
                            <p className="eyebrow">
                                Accounts
                            </p>

                            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-black">
                                Registered Users
                            </h2>
                        </div>

                        <div className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
                            {users.length} accounts
                        </div>
                    </div>

                    {isLoading && (
                        <div className="p-10 text-center text-sm font-bold uppercase tracking-[0.15em] text-neutral-500">
                            Loading users...
                        </div>
                    )}

                    {isError && (
                        <div className="m-6 border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
                            {error?.response?.data?.message ||
                                "Unable to load users."}
                        </div>
                    )}

                    {!isLoading &&
                        !isError &&
                        users.length === 0 && (
                            <div className="p-10 text-center text-sm text-neutral-500">
                                No registered users found.
                            </div>
                        )}

                    {!isLoading &&
                        !isError &&
                        users.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px]">
                                    <thead className="bg-[#f4efe6]">
                                    <tr className="text-left text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">
                                        <th className="px-6 py-4">
                                            User
                                        </th>

                                        <th className="px-6 py-4">
                                            Email
                                        </th>

                                        <th className="px-6 py-4">
                                            Current Role
                                        </th>

                                        <th className="px-6 py-4">
                                            Access
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {users.map((account) => {
                                        const isCurrentUser =
                                            account.id === currentUser?.id;

                                        const isAccountAdmin =
                                            account.role === "ADMIN";

                                        return (
                                            <tr
                                                key={account.id}
                                                className="border-t border-black/10 transition hover:bg-neutral-50"
                                            >
                                                {/* USER */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-11 w-11 items-center justify-center bg-black text-xs font-black uppercase text-white">
                                                            {getInitials(
                                                                account.name
                                                            ) || "U"}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-black text-black">
                                                                    {account.name}
                                                                </p>

                                                                {isCurrentUser && (
                                                                    <span className="bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-black">
                                      You
                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs text-neutral-500">
                                                                User ID #{account.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* EMAIL */}
                                                <td className="px-6 py-5 text-sm text-neutral-600">
                                                    {account.email}
                                                </td>

                                                {/* ROLE */}
                                                <td className="px-6 py-5">
                            <span
                                className={
                                    isAccountAdmin
                                        ? "inline-flex bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white"
                                        : "inline-flex bg-[#f4efe6] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-black"
                                }
                            >
                              {account.role}
                            </span>
                                                </td>

                                                {/* ACCESS STATUS */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                              <span
                                  className={`h-2 w-2 rounded-full ${
                                      isAccountAdmin
                                          ? "bg-green-500"
                                          : "bg-neutral-400"
                                  }`}
                              />

                                                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-neutral-600">
                                {isAccountAdmin
                                    ? "Management Access"
                                    : "Customer Access"}
                              </span>
                                                    </div>
                                                </td>

                                                {/* ACTION */}
                                                <td className="px-6 py-5 text-right">
                                                    {isCurrentUser ? (
                                                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-neutral-400">
                                Current Account
                              </span>
                                                    ) : isAccountAdmin ? (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                roleMutation.isPending
                                                            }
                                                            onClick={() =>
                                                                handleRoleChange(
                                                                    account.id,
                                                                    "CUSTOMER"
                                                                )
                                                            }
                                                            className="border border-black px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Set Customer
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                roleMutation.isPending
                                                            }
                                                            onClick={() =>
                                                                handleRoleChange(
                                                                    account.id,
                                                                    "ADMIN"
                                                                )
                                                            }
                                                            className="bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Approve Admin
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </section>
            </main>
        </div>
    );
}