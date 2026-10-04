package com.hardwarestore.hardwarestore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    @JsonIgnore
    @OneToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @PositiveOrZero
    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @PositiveOrZero
    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 0;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    public Inventory() {}
    public Inventory(Product product) { this.product = product; }
    @PrePersist @PreUpdate
    private void touch() { lastUpdated = LocalDateTime.now(); }
    public Long getInventoryId() { return inventoryId; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Integer getQuantityOnHand() { return quantityOnHand; }
    public void setQuantityOnHand(Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new IllegalArgumentException("Stock quantity must be a non-negative integer");
        }
        quantityOnHand = quantity;
    }
    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer level) {
        if (level == null || level < 0) {
            throw new IllegalArgumentException("Reorder level must be a non-negative integer");
        }
        reorderLevel = level;
    }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
}
