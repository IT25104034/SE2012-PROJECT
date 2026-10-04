package com.hardwarestore.hardwarestore.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long inventoryId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            unique = true
    )
    private Product product;

    @Column(
            name = "quantity_on_hand",
            nullable = false
    )
    private int quantityOnHand = 0;

    @Column(
            name = "reorder_level",
            nullable = false
    )
    private int reorderLevel = 0;

    @Column(
            name = "last_updated",
            nullable = false
    )
    private LocalDateTime lastUpdated;

    public Inventory() {
    }

    public Inventory(
            Product product,
            int quantityOnHand,
            int reorderLevel
    ) {
        this.product = product;
        this.quantityOnHand = quantityOnHand;
        this.reorderLevel = reorderLevel;
    }

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getInventoryId() {
        return inventoryId;
    }

    public void setInventoryId(Long inventoryId) {
        this.inventoryId = inventoryId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(int quantityOnHand) {

        if (quantityOnHand < 0) {
            throw new IllegalArgumentException(
                    "Stock quantity cannot be negative"
            );
        }

        this.quantityOnHand = quantityOnHand;
    }

    public int getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(int reorderLevel) {

        if (reorderLevel < 0) {
            throw new IllegalArgumentException(
                    "Reorder level cannot be negative"
            );
        }

        this.reorderLevel = reorderLevel;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}