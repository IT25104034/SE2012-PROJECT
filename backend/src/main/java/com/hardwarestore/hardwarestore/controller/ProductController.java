package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.service.ProductService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET all products
    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(defaultValue = "false") boolean includeInactive, HttpSession session) {
        if (includeInactive) CatalogueAccess.requireAdmin(session);
        return productService.getAllProducts(includeInactive);
    }

    // GET product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id
    ) {
        Product product = productService.getProductById(id);
        if (!product.isActive() || !product.getCategory().isActive()) {
            throw new com.hardwarestore.hardwarestore.exception.ResourceNotFoundException("Product not found with id: " + id);
        }
        return ResponseEntity.ok(product);
    }

    // CREATE product
    @PostMapping
    public ResponseEntity<Product> createProduct(
            @Valid @RequestBody Product product, HttpSession session
    ) {
        CatalogueAccess.requireAdmin(session);
        Product createdProduct =
                productService.createProduct(product);

        return ResponseEntity.ok(createdProduct);
    }

    // UPDATE product
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product product, HttpSession session
    ) {
        CatalogueAccess.requireAdmin(session);
        Product updatedProduct =
                productService.updateProduct(id, product);

        return ResponseEntity.ok(updatedProduct);
    }

    // DELETE product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, HttpSession session) {
        CatalogueAccess.requireAdmin(session);
        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }
}
