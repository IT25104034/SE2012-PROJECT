import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getCategories } from "../services/categoryService.js";
import { saveProduct } from "../services/productService.js";


export default function ProductForm({
                                      product,
                                      onClose,
                                      onSaved,
                                    }) {

  const client = useQueryClient();

  const [imageFailed, setImageFailed] =
      useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    imageUrl: product?.imageUrl ?? "",
    categoryId:
        product?.category?.categoryId ?? "",
  });


  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });


  const mutation = useMutation({
    mutationFn: saveProduct,

    onSuccess: async () => {

      await client.invalidateQueries({
        queryKey: ["products"],
      });

      onSaved(
          product
              ? "Product updated successfully."
              : "Product created successfully."
      );

      onClose();
    },
  });


  const errors =
      mutation.error?.response?.data ?? {};


  function change(event) {

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "imageUrl") {
      setImageFailed(false);
    }
  }


  function submit(event) {

    event.preventDefault();

    if (mutation.isPending) {
      return;
    }

    /*
      Backend expects:

      category: {
        categoryId: ...
      }

      instead of a top-level categoryId.
    */

    mutation.mutate({
      productId: product?.productId,

      product: {
        name: form.name.trim(),

        description:
            form.description.trim() || null,

        price:
            form.price === ""
                ? null
                : Number(form.price),

        imageUrl:
            form.imageUrl.trim() || null,

        category:
            form.categoryId === ""
                ? null
                : {
                  categoryId:
                      Number(form.categoryId),
                },
      },
    });
  }


  function field(
      name,
      label,
      options = {}
  ) {

    return (
        <div>

          <label
              className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
              htmlFor={`product-${name}`}
          >
            {label}
          </label>

          <input
              id={`product-${name}`}
              name={name}
              value={form[name]}
              onChange={change}
              disabled={mutation.isPending}
              className="w-full rounded-lg border border-black/10 bg-[#f8f6f1] px-4 py-3.5 text-sm font-medium text-black outline-none transition placeholder:text-black/25 focus:border-orange-500 focus:bg-white"
              aria-invalid={
                Boolean(errors[name])
              }
              aria-describedby={
                errors[name]
                    ? `${name}-error`
                    : undefined
              }
              {...options}
          />

          {errors[name] && (
              <p
                  id={`${name}-error`}
                  role="alert"
                  className="mt-2 text-xs font-bold text-red-600"
              >
                {errors[name]}
              </p>
          )}

        </div>
    );
  }


  return (
      <section
          className="overflow-hidden rounded-xl border border-black/10 bg-white"
          aria-labelledby="product-form-title"
      >

        {/* HEADER */}

        <div className="bg-[#171717] px-6 py-6 text-white sm:px-8">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                Product Editor
              </p>

              <h2
                  id="product-form-title"
                  className="mt-2 text-2xl font-black sm:text-3xl"
              >
                {product
                    ? "Edit Product"
                    : "Add New Product"}
              </h2>

              <p className="mt-2 text-sm text-white/45">
                {product
                    ? "Update the selected catalogue item."
                    : "Add a new item to the Mustafa Hardware catalogue."}
              </p>

            </div>


            <button
                type="button"
                disabled={mutation.isPending}
                onClick={onClose}
                className="self-start rounded-lg border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-white/65 transition hover:border-orange-500 hover:text-white sm:self-auto"
            >
              Close
            </button>

          </div>

        </div>


        {/* ERROR MESSAGE */}

        {mutation.isError && (

            <div
                role="alert"
                className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-semibold text-red-700 sm:px-8"
            >
              {errors.message ||
                  (
                      mutation.error.response?.status ===
                      400
                          ? "Please check the product information below."
                          : "Unable to save the product. Please try again."
                  )}
            </div>

        )}


        <form
            noValidate
            onSubmit={submit}
            className="grid lg:grid-cols-[1fr_330px]"
        >

          {/* =========================================
            FORM FIELDS
            ========================================= */}

          <div className="p-6 sm:p-8">

            {/* BASIC INFORMATION */}

            <div>

              <div className="mb-6 flex items-center gap-4">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
                01
              </span>

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">
                    Basic information
                  </p>

                  <p className="mt-1 text-sm text-black/40">
                    Fields marked * are required.
                  </p>

                </div>

              </div>


              <div className="space-y-5">

                {field(
                    "name",
                    "Product name *",
                    {
                      required: true,
                      maxLength: 150,
                      autoFocus: true,
                      placeholder:
                          "e.g. Cordless Drill",
                    }
                )}


                <div>

                  <label
                      className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
                      htmlFor="product-description"
                  >
                    Description
                  </label>

                  <textarea
                      id="product-description"
                      name="description"
                      value={form.description}
                      onChange={change}
                      maxLength={1000}
                      rows={5}
                      disabled={
                        mutation.isPending
                      }
                      className="w-full resize-none rounded-lg border border-black/10 bg-[#f8f6f1] px-4 py-3.5 text-sm font-medium leading-7 text-black outline-none transition placeholder:text-black/25 focus:border-orange-500 focus:bg-white"
                      placeholder="Describe the product, specifications or key features..."
                      aria-invalid={
                        Boolean(
                            errors.description
                        )
                      }
                  />

                  {errors.description && (
                      <p
                          role="alert"
                          className="mt-2 text-xs font-bold text-red-600"
                      >
                        {
                          errors.description
                        }
                      </p>
                  )}

                </div>

              </div>

            </div>


            <div className="my-8 h-px bg-black/10" />


            {/* PRICING + CATEGORY */}

            <div>

              <div className="mb-6 flex items-center gap-4">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
                02
              </span>

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">
                    Catalogue details
                  </p>

                  <p className="mt-1 text-sm text-black/40">
                    Set the price and product category.
                  </p>

                </div>

              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                {field(
                    "price",
                    "Price (Rs.) *",
                    {
                      type: "number",
                      step: "0.01",
                      min: "0.01",
                      required: true,
                      placeholder:
                          "24999.00",
                    }
                )}


                <div>

                  <label
                      className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-black/50"
                      htmlFor="product-category"
                  >
                    Category *
                  </label>

                  <select
                      id="product-category"
                      name="categoryId"
                      value={form.categoryId}
                      onChange={change}
                      className="w-full rounded-lg border border-black/10 bg-[#f8f6f1] px-4 py-3.5 text-sm font-medium text-black outline-none transition focus:border-orange-500 focus:bg-white"
                      required
                      disabled={
                          mutation.isPending ||
                          categories.isPending ||
                          categories.isError
                      }
                      aria-invalid={
                        Boolean(
                            errors.category
                        )
                      }
                      aria-describedby={
                        errors.category
                            ? "category-error"
                            : undefined
                      }
                  >

                    <option value="">
                      Select a category
                    </option>

                    {(categories.data ?? [])
                        .map((category) => (

                            <option
                                key={
                                  category.categoryId
                                }
                                value={
                                  category.categoryId
                                }
                            >
                              {category.name}
                            </option>

                        ))}

                  </select>


                  {errors.category && (
                      <p
                          id="category-error"
                          role="alert"
                          className="mt-2 text-xs font-bold text-red-600"
                      >
                        {errors.category}
                      </p>
                  )}


                  {categories.isPending && (
                      <p
                          role="status"
                          className="mt-2 text-xs text-black/45"
                      >
                        Loading categories...
                      </p>
                  )}


                  {categories.isError && (
                      <p
                          role="alert"
                          className="mt-2 text-xs font-semibold text-red-600"
                      >
                        Cannot load categories.{" "}

                        <button
                            type="button"
                            className="font-black underline"
                            onClick={() =>
                                categories.refetch()
                            }
                        >
                          Retry
                        </button>
                      </p>
                  )}


                  {categories.isSuccess &&
                      categories.data.length ===
                      0 && (

                          <p className="mt-2 text-xs leading-6 text-black/50">

                            Create a category first in{" "}

                            <Link
                                className="font-black text-orange-600 underline"
                                to="/admin/categories"
                            >
                              Category Management
                            </Link>
                            .

                          </p>

                      )}

                </div>

              </div>

            </div>


            <div className="my-8 h-px bg-black/10" />


            {/* IMAGE */}

            <div>

              <div className="mb-6 flex items-center gap-4">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
                03
              </span>

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">
                    Product image
                  </p>

                  <p className="mt-1 text-sm text-black/40">
                    Optional external image URL.
                  </p>

                </div>

              </div>


              {field(
                  "imageUrl",
                  "Image URL",
                  {
                    maxLength: 500,
                    placeholder:
                        "https://example.com/product.jpg",
                  }
              )}

            </div>


            {/* BUTTONS */}

            <div className="mt-9 flex flex-col gap-3 border-t border-black/10 pt-7 sm:flex-row">

              <button
                  className="btn-primary"
                  disabled={
                      mutation.isPending ||
                      !categories.data?.length
                  }
              >
                {mutation.isPending
                    ? "Saving..."
                    : product
                        ? "Save Changes"
                        : "Create Product"}
              </button>


              <button
                  type="button"
                  className="btn-outline"
                  disabled={
                    mutation.isPending
                  }
                  onClick={onClose}
              >
                Cancel
              </button>

            </div>

          </div>


          {/* =========================================
            PREVIEW PANEL
            ========================================= */}

          <aside className="border-t border-black/10 bg-[#f3f1eb] p-6 lg:border-l lg:border-t-0">

            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
              Preview
            </p>

            <h3 className="mt-2 text-xl font-black">
              Catalogue Card
            </h3>


            <div className="mt-6 overflow-hidden rounded-xl border border-black/10 bg-white">

              <div className="flex h-48 items-center justify-center bg-[#e9e7e1] p-5">

                {form.imageUrl &&
                !imageFailed ? (

                    <img
                        src={form.imageUrl}
                        alt=""
                        className="h-full w-full object-contain"
                        onError={() =>
                            setImageFailed(true)
                        }
                    />

                ) : (

                    <div className="text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-black text-orange-500">
                        MH
                      </div>

                      <p className="mt-3 text-xs font-bold text-black/35">
                        No image preview
                      </p>

                    </div>

                )}

              </div>


              <div className="p-5">

                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                  {
                      categories.data?.find(
                          (category) =>
                              String(
                                  category.categoryId
                              ) ===
                              String(
                                  form.categoryId
                              )
                      )?.name ||
                      "Product Category"
                  }
                </p>


                <h4 className="mt-2 text-lg font-black">
                  {form.name ||
                      "Product Name"}
                </h4>


                <p className="mt-2 line-clamp-2 text-xs leading-6 text-black/45">
                  {form.description ||
                      "Product description will appear here."}
                </p>


                <div className="mt-5 border-t border-black/10 pt-4">

                  <p className="text-[9px] font-black uppercase tracking-[0.13em] text-black/35">
                    Price
                  </p>

                  <p className="mt-1 text-xl font-black">
                    Rs.{" "}
                    {form.price
                        ? Number(
                            form.price
                        ).toLocaleString(
                            "en-LK",
                            {
                              minimumFractionDigits: 2,
                            }
                        )
                        : "0.00"}
                  </p>

                </div>

              </div>

            </div>


            <div className="mt-6 rounded-xl bg-[#171717] p-5 text-white">

              <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">
                Product tip
              </p>

              <p className="mt-3 text-xs leading-6 text-white/45">
                Use a clear product name,
                useful description and accurate
                category so customers can find
                products quickly.
              </p>

            </div>

          </aside>

        </form>

      </section>
  );
}