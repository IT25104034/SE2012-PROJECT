package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.model.Category;
import com.hardwarestore.hardwarestore.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Get all categories
    public List<Category> getAllCategories() { return getAllCategories(false); }

    public List<Category> getAllCategories(boolean includeInactive) {
        return categoryRepository.findAll().stream()
                .filter(item -> includeInactive || item.isActive())
                .toList();
    }

    // Get category by ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: " + id
                        ));
    }

    // Create category
    @Transactional
    public Category createCategory(Category category) {
        category.setCategoryId(null);
        return categoryRepository.save(category);
    }

    // Update category
    @Transactional
    public Category updateCategory(Long id, Category updatedCategory) {

        Category existingCategory = getCategoryById(id);

        existingCategory.setName(updatedCategory.getName());
        existingCategory.setDescription(updatedCategory.getDescription());
        existingCategory.setActive(updatedCategory.isActive());

        return categoryRepository.save(existingCategory);
    }

    // Delete category
    @Transactional
    public void deleteCategory(Long id) {

        Category existingCategory = getCategoryById(id);

        existingCategory.setActive(false);
        categoryRepository.save(existingCategory);
    }
}
