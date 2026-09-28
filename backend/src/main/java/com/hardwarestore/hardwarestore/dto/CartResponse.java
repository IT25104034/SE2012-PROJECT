package com.hardwarestore.hardwarestore.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {

    private Long cartId;
    private Long customerId;
    private BigDecimal totalAmount;
    private List<CartItemResponse> items;

    public CartResponse() {
    }

    public CartResponse(Long cartId,
                        Long customerId,
                        BigDecimal totalAmount,
                        List<CartItemResponse> items) {
        this.cartId = cartId;
        this.customerId = customerId;
        this.totalAmount = totalAmount;
        this.items = items;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }
}