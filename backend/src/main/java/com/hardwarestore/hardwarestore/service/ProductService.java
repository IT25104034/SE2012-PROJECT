package com.hardwarestore.hardwarestore.service;

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
                        new RuntimeException("Product not found with id: " + id));
    }

    // Create product
    public Product createProduct(Product product) {

        Long categoryId = product.getCategory().getCategoryId();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + categoryId
                        ));

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

        Long categoryId =
                updatedProduct.getCategory().getCategoryId();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + categoryId
                        ));

        existingProduct.setCategory(category);

        return productRepository.save(existingProduct);
    }

    // Delete product
    public void deleteProduct(Long id) {

        Product existingProduct = getProductById(id);

        productRepository.delete(existingProduct);
    }
}