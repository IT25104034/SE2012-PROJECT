package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.model.Category;
import com.hardwarestore.hardwarestore.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }




    // GET all categories
    @GetMapping
    public List<Category> getAllCategories(
            @RequestParam(defaultValue = "false") boolean includeInactive, HttpSession session) {
        if (includeInactive) CatalogueAccess.requireAdmin(session);
        return categoryService.getAllCategories(includeInactive);
    }

    // GET category by ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        if (!category.isActive()) {
            throw new com.hardwarestore.hardwarestore.exception.ResourceNotFoundException("Category not found with id: " + id);
        }
        return ResponseEntity.ok(category);
    }

    // CREATE category
    @PostMapping
    public ResponseEntity<Category> createCategory(
            @Valid @RequestBody Category category, HttpSession session
    ) {
        CatalogueAccess.requireAdmin(session);
        Category createdCategory =
                categoryService.createCategory(category);

        return ResponseEntity.ok(createdCategory);
    }

    // UPDATE category
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody Category category, HttpSession session
    ) {
        CatalogueAccess.requireAdmin(session);
        Category updatedCategory =
                categoryService.updateCategory(id, category);

        return ResponseEntity.ok(updatedCategory);
    }

    // DELETE category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, HttpSession session) {
        CatalogueAccess.requireAdmin(session);
        categoryService.deleteCategory(id);

        return ResponseEntity.noContent().build();
    }
}
