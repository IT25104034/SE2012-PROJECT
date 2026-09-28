import { useState } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createCategory } from "../services/categoryService.js";

export default function AddCategoryForm() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] =
      useState("");
  const [successMessage, setSuccessMessage] =
      useState("");

  const createMutation = useMutation({
    mutationFn: createCategory,

    onSuccess: () => {
      setName("");
      setDescription("");
      setSuccessMessage(
          "Category created successfully."
      );

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });

  const errorData =
      createMutation.error?.response?.data;

  const fieldErrors =
      errorData &&
      typeof errorData === "object" &&
      !errorData.message
          ? errorData
          : {};

  const generalError =
      createMutation.isError
          ? errorData?.message ||
          (Object.keys(fieldErrors).length === 0
              ? "Unable to save the category. Please try again."
              : "")
          : "";

  function handleSubmit(event) {
    event.preventDefault();

    if (createMutation.isPending) {
      return;
    }

    setSuccessMessage("");

    createMutation.mutate({
      name: name.trim(),
      description:
          description.trim() || null,
    });
  }

  return (
      <section className="mt-10 overflow-hidden rounded-xl border border-black/10 bg-white">

        {/* HEADER */}
        <div className="bg-[#171717] px-6 py-6 text-white sm:px-8">

          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
            Create Category
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Add New Category
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
            Organize products into clear groups
            so customers can browse the catalogue
            faster.
          </p>

        </div>

        {/* SUCCESS */}
        {successMessage && (
            <div
                role="status"
                className="border-b border-green-200 bg-green-50 px-6 py-4 text-sm font-bold text-green-800 sm:px-8"
            >
              {successMessage}
            </div>
        )}

        {/* ERROR */}
        {generalError && (
            <div
                role="alert"
                className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-700 sm:px-8"
            >
              {generalError}
            </div>
        )}

        <form
            onSubmit={handleSubmit}
            noValidate
            className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1fr_auto] lg:items-start"
        >

          {/* CATEGORY NAME */}
          <div>

            <label
                htmlFor="category-name"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
            >
              Category Name *
            </label>

            <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) =>
                    setName(event.target.value)
                }
                maxLength={100}
                required
                disabled={createMutation.isPending}
                aria-invalid={Boolean(
                    fieldErrors.name
                )}
                aria-describedby={
                  fieldErrors.name
                      ? "category-name-error"
                      : undefined
                }
                className="w-full rounded-lg border border-black/10 bg-[#f8f6f1] px-4 py-3.5 text-sm font-medium text-black outline-none transition placeholder:text-black/25 focus:border-orange-500 focus:bg-white disabled:opacity-50"
                placeholder="e.g. Power Tools"
            />

            {fieldErrors.name && (
                <p
                    id="category-name-error"
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
                htmlFor="category-description"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
            >
              Description
            </label>

            <textarea
                id="category-description"
                value={description}
                onChange={(event) =>
                    setDescription(
                        event.target.value
                    )
                }
                maxLength={500}
                rows={3}
                disabled={createMutation.isPending}
                aria-invalid={Boolean(
                    fieldErrors.description
                )}
                aria-describedby={
                  fieldErrors.description
                      ? "category-description-error"
                      : undefined
                }
                className="w-full resize-none rounded-lg border border-black/10 bg-[#f8f6f1] px-4 py-3.5 text-sm font-medium leading-6 text-black outline-none transition placeholder:text-black/25 focus:border-orange-500 focus:bg-white disabled:opacity-50"
                placeholder="Describe products in this category..."
            />

            {fieldErrors.description && (
                <p
                    id="category-description-error"
                    role="alert"
                    className="mt-2 text-xs font-bold text-red-600"
                >
                  {fieldErrors.description}
                </p>
            )}

          </div>

          {/* BUTTON */}
          <div className="lg:pt-[26px]">

            <button
                type="submit"
                disabled={
                  createMutation.isPending
                }
                className="btn-primary w-full whitespace-nowrap lg:w-auto"
            >
              {createMutation.isPending
                  ? "Saving..."
                  : "+ Add Category"}
            </button>

          </div>

        </form>
      </section>
  );
}