import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  getProducts,
  deleteProduct,
} from "../services/productService.js";

import { getCategories } from "../services/categoryService.js";

import ProductImage from "./ProductImage.jsx";
import ProductForm from "./ProductForm.jsx";

export default function ProductBrowser({ management = false }) {

  const client = useQueryClient();

  const [params, setParams] = useSearchParams();

  const [editor, setEditor] = useState(null);

  const [message, setMessage] = useState("");

  const products = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const remove = useMutation({
    mutationFn: deleteProduct,

    onSuccess: async () => {
      setMessage("Product deleted successfully.");

      await client.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });


  const search = params.get("search") ?? "";

  const category =
      params.get("categoryId") ?? "";

  const min = params.get("min") ?? "";

  const max = params.get("max") ?? "";

  const sort =
      params.get("sort") ?? "name";


  const invalidRange =
      min !== "" &&
      max !== "" &&
      Number(min) > Number(max);


  function filter(name, value) {

    setParams(
        (previous) => {

          const next =
              new URLSearchParams(previous);

          if (value) {
            next.set(name, value);
          } else {
            next.delete(name);
          }

          return next;
        },
        {
          replace: true,
        }
    );
  }


  const visible =
      (products.data ?? [])
          .filter((product) => {

            const matchesSearch =
                `${product.name} ${product.description ?? ""}`
                    .toLowerCase()
                    .includes(
                        search
                            .trim()
                            .toLowerCase()
                    );

            const matchesCategory =
                !category ||
                String(
                    product.category?.categoryId
                ) === category;

            const matchesMin =
                min === "" ||
                Number(product.price) >= Number(min);

            const matchesMax =
                max === "" ||
                Number(product.price) <= Number(max);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesMin &&
                matchesMax
            );
          })
          .sort((a, b) => {

            if (sort === "price-low") {
              return (
                  Number(a.price) -
                  Number(b.price)
              );
            }

            if (sort === "price-high") {
              return (
                  Number(b.price) -
                  Number(a.price)
              );
            }

            return a.name.localeCompare(b.name);
          });


  return (
      <div className="bg-[#f3f1eb]">

        {/* =====================================================
          PAGE HEADER
          ===================================================== */}

        <section
            className={
              management
                  ? "border-b border-black/10 bg-[#f3f1eb] px-5 py-12 lg:px-10"
                  : "industrial-dark industrial-grid px-5 py-16 text-white lg:px-8 lg:py-24"
            }
        >
          <div
              className={
                management
                    ? "mx-auto max-w-[1500px]"
                    : "mx-auto max-w-[1400px]"
              }
          >

            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

              <div>

                <p className="section-kicker">
                  {management
                      ? "Store management"
                      : "Mustafa Hardware Catalogue"}
                </p>

                <h1
                    className={
                      management
                          ? "section-title mt-4 text-4xl text-black sm:text-6xl"
                          : "display-title mt-5 text-5xl text-white sm:text-7xl lg:text-8xl"
                    }
                >
                  {management ? (
                      <>
                        PRODUCT
                        <span className="block text-orange-500">
                      MANAGEMENT.
                    </span>
                      </>
                  ) : (
                      <>
                        TOOLS FOR
                        <span className="block text-orange-500">
                      EVERY JOB.
                    </span>
                      </>
                  )}
                </h1>

                <p
                    className={
                      management
                          ? "mt-6 max-w-2xl text-base leading-7 text-black/50"
                          : "mt-7 max-w-2xl text-base leading-8 text-white/55"
                    }
                >
                  {management
                      ? "Create, update and maintain the Mustafa Hardware product catalogue."
                      : "Browse professional tools, electronics and essential supplies for your next project."}
                </p>

              </div>


              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                    className={
                      management
                          ? "btn-outline"
                          : "hero-button-secondary"
                    }
                    disabled={
                      products.isFetching
                    }
                    onClick={() =>
                        products.refetch()
                    }
                >
                  {products.isFetching
                      ? "Refreshing..."
                      : "Refresh"}
                </button>

                {management && (
                    <button
                        className="btn-primary"
                        disabled={
                            editor !== null ||
                            remove.isPending
                        }
                        onClick={() => {
                          setMessage("");
                          remove.reset();
                          setEditor({});
                        }}
                    >
                      + Add Product
                    </button>
                )}

              </div>

            </div>

          </div>
        </section>


        {/* =====================================================
          CONTENT
          ===================================================== */}

        <section className="px-5 py-10 lg:px-8 lg:py-14">

          <div
              className={
                management
                    ? "mx-auto max-w-[1500px]"
                    : "mx-auto max-w-[1400px]"
              }
          >

            {/* SUCCESS */}

            {message && (
                <div
                    role="status"
                    className="mb-7 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-800"
                >
                  {message}
                </div>
            )}


            {/* DELETE ERROR */}

            {remove.isError && (
                <div
                    role="alert"
                    className="mb-7 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-800"
                >
                  {remove.error.response?.data?.message ||
                      "Unable to delete the product. It may be referenced by a cart or order."}
                </div>
            )}


            {/* PRODUCT EDITOR */}

            {editor && (
                <div className="mb-10">
                  <ProductForm
                      key={
                          editor.productId ??
                          "new"
                      }
                      product={
                        editor.productId
                            ? editor
                            : null
                      }
                      onClose={() =>
                          setEditor(null)
                      }
                      onSaved={setMessage}
                  />
                </div>
            )}


            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

              {/* =================================================
                FILTER SIDEBAR
                ================================================= */}

              <aside className="h-fit rounded-xl bg-[#171717] p-6 text-white lg:sticky lg:top-28">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                      Refine
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Filters
                    </h2>
                  </div>

                  <button
                      className="text-xs font-bold uppercase tracking-[0.12em] text-white/45 transition hover:text-orange-500"
                      onClick={() =>
                          setParams({})
                      }
                  >
                    Reset
                  </button>

                </div>


                <div className="mt-7 h-px bg-white/10" />


                {/* SEARCH */}

                <div className="mt-7">

                  <label
                      className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white/50"
                      htmlFor="product-search"
                  >
                    Search
                  </label>

                  <input
                      id="product-search"
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none"
                      value={search}
                      onChange={(event) =>
                          filter(
                              "search",
                              event.target.value
                          )
                      }
                      placeholder="Product name..."
                  />

                </div>


                {/* CATEGORY */}

                <div className="mt-6">

                  <label
                      className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white/50"
                      htmlFor="category-filter"
                  >
                    Category
                  </label>

                  <select
                      id="category-filter"
                      className="w-full rounded-lg border border-white/15 bg-[#222222] px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none"
                      value={category}
                      onChange={(event) =>
                          filter(
                              "categoryId",
                              event.target.value
                          )
                      }
                  >
                    <option value="">
                      All categories
                    </option>

                    {(categories.data ?? [])
                        .map((item) => (
                            <option
                                key={
                                  item.categoryId
                                }
                                value={
                                  item.categoryId
                                }
                            >
                              {item.name}
                            </option>
                        ))}

                  </select>


                  {categories.isError && (
                      <p className="mt-2 text-xs text-orange-300">

                        Categories unavailable.{" "}

                        <button
                            onClick={() =>
                                categories.refetch()
                            }
                            className="font-bold underline"
                        >
                          Retry
                        </button>

                      </p>
                  )}

                </div>


                {/* PRICE */}

                <div className="mt-6">

                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
                    Price range
                  </p>

                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <label
                          className="sr-only"
                          htmlFor="min-price"
                      >
                        Minimum price
                      </label>

                      <input
                          id="min-price"
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none"
                          type="number"
                          min="0"
                          value={min}
                          onChange={(event) =>
                              filter(
                                  "min",
                                  event.target.value
                              )
                          }
                          placeholder="Min"
                      />

                    </div>

                    <div>

                      <label
                          className="sr-only"
                          htmlFor="max-price"
                      >
                        Maximum price
                      </label>

                      <input
                          id="max-price"
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none"
                          type="number"
                          min="0"
                          value={max}
                          onChange={(event) =>
                              filter(
                                  "max",
                                  event.target.value
                              )
                          }
                          placeholder="Max"
                      />

                    </div>

                  </div>


                  {invalidRange && (
                      <p
                          role="alert"
                          className="mt-3 text-xs font-semibold text-red-300"
                      >
                        Minimum price cannot exceed maximum.
                      </p>
                  )}

                </div>


                <div className="mt-8 border-t border-white/10 pt-6">

                  <p className="text-xs leading-6 text-white/35">
                    Use filters to quickly find products by
                    name, category or price.
                  </p>

                </div>

              </aside>


              {/* =================================================
                PRODUCTS
                ================================================= */}

              <div className="min-w-0">

                {/* RESULT + SORT */}

                <div className="mb-6 flex flex-col justify-between gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                      Catalogue
                    </p>

                    <p className="mt-1 text-sm text-black/45">
                      {products.isSuccess
                          ? `${visible.length} product${visible.length === 1 ? "" : "s"} found`
                          : "Loading catalogue"}
                    </p>

                  </div>


                  <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-black/45">

                    Sort

                    <select
                        className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-black outline-none transition focus:border-orange-500"
                        value={sort}
                        onChange={(event) =>
                            filter(
                                "sort",
                                event.target.value
                            )
                        }
                    >
                      <option value="name">
                        Name
                      </option>

                      <option value="price-low">
                        Price: low to high
                      </option>

                      <option value="price-high">
                        Price: high to low
                      </option>

                    </select>

                  </label>

                </div>


                {/* LOADING */}

                {products.isPending ? (

                    <div
                        role="status"
                        className="rounded-xl border border-black/10 bg-white p-10"
                    >
                      <p className="section-kicker">
                        Catalogue
                      </p>

                      <h2 className="mt-3 text-2xl font-black">
                        Loading products...
                      </h2>
                    </div>


                ) : products.isError ? (

                    /* ERROR */

                    <div
                        role="alert"
                        className="rounded-xl border border-orange-200 bg-orange-50 p-8"
                    >
                      <p className="section-kicker">
                        Connection error
                      </p>

                      <h2 className="mt-3 text-2xl font-black text-black">
                        Products are currently unavailable.
                      </h2>

                      <p className="mt-3 max-w-xl text-sm leading-7 text-black/50">
                        Check that the Spring Boot backend is running,
                        then refresh the catalogue.
                      </p>

                      <button
                          className="btn-primary mt-6"
                          onClick={() =>
                              products.refetch()
                          }
                      >
                        Retry
                      </button>
                    </div>


                ) : visible.length === 0 ? (

                    /* EMPTY */

                    <div className="rounded-xl border border-black/10 bg-white p-12 text-center">

                      <p className="section-kicker">
                        No results
                      </p>

                      <h2 className="mt-4 text-3xl font-black">
                        No products found.
                      </h2>

                      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/45">
                        {products.data.length
                            ? "Try changing your filters or resetting the catalogue."
                            : "Products will appear here after they are added."}
                      </p>

                    </div>


                ) : management ? (

                    /* =================================================
                       MANAGEMENT TABLE
                       ================================================= */

                    <div className="overflow-hidden rounded-xl border border-black/10 bg-white">

                      <div className="overflow-x-auto">

                        <table className="w-full min-w-[850px] text-left text-sm">

                          <thead className="bg-[#171717] text-white">

                          <tr>

                            {[
                              "Product",
                              "Category",
                              "Stock",
                              "Price",
                              "Actions",
                            ].map((title) => (
                                <th
                                    key={title}
                                    scope="col"
                                    className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em]"
                                >
                                  {title}
                                </th>
                            ))}

                          </tr>

                          </thead>


                          <tbody className="divide-y divide-black/5">

                          {visible.map((product) => (

                              <tr
                                  key={product.productId}
                                  className="transition hover:bg-[#faf8f4]"
                              >

                                <td className="px-5 py-5">

                                  <Link
                                      className="font-black text-black transition hover:text-orange-600"
                                      to={`/products/${product.productId}`}
                                  >
                                    {product.name}
                                  </Link>

                                  <p className="mt-1 max-w-xs truncate text-xs text-black/45">
                                    {product.description ||
                                        "No product description"}
                                  </p>

                                </td>


                                <td className="px-5 py-5 font-semibold text-black/60">
                                  {product.category?.name ||
                                      "Uncategorized"}
                                </td>


                                <td className="px-5 py-5">

                              <span
                                  className={
                                    Number(product.quantity) <= 0
                                        ? "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700"
                                        : Number(product.quantity) <= 5
                                            ? "rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700"
                                            : "rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700"
                                  }
                              >
                                {Number(product.quantity) <= 0
                                    ? "Out of stock"
                                    : `${product.quantity} in stock`}
                              </span>

                                </td>


                                <td className="whitespace-nowrap px-5 py-5 font-black">
                                  Rs.{" "}
                                  {Number(
                                      product.price
                                  ).toLocaleString(
                                      "en-LK",
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                  )}
                                </td>


                                <td className="px-5 py-5">

                                  <div className="flex gap-2">

                                    <button
                                        className="btn-outline"
                                        disabled={
                                            editor !== null ||
                                            remove.isPending
                                        }
                                        onClick={() => {
                                          setMessage("");
                                          remove.reset();
                                          setEditor(product);
                                        }}
                                    >
                                      Edit
                                    </button>


                                    <button
                                        className="btn-danger"
                                        disabled={
                                            editor !== null ||
                                            remove.isPending
                                        }
                                        onClick={() => {

                                          if (
                                              window.confirm(
                                                  `Permanently delete "${product.name}"?`
                                              )
                                          ) {

                                            setMessage("");

                                            remove.mutate(
                                                product.productId
                                            );
                                          }
                                        }}
                                    >
                                      {remove.isPending &&
                                      remove.variables ===
                                      product.productId
                                          ? "Deleting..."
                                          : "Delete"}
                                    </button>

                                  </div>

                                </td>

                              </tr>

                          ))}

                          </tbody>

                        </table>

                      </div>

                    </div>


                ) : (

                    /* =================================================
                       CUSTOMER PRODUCT CARDS
                       ================================================= */

                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                      {visible.map((product) => {

                        const quantity =
                            Number(product.quantity ?? 0);

                        return (

                            <article
                                key={product.productId}
                                className="product-card group flex flex-col"
                            >

                              <Link
                                  to={`/products/${product.productId}`}
                                  className="relative block overflow-hidden bg-[#ebe8e1]"
                              >

                                <div className="absolute left-4 top-4 z-10">

                                  {quantity <= 0 ? (

                                      <span className="rounded-full bg-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                                Out of stock
                              </span>

                                  ) : quantity <= 5 ? (

                                      <span className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                                Low stock
                              </span>

                                  ) : (

                                      <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                                In stock
                              </span>
                                  )}

                                </div>


                                <ProductImage
                                    product={product}
                                    className="h-64 w-full p-8 transition duration-500 group-hover:scale-105"
                                />

                              </Link>


                              <div className="flex flex-1 flex-col p-6">

                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">
                                  {product.category?.name ||
                                      "Hardware"}
                                </p>


                                <h2 className="mt-3 text-xl font-black leading-tight">

                                  <Link
                                      to={`/products/${product.productId}`}
                                      className="transition hover:text-orange-600"
                                  >
                                    {product.name}
                                  </Link>

                                </h2>


                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/45">
                                  {product.description ||
                                      "Professional hardware for your next project."}
                                </p>


                                <div className="mt-auto pt-7">

                                  <div className="flex items-end justify-between gap-4">

                                    <div>

                                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">
                                        Price
                                      </p>

                                      <p className="mt-1 text-xl font-black">
                                        Rs.{" "}
                                        {Number(
                                            product.price
                                        ).toLocaleString(
                                            "en-LK",
                                            {
                                              minimumFractionDigits: 2,
                                            }
                                        )}
                                      </p>

                                    </div>


                                    <span className="text-xs font-bold text-black/35">
                                {quantity} available
                              </span>

                                  </div>


                                  <Link
                                      className="btn-primary mt-5 w-full"
                                      to={`/products/${product.productId}`}
                                  >
                                    View Product →
                                  </Link>

                                </div>

                              </div>

                            </article>
                        );
                      })}

                    </div>
                )}

              </div>

            </div>

          </div>

        </section>

      </div>
  );
}