import { useState } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateCategory } from "../services/categoryService.js";


export default function EditCategoryForm({
                                           category,
                                           onClose,
                                         }) {

  const queryClient = useQueryClient();

  const [name, setName] =
      useState(category.name);

  const [description, setDescription] =
      useState(
          category.description ?? ""
      );


  const updateMutation = useMutation({
    mutationFn: updateCategory,

    onSuccess: async () => {

      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      onClose();
    },
  });


  const errorData =
      updateMutation.error?.response?.data;

  const fieldErrors =
      errorData &&
      typeof errorData === "object" &&
      !errorData.message
          ? errorData
          : {};

  const generalError =
      updateMutation.isError
          ? errorData?.message ||
          (
              Object.keys(fieldErrors).length === 0
                  ? "Unable to update the category. Please try again."
                  : ""
          )
          : "";


  function handleSubmit(event) {

    event.preventDefault();

    if (updateMutation.isPending) {
      return;
    }

    updateMutation.mutate({
      categoryId:
      category.categoryId,

      category: {
        name: name.trim(),

        description:
            description.trim() || null,
      },
    });
  }


  return (
      <section className="overflow-hidden rounded-xl border border-black/10 bg-white">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 bg-[#171717] px-6 py-6 text-white sm:flex-row sm:items-center">

          <div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
              Category Editor
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Edit Category
            </h3>

            <p className="mt-2 text-sm text-white/45">
              Update the category information used
              across the product catalogue.
            </p>

          </div>


          <button
              type="button"
              onClick={onClose}
              disabled={
                updateMutation.isPending
              }
              className="self-start rounded-lg border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white/65 transition hover:border-orange-500 hover:text-white sm:self-auto"
          >
            Close
          </button>

        </div>


        {/* ERROR */}
        {generalError && (

            <div
                role="alert"
                className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-700"
            >
              {generalError}
            </div>

        )}


        <form
            onSubmit={handleSubmit}
            noValidate
            className="p-6 sm:p-8"
        >

          <div className="grid gap-6 lg:grid-cols-2">

            {/* NAME */}
            <div>

              <label
                  htmlFor="edit-category-name"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
              >
                Category Name *
              </label>

              <input
                  id="edit-category-name"
                  value={name}
                  onChange={(event) =>
                      setName(
                          event.target.value
                      )
                  }
                  maxLength={100}
                  required
                  disabled={
                    updateMutation.isPending
                  }
                  aria-invalid={
                    Boolean(
                        fieldErrors.name
                    )
                  }
                  aria-describedby={
                    fieldErrors.name
                        ? "edit-category-name-error"
                        : undefined
                  }
                  className="w-full rounded-lg border border-black/10 bg-[#f8f6f1] px-4 py-3.5 text-sm font-medium text-black outline-none transition focus:border-orange-500 focus:bg-white disabled:opacity-50"
              />

              {fieldErrors.name && (
                  <p
                      id="edit-category-name-error"
                      role="alert"
                      className="mt-2 text-xs font-bold text-red-600"
                  >
                    {fieldErrors.name}
                  </p>
              )}

            </div>


            {/* DESCRIPTION */}
            <div>

              <label
                  htmlFor="edit-category-description"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
              >
                Description
              </label>

              <textarea
                  id="edit-category-description"
                  value={description}
                  onChange={(event) =>
                      setDescription(
                          event.target.value
                      )
                  }
                  maxLength={500}
                  rows={4}
                  disabled={
                    updateMutation.isPending
                  }
                  aria-invalid={
                    Boolean(
                        fieldErrors.description
                    )
                  }
                  aria-describedby={
                    fieldErrors.description
                        ? "edit-category-description-error"
                        : undefined
                  }
                  className="w-full resize-none rounded-lg border border-black/10 bg-[#f8f6f1] px-4 py-3.5 text-sm font-medium leading-6 text-black outline-none transition focus:border-orange-500 focus:bg-white disabled:opacity-50"
              />

              {fieldErrors.description && (
                  <p
                      id="edit-category-description-error"
                      role="alert"
                      className="mt-2 text-xs font-bold text-red-600"
                  >
                    {fieldErrors.description}
                  </p>
              )}

            </div>

          </div>


          {/* CATEGORY INFO */}
          <div className="mt-7 rounded-xl bg-[#f3f1eb] p-5">

            <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">
              Category Record
            </p>

            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3 text-sm">

              <p className="text-black/45">
                ID:
                <span className="ml-2 font-black text-black">
                {category.categoryId}
              </span>
              </p>

              <p className="text-black/45">
                Current Name:
                <span className="ml-2 font-black text-black">
                {category.name}
              </span>
              </p>

            </div>

          </div>


          {/* ACTIONS */}
          <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row">

            <button
                type="submit"
                disabled={
                  updateMutation.isPending
                }
                className="btn-primary"
            >
              {updateMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
            </button>


            <button
                type="button"
                onClick={onClose}
                disabled={
                  updateMutation.isPending
                }
                className="btn-outline"
            >
              Cancel
            </button>

          </div>

        </form>

      </section>
  );
}