package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.exception.ResourceConflictException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import com.hardwarestore.hardwarestore.model.Category;
import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.repository.CategoryRepository;
import com.hardwarestore.hardwarestore.repository.ProductRepository;
import org.springframework.stereotype.Service;

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
    public List<Product> getAllProducts() {
        return productRepository.findAll();
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
    public Product createProduct(Product product) {

        Category category = getProductCategory(product);

        product.setCategory(category);

        return productRepository.save(product);
    }

    // Update product
    public Product updateProduct(Long id, Product updatedProduct) {

        Product existingProduct = getProductById(id);

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        existingProduct.setQuantity(updatedProduct.getQuantity());

        Category category = getProductCategory(updatedProduct);

        existingProduct.setCategory(category);

        return productRepository.save(existingProduct);
    }

    // Delete product
    @Transactional
    public void deleteProduct(Long id) {

        Product existingProduct = getProductById(id);

        try {
            productRepository.delete(existingProduct);
            // Force database constraints to be checked before leaving this method.
            productRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ResourceConflictException(
                    "Cannot delete this product because it is used in a cart or order. Remove it from carts first; products in order history must be kept.", exception);
        }
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
