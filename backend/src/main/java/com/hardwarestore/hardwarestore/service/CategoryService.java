package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.model.Category;
import com.hardwarestore.hardwarestore.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Get all categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Get category by ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found with id: " + id));
    }

    // Create category
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Update category
    public Category updateCategory(Long id, Category updatedCategory) {

        Category existingCategory = getCategoryById(id);

        existingCategory.setName(updatedCategory.getName());
        existingCategory.setDescription(updatedCategory.getDescription());

        return categoryRepository.save(existingCategory);
    }

    // Delete category
    public void deleteCategory(Long id) {

        Category existingCategory = getCategoryById(id);

        categoryRepository.delete(existingCategory);
    }
}