import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "../services/categoryService.js";

export default function AddCategoryForm() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const createMutation = useMutation({
    mutationFn: createCategory,

    onSuccess: () => {
      setName("");
      setDescription("");
      setSuccessMessage("Category created successfully.");

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });

  const errorData = createMutation.error?.response?.data;

  const fieldErrors =
    errorData && typeof errorData === "object" && !errorData.message
      ? errorData
      : {};

  const generalError = createMutation.isError
    ? errorData?.message ||
      (Object.keys(fieldErrors).length === 0
        ? "Unable to save the category. Please try again."
        : "")
    : "";

  function handleSubmit(event) {
    event.preventDefault();

    if (createMutation.isPending) return;

    setSuccessMessage("");

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
    });
  }

  return (
    <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">
        Add Category
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Create a category to organize your products.
      </p>

      {successMessage && (
        <p
          role="status"
          className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {successMessage}
        </p>
      )}

      {generalError && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {generalError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="category-name"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Category name *
          </label>

          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
            disabled={createMutation.isPending}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "category-name-error" : undefined}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            placeholder="e.g. Hand Tools"
          />

          {fieldErrors.name && (
            <p
              id="category-name-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="category-description"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            disabled={createMutation.isPending}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={
              fieldErrors.description ? "category-description-error" : undefined
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            placeholder="Describe the products in this category"
          />

          {fieldErrors.description && (
            <p
              id="category-description-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.description}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createMutation.isPending ? "Saving..." : "Save Category"}
        </button>
      </form>
    </section>
  );
}