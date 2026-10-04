import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory } from "../services/categoryService.js";

export default function EditCategoryForm({ category, onClose }) {
  const queryClient = useQueryClient();

  const [active, setActive] = useState(category.active ?? true);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(
    category.description ?? ""
  );

  const updateMutation = useMutation({
    mutationFn: updateCategory,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      onClose();
    },
  });

  const errorData = updateMutation.error?.response?.data;

  const fieldErrors =
    errorData && typeof errorData === "object" && !errorData.message
      ? errorData
      : {};

  const generalError = updateMutation.isError
    ? errorData?.message ||
      (Object.keys(fieldErrors).length === 0
        ? "Unable to update the category. Please try again."
        : "")
    : "";

  function handleSubmit(event) {
    event.preventDefault();

    if (updateMutation.isPending) return;

    updateMutation.mutate({
      categoryId: category.categoryId,
      category: {
        active,
        name: name.trim(),
        description: description.trim() || null,
      },
    });
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50 p-6">
      <h3 className="text-lg font-bold text-slate-900">
        Edit Category
      </h3>

      {generalError && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {generalError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="edit-category-name"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Category name *
          </label>

          <input
            id="edit-category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
            disabled={updateMutation.isPending}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={
              fieldErrors.name ? "edit-category-name-error" : undefined
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />

          {fieldErrors.name && (
            <p
              id="edit-category-name-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-category-description"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="edit-category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            disabled={updateMutation.isPending}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={
              fieldErrors.description
                ? "edit-category-description-error"
                : undefined
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />

          {fieldErrors.description && (
            <p
              id="edit-category-description-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {fieldErrors.description}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} disabled={updateMutation.isPending} onChange={(event) => setActive(event.target.checked)} />
          Available in the catalogue
        </label>
        <p className="text-sm text-slate-500">Archiving a category hides its products. Restore it here when needed.</p>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
