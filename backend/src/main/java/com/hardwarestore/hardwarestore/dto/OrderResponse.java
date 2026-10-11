package com.hardwarestore.hardwarestore.dto;

import com.hardwarestore.hardwarestore.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderResponse {

    private Long orderId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private OrderStatus status;

    public OrderResponse() {
    }

    public OrderResponse(
            Long orderId,
            Long customerId,
            LocalDateTime orderDate,
            BigDecimal totalAmount,
            OrderStatus status
    ) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public OrderResponse(
            Long orderId,
            Long customerId,
            String customerName,
            String customerEmail,
            LocalDateTime orderDate,
            BigDecimal totalAmount,
            OrderStatus status
    ) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}