package com.hardwarestore.hardwarestore.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(name = "product_name", nullable = false, length = 150)
    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name must not exceed 150 characters")
    private String name;

    @Column(columnDefinition = "TEXT")
    @Size(max = 1000, message = "Product description must not exceed 1000 characters")
    private String description;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Product price is required")
    @Positive(message = "Product price must be greater than zero")
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    @JsonIgnore
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private Inventory inventory = new Inventory(this);

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    private void created() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    private void updated() { updatedAt = LocalDateTime.now(); }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    @JsonIgnore
    public boolean isPurchasable() { return active && category != null && category.isActive() && inventory != null; }
    @JsonIgnore
    public Inventory getInventory() { return inventory; }

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Product category is required")
    private Category category;

    public Product() {
    }

    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    public Product(
            String name,
            String description,
            BigDecimal price,
            String imageUrl,
            Integer quantity,
            Category category
    ) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        setQuantity(quantity);
        this.category = category;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // Compatibility for existing cart/order consumers: stock is persisted only in Inventory.
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public Integer getQuantity() {
        return inventory == null ? 0 : inventory.getQuantityOnHand();
    }

    public void setQuantity(Integer quantity) {
        if (inventory == null) inventory = new Inventory(this);
        inventory.setQuantityOnHand(quantity);
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
