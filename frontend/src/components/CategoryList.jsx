import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services/categoryService.js";
import EditCategoryForm from "./EditCategoryForm.jsx";

export default function CategoryList() {
  const [editingCategory, setEditingCategory] = useState(null);

  const {
    data: categories = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <section className="mt-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Categories
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Browse your product categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? "Loading..." : "Refresh"}
        </button>
      </div>

      {editingCategory && (
        <EditCategoryForm
          key={editingCategory.categoryId}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {isPending ? (
        <p role="status" className="p-6 text-sm text-slate-500">
          Loading categories...
        </p>
      ) : isError ? (
        <div role="alert" className="m-6 rounded-md bg-red-50 p-4">
          <p className="font-semibold text-red-700">
            Unable to load categories
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error.response?.data?.message || error.message}
          </p>
        </div>
      ) : categories.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">
          No categories have been added yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">
                  ID
                </th>

                <th scope="col" className="px-6 py-3 font-semibold">
                  Category
                </th>

                <th scope="col" className="px-6 py-3 font-semibold">
                  Description
                </th>

                <th scope="col" className="px-6 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr
                  key={category.categoryId}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4 text-slate-500">
                    {category.categoryId}
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {category.name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {category.description || "—"}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(category)}
                      disabled={editingCategory !== null}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}