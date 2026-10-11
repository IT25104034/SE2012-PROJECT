import { useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "../auth/authContext.js";

import {
    getUsers,
    updateUserRole,
    updateUserActiveStatus,
} from "../services/userService.js";

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const { user: loggedInUser } = useAuth();

    const usersQuery = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const roleMutation = useMutation({
        mutationFn: updateUserRole,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });

    const activeMutation = useMutation({
        mutationFn: updateUserActiveStatus,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["users"],
            });
        },
    });

    if (usersQuery.isLoading) {
        return (
            <div className="panel p-8">
                Loading users...
            </div>
        );
    }

    if (usersQuery.isError) {
        return (
            <div className="panel p-8 text-red-700">
                Unable to load users.
            </div>
        );
    }

    const users = (usersQuery.data ?? []).filter(account =>
        `${account.name} ${account.email} ${account.role}`.toLowerCase().includes(search.trim().toLowerCase())
    );

    const errorMessage =
        roleMutation.error?.response?.data?.message ||
        activeMutation.error?.response?.data
            ?.message || ((roleMutation.isError || activeMutation.isError) ? "Unable to update this account. Please try again." : "");

    return (
        <section>
            <p className="eyebrow">
                Access Control
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
                User & Staff Management
            </h1>

            <p className="mt-2 text-slate-500">
                Manage customers, staff accounts,
                administrators and account status.
            </p>

            {errorMessage && (
                <div className="mt-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-700">
                    {errorMessage}
                </div>
            )}

            <div className="panel mt-6 flex flex-wrap items-end gap-3 p-4">
                <div className="min-w-0 flex-1"><label htmlFor="user-search" className="field-label">Search users</label><input id="user-search" className="field-input" placeholder="Name, email or role" value={search} onChange={event => setSearch(event.target.value)} /></div>
                <button className="btn-outline" disabled={usersQuery.isFetching} onClick={() => usersQuery.refetch()}>Refresh</button>
            </div>
            <div className="panel mt-5 overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                    <thead className="border-b bg-slate-50 text-slate-500">
                    <tr>
                        <th scope="col" className="px-5 py-4">
                            Name
                        </th>

                        <th scope="col" className="px-5 py-4">
                            Email
                        </th>

                        <th scope="col" className="px-5 py-4">
                            Role
                        </th>

                        <th scope="col" className="px-5 py-4">
                            Status
                        </th>

                        <th scope="col" className="px-5 py-4">
                            Action
                        </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                    {users.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>}
                    {users.map((account) => {
                        const isOwnAccount =
                            loggedInUser?.id === account.id;

                        return (
                            <tr key={account.id}>
                                <td className="px-5 py-4 font-semibold">
                                    {account.name}

                                    {isOwnAccount && (
                                        <span className="ml-2 text-xs font-bold text-orange-700">
                        YOU
                      </span>
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    {account.email}
                                </td>

                                <td className="px-5 py-4">
                                    <select
                                        aria-label={`Role for ${account.name}`}
                                        className="field-input"
                                        value={account.role}
                                        disabled={
                                            isOwnAccount ||
                                            roleMutation.isPending
                                        }
                                        onChange={(event) =>
                                            roleMutation.mutate({
                                                userId: account.id,
                                                role:
                                                event.target.value,
                                            })
                                        }
                                    >
                                        <option value="CUSTOMER">
                                            CUSTOMER
                                        </option>

                                        <option value="STAFF">
                                            STAFF
                                        </option>

                                        <option value="ADMIN">
                                            ADMIN
                                        </option>
                                    </select>
                                </td>

                                <td className="px-5 py-4">
                    <span
                        className={
                            account.active
                                ? "font-bold text-green-700"
                                : "font-bold text-red-700"
                        }
                    >
                      {account.active
                          ? "Active"
                          : "Inactive"}
                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    {isOwnAccount ? (
                                        <span className="text-sm text-slate-400">
                        Current account
                      </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn-outline"
                                            disabled={
                                                activeMutation.isPending
                                            }
                                            onClick={() =>
                                                activeMutation.mutate(
                                                    {
                                                        userId:
                                                        account.id,

                                                        active:
                                                            !account.active,
                                                    }
                                                )
                                            }
                                        >
                                            {account.active
                                                ? "Deactivate"
                                                : "Activate"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}