# Sample catalogue photographs

All 52 products in the local ECOM catalogue now use downloaded photographs in `frontend/public/images/products/`. The database stores a public path such as `/images/products/claw-hammer-16-oz.jpg` in each product's `imageUrl`. Vite serves these files during development and copies them into the production build.

The files are original downloads, with no generated images. Names, descriptions, prices, categories and stock quantities were preserved. Some retailer listings share a photograph across sizes. The twelve original generic sample products use representative photographs; their brand, size or pack contents can differ. The normal 1/4-inch anchor also uses a representative normal-anchor photograph because its source listing has a placeholder.

See [the image source manifest](data/product-image-sources.json) for each product's local URL, source page, downloaded image URL, match type and file checksum. HardwareMart supplied the plumbing, painting and adhesive pictures; Homemart supplied fastener pictures. The representative samples use the retailers identified in the manifest. Rights remain with the source owners.

Images and mappings are committed to Git; the ECOM database itself is not. On a fresh database, use each manifest entry's `productName` to find the product and set its `imageUrl` through **Admin → Products → Edit**. The forty sourced product records in [the reference catalogue](data/hardware-reference-catalogue.json) also include their local image paths. Do not rely on product IDs, which can differ between databases.

To add another photo, put the downloaded file in `frontend/public/images/products/`, then enter `/images/products/your-file.jpg` in the admin form's **Image URL** field. Record its source alongside the other manifest entries.

Validation: all 52 ECOM image paths matched local files and returned the original image bytes through the frontend. All six catalogue pages rendered their photographs (9, 9, 9, 9, 9, 7 products); the production build passed.
