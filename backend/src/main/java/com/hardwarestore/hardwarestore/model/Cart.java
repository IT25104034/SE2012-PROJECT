package com.hardwarestore.hardwarestore.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User customer;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    public Cart() {
    }

    public Cart(User customer) {
        this.customer = customer;
        this.totalAmount = BigDecimal.ZERO;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}