package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.model.Inventory;
import com.hardwarestore.hardwarestore.model.RoleName;
import com.hardwarestore.hardwarestore.service.InventoryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(
            InventoryService inventoryService
    ) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {

        return ResponseEntity.ok(
                inventoryService.getAllInventory()
        );
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getInventoryByProductId(
            @PathVariable Long productId
    ) {

        return ResponseEntity.ok(
                inventoryService.getInventoryByProductId(productId)
        );
    }

    @PutMapping("/{productId}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> request,
            HttpSession session
    ) {

        try {

            RoleName role =
                    (RoleName) session.getAttribute("role");

            if (role == null) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "message",
                                        "Please login first"
                                )
                        );
            }

            if (role != RoleName.STAFF
                    && role != RoleName.ADMIN) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                Map.of(
                                        "message",
                                        "Staff or Admin access required"
                                )
                        );
            }

            Integer quantity =
                    request.get("quantity");

            if (quantity == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Quantity is required"
                                )
                        );
            }

            Inventory updatedInventory =
                    inventoryService.updateStock(
                            productId,
                            quantity
                    );

            return ResponseEntity.ok(
                    updatedInventory
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }
}