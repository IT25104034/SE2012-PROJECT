package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.dto.OrderItemResponse;
import com.hardwarestore.hardwarestore.dto.OrderResponse;
import com.hardwarestore.hardwarestore.model.Order;
import com.hardwarestore.hardwarestore.model.OrderItem;
import com.hardwarestore.hardwarestore.model.OrderStatus;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.OrderRepository;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import com.hardwarestore.hardwarestore.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public OrderController(OrderService orderService,
                           UserRepository userRepository,
                           OrderRepository orderRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/customer/{userId}")
    public List<OrderResponse> getCustomerOrders(@PathVariable Long userId) {

        User customer = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return orderService.getCustomerOrders(customer)
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @GetMapping("/status/{status}")
    public List<OrderResponse> getOrdersByStatus(@PathVariable OrderStatus status) {

        return orderService.getOrdersByStatus(status)
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @GetMapping("/{orderId}/items")
    public List<OrderItemResponse> getOrderItems(@PathVariable Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        return orderService.getOrderItems(order)
                .stream()
                .map(this::toOrderItemResponse)
                .toList();
    }

    private OrderResponse toOrderResponse(Order order) {

        return new OrderResponse(
                order.getOrderId(),
                order.getCustomer().getId(),
                order.getOrderDate(),
                order.getTotalAmount(),
                order.getStatus()
        );
    }

    private OrderItemResponse toOrderItemResponse(OrderItem orderItem) {

        return new OrderItemResponse(
                orderItem.getOrderItemId(),
                orderItem.getProduct().getProductId(),
                orderItem.getProduct().getName(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice()
        );
    }
}