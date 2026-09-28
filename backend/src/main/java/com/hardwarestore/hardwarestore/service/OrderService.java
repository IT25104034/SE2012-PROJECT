package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.model.Cart;
import com.hardwarestore.hardwarestore.model.CartItem;
import com.hardwarestore.hardwarestore.model.Order;
import com.hardwarestore.hardwarestore.model.OrderItem;
import com.hardwarestore.hardwarestore.model.OrderStatus;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.CartItemRepository;
import com.hardwarestore.hardwarestore.repository.CartRepository;
import com.hardwarestore.hardwarestore.repository.OrderItemRepository;
import com.hardwarestore.hardwarestore.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderService(CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public Order checkout(User customer) {

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot checkout an empty cart");
        }

        for (CartItem cartItem : cartItems) {

            if (cartItem.getQuantity() == null
                    || cartItem.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Cart item quantity must be greater than zero"
                );
            }

            if (cartItem.getUnitPrice() == null
                    || cartItem.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException(
                        "Cart item price cannot be negative"
                );
            }
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            BigDecimal itemTotal = cartItem.getUnitPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            totalAmount = totalAmount.add(itemTotal);
        }

        Order order = new Order(
                customer,
                LocalDateTime.now(),
                totalAmount,
                OrderStatus.PENDING
        );

        order = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {

            OrderItem orderItem = new OrderItem(
                    order,
                    cartItem.getProduct(),
                    cartItem.getQuantity(),
                    cartItem.getUnitPrice()
            );

            orderItemRepository.save(orderItem);
        }

        cartItemRepository.deleteAll(cartItems);

        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);

        return order;
    }

    public List<Order> getCustomerOrders(User customer) {
        return orderRepository.findByCustomer(customer);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public List<OrderItem> getOrderItems(Order order) {
        return orderItemRepository.findByOrder(order);
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);

        return orderRepository.save(order);
    }
}