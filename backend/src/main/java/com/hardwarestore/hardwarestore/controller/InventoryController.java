package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.service.InventoryService;
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
        try {
            Product product =
                    inventoryService.getProductById(productId);

            return ResponseEntity.ok(product);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @PutMapping("/{productId}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> request
    ) {
        try {
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