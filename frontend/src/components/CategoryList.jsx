import { useState } from "react";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCategories,
  deleteCategory,
} from "../services/categoryService.js";

import EditCategoryForm from "./EditCategoryForm.jsx";


export default function CategoryList() {

  const [editingCategory, setEditingCategory] =
      useState(null);

  const [deleteMessage, setDeleteMessage] =
      useState("");

  const queryClient = useQueryClient();


  const deleteMutation = useMutation({
    mutationFn: deleteCategory,

    onSuccess: async () => {

      setDeleteMessage(
          "Category deleted successfully."
      );

      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });


  function handleDelete(category) {

    if (deleteMutation.isPending) {
      return;
    }

    if (
        window.confirm(
            `Permanently delete "${category.name}"?`
        )
    ) {

      setDeleteMessage("");

      deleteMutation.mutate(
          category.categoryId
      );
    }
  }


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
      <section className="mt-10 overflow-hidden rounded-xl border border-black/10 bg-white">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-6 border-b border-black/10 bg-[#f8f6f1] px-6 py-6 sm:flex-row sm:items-center sm:px-8">

          <div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
              Catalogue Structure
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Product Categories
            </h2>

            <p className="mt-2 text-sm text-black/45">
              Manage the categories used across the
              Mustafa Hardware catalogue.
            </p>

          </div>


          <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn-outline self-start sm:self-auto"
          >
            {isFetching
                ? "Refreshing..."
                : "Refresh"}
          </button>

        </div>


        {/* DELETE SUCCESS */}

        {deleteMessage && (
            <div
                role="status"
                className="m-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-800 sm:m-8"
            >
              {deleteMessage}
            </div>
        )}


        {/* DELETE ERROR */}

        {deleteMutation.isError && (
            <div
                role="alert"
                className="m-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 sm:m-8"
            >
              {deleteMutation.error.response?.data
                      ?.message ||
                  "Unable to delete this category. It may be linked to products."}
            </div>
        )}


        {/* EDIT FORM */}

        {editingCategory && (
            <div className="border-b border-black/10 bg-[#f3f1eb] p-6 sm:p-8">

              <EditCategoryForm
                  key={
                    editingCategory.categoryId
                  }
                  category={editingCategory}
                  onClose={() =>
                      setEditingCategory(null)
                  }
              />

            </div>
        )}


        {/* CONTENT */}

        {isPending ? (

            <div className="p-8">

              <p className="section-kicker">
                Categories
              </p>

              <h3 className="mt-3 text-xl font-black">
                Loading categories...
              </h3>

            </div>

        ) : isError ? (

            <div
                role="alert"
                className="m-6 rounded-xl border border-orange-200 bg-orange-50 p-6 sm:m-8"
            >

              <p className="section-kicker">
                Connection Error
              </p>

              <h3 className="mt-3 text-xl font-black">
                Unable to load categories.
              </h3>

              <p className="mt-2 text-sm text-black/50">
                {error.response?.data?.message ||
                    error.message}
              </p>

              <button
                  className="btn-primary mt-5"
                  onClick={() => refetch()}
              >
                Retry
              </button>

            </div>

        ) : categories.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#171717] text-lg font-black text-orange-500">
                MH
              </div>

              <h3 className="mt-5 text-2xl font-black">
                No categories yet.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-black/45">
                Create your first category using the
                form above.
              </p>

            </div>

        ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px] text-left text-sm">

                <thead className="bg-[#171717] text-white">

                <tr>

                  {[
                    "ID",
                    "Category",
                    "Description",
                    "Actions",
                  ].map((title) => (

                      <th
                          key={title}
                          scope="col"
                          className="px-6 py-4 text-xs font-black uppercase tracking-[0.12em]"
                      >
                        {title}
                      </th>

                  ))}

                </tr>

                </thead>


                <tbody className="divide-y divide-black/5">

                {categories.map(
                    (category, index) => (

                        <tr
                            key={
                              category.categoryId
                            }
                            className="transition hover:bg-[#faf8f4]"
                        >

                          {/* ID */}
                          <td className="px-6 py-5">

                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-orange-100 px-3 text-xs font-black text-orange-700">
                        {String(
                            index + 1
                        ).padStart(2, "0")}
                      </span>

                          </td>


                          {/* NAME */}
                          <td className="px-6 py-5">

                            <p className="font-black text-black">
                              {category.name}
                            </p>

                            <p className="mt-1 text-xs text-black/35">
                              Category ID:{" "}
                              {category.categoryId}
                            </p>

                          </td>


                          {/* DESCRIPTION */}
                          <td className="max-w-md px-6 py-5 text-sm leading-6 text-black/50">

                            {category.description ||
                                "No description provided."}

                          </td>


                          {/* ACTIONS */}
                          <td className="px-6 py-5">

                            <div className="flex gap-2">

                              <button
                                  type="button"
                                  onClick={() => {

                                    deleteMutation.reset();

                                    setDeleteMessage("");

                                    setEditingCategory(
                                        category
                                    );
                                  }}
                                  disabled={
                                      editingCategory !==
                                      null ||
                                      deleteMutation.isPending
                                  }
                                  className="btn-outline"
                              >
                                Edit
                              </button>


                              <button
                                  type="button"
                                  onClick={() =>
                                      handleDelete(
                                          category
                                      )
                                  }
                                  disabled={
                                      editingCategory !==
                                      null ||
                                      deleteMutation.isPending
                                  }
                                  className="btn-danger"
                              >
                                {deleteMutation.isPending &&
                                deleteMutation.variables ===
                                category.categoryId
                                    ? "Deleting..."
                                    : "Delete"}
                              </button>

                            </div>

                          </td>

                        </tr>

                    )
                )}

                </tbody>

              </table>

            </div>
        )}

      </section>
  );
}