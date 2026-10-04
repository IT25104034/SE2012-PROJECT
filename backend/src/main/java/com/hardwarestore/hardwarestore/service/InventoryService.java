package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.model.Inventory;
import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.repository.InventoryRepository;
import com.hardwarestore.hardwarestore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public InventoryService(
            InventoryRepository inventoryRepository,
            ProductRepository productRepository
    ) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryByProductId(Long productId) {

        return inventoryRepository
                .findByProductProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory not found for product id: " + productId
                        )
                );
    }

    @Transactional
    public Inventory updateStock(
            Long productId,
            Integer quantity
    ) {

        if (quantity == null) {
            throw new IllegalArgumentException(
                    "Quantity is required"
            );
        }

        if (quantity < 0) {
            throw new IllegalArgumentException(
                    "Quantity cannot be negative"
            );
        }

        Inventory inventory =
                getInventoryByProductId(productId);

        inventory.setQuantityOnHand(quantity);

        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory createInventoryForProduct(
            Long productId,
            Integer quantityOnHand,
            Integer reorderLevel
    ) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        if (inventoryRepository
                .existsByProductProductId(productId)) {

            throw new IllegalArgumentException(
                    "Inventory already exists for product id: " + productId
            );
        }

        if (quantityOnHand == null || quantityOnHand < 0) {
            throw new IllegalArgumentException(
                    "Quantity on hand cannot be negative"
            );
        }

        if (reorderLevel == null || reorderLevel < 0) {
            throw new IllegalArgumentException(
                    "Reorder level cannot be negative"
            );
        }

        Inventory inventory = new Inventory();

        inventory.setProduct(product);
        inventory.setQuantityOnHand(quantityOnHand);
        inventory.setReorderLevel(reorderLevel);

        return inventoryRepository.save(inventory);
    }
}