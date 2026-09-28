import { useState } from "react";

export default function ProductImage({ product, className = "" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const url = product.imageUrl;
  const usable = url && /^(https?:\/\/|\/)/i.test(url) && failedUrl !== url;
  return usable ? (
    <img src={url} alt={product.name} onError={() => setFailedUrl(url)}
      className={`object-contain ${className}`} loading="lazy" />
  ) : (
    <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
      <span className="text-sm">No image available</span>
    </div>
  );
}
