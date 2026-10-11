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

    const users = usersQuery.data ?? [];

    const errorMessage =
        roleMutation.error?.response?.data?.message ||
        activeMutation.error?.response?.data
            ?.message;

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

            <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full min-w-[850px] text-left">
                    <thead className="bg-slate-900 text-white">
                    <tr>
                        <th className="px-5 py-4">
                            Name
                        </th>

                        <th className="px-5 py-4">
                            Email
                        </th>

                        <th className="px-5 py-4">
                            Role
                        </th>

                        <th className="px-5 py-4">
                            Status
                        </th>

                        <th className="px-5 py-4">
                            Action
                        </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
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