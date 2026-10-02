package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.service.InventoryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(
                inventoryService.getAllProducts()
        );
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(
            @PathVariable Long productId
    ) {
        Product product =
                inventoryService.getProductById(productId);

        return ResponseEntity.ok(product);
    }

    @PutMapping("/{productId}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> request,
            HttpSession session
    ) {
        try {

            Role role = (Role) session.getAttribute("role");

            // User is not logged in
            if (role == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        Map.of("message", "Please login first")
                );
            }

            // Logged-in user is not an admin
            if (role != Role.ADMIN && role != Role.STAFF) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        Map.of("message", "Staff or admin access required")
                );
            }

            Integer quantity = request.get("quantity");

            if (quantity == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Quantity is required")
                );
            }

            Product updatedProduct =
                    inventoryService.updateStock(productId, quantity);

            return ResponseEntity.ok(updatedProduct);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}