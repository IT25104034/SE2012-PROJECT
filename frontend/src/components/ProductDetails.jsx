import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../services/productService.js";
import ProductImage from "./ProductImage.jsx";

export default function ProductDetails() {
  const { productId } = useParams();
  const valid = /^\d+$/.test(productId) && Number(productId) > 0;
  const query = useQuery({ queryKey: ["products", productId], queryFn: () => getProduct(productId), enabled: valid });
  if (!valid || query.isError) return <section className="panel p-10"><h1 className="text-2xl font-bold">{!valid || query.error?.response?.status === 404 ? "Product not found" : "Unable to load product"}</h1><p className="my-4 text-slate-500">{query.error?.response?.data?.message || "Check the product link or try again."}</p><Link className="btn-primary" to="/products">Back to Products</Link>{valid && <button className="btn-outline ml-3" onClick={() => query.refetch()}>Retry</button>}</section>;
  if (query.isPending) return <p role="status">Loading product…</p>;
  const product = query.data;
  return <div><Link className="text-sm font-semibold text-orange-700" to="/products">← Back to Products</Link><article className="panel mt-6 grid overflow-hidden md:grid-cols-2"><ProductImage product={product} className="h-72 w-full p-8 md:h-96" /><div className="p-8"><Link to={`/products?categoryId=${product.category?.categoryId}`} className="eyebrow">{product.category?.name}</Link><h1 className="mt-3 text-3xl font-extrabold">{product.name}</h1><p className="mt-5 text-2xl font-bold">Rs. {Number(product.price).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p><h2 className="mt-8 font-bold">Product description</h2><p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-600">{product.description || "No description has been added for this product."}</p></div></article></div>;
}
