package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.model.Category;
import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.repository.CategoryRepository;
import com.hardwarestore.hardwarestore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // Get all products
    public List<Product> getAllProducts() { return getAllProducts(false); }

    public List<Product> getAllProducts(boolean includeInactive) {
        return productRepository.findAll().stream()
                .filter(item -> includeInactive || item.isActive() && item.getCategory().isActive())
                .toList();
    }

    // Get product by ID
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + id
                        ));
    }

    // Create product
    @Transactional
    public Product createProduct(Product product) {

        Category category = getProductCategory(product);

        product.setProductId(null);
        product.setQuantity(0);
        product.setCategory(category);

        return productRepository.save(product);
    }

    // Update product
    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {

        Product existingProduct = getProductById(id);

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setActive(updatedProduct.isActive());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());

        Category category = getProductCategory(updatedProduct);

        existingProduct.setCategory(category);

        return productRepository.save(existingProduct);
    }

    // Delete product
    @Transactional
    public void deleteProduct(Long id) {

        Product existingProduct = getProductById(id);

        existingProduct.setActive(false);
        productRepository.save(existingProduct);
    }

    private Category getProductCategory(Product product) {

        if (product.getCategory() == null ||
                product.getCategory().getCategoryId() == null) {
            throw new IllegalArgumentException(
                    "A valid category id is required for the product"
            );
        }

        Long categoryId = product.getCategory().getCategoryId();

        return categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: " + categoryId
                        ));
    }
}
