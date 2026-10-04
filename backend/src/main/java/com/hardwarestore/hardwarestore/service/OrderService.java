package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.model.Cart;
import com.hardwarestore.hardwarestore.model.CartItem;
import com.hardwarestore.hardwarestore.model.Inventory;
import com.hardwarestore.hardwarestore.model.Order;
import com.hardwarestore.hardwarestore.model.OrderItem;
import com.hardwarestore.hardwarestore.model.OrderStatus;
import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.CartItemRepository;
import com.hardwarestore.hardwarestore.repository.CartRepository;
import com.hardwarestore.hardwarestore.repository.InventoryRepository;
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
    private final InventoryRepository inventoryRepository;

    public OrderService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            InventoryRepository inventoryRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public Order checkout(User customer) {

        Cart cart = cartRepository
                .findByCustomer(customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Cart not found"
                        )
                );

        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {

            throw new IllegalArgumentException(
                    "Cannot checkout an empty cart"
            );
        }

        // Validate cart item quantities and prices
        for (CartItem cartItem : cartItems) {

            if (cartItem.getQuantity() == null
                    || cartItem.getQuantity() <= 0) {

                throw new IllegalArgumentException(
                        "Cart item quantity must be greater than zero"
                );
            }

            if (cartItem.getUnitPrice() == null
                    || cartItem.getUnitPrice()
                    .compareTo(BigDecimal.ZERO) < 0) {

                throw new IllegalArgumentException(
                        "Cart item price cannot be negative"
                );
            }
        }

        // Validate inventory stock before creating the order
        for (CartItem cartItem : cartItems) {

            Product product =
                    cartItem.getProduct();

            Inventory inventory =
                    inventoryRepository
                            .findByProductProductId(
                                    product.getProductId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Inventory not found for product id: "
                                                    + product.getProductId()
                                    )
                            );

            if (inventory.getQuantityOnHand()
                    < cartItem.getQuantity()) {

                throw new IllegalArgumentException(
                        "Not enough stock for product: "
                                + product.getName()
                                + ". Only "
                                + inventory.getQuantityOnHand()
                                + " units available."
                );
            }
        }

        // Calculate total order amount
        BigDecimal totalAmount =
                BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            BigDecimal itemTotal =
                    cartItem.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            cartItem.getQuantity()
                                    )
                            );

            totalAmount =
                    totalAmount.add(itemTotal);
        }

        // Create order
        Order order =
                new Order(
                        customer,
                        LocalDateTime.now(),
                        totalAmount,
                        OrderStatus.PENDING
                );

        order =
                orderRepository.save(order);

        // Create order items and reduce inventory stock
        for (CartItem cartItem : cartItems) {

            Product product =
                    cartItem.getProduct();

            Inventory inventory =
                    inventoryRepository
                            .findByProductProductId(
                                    product.getProductId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Inventory not found for product id: "
                                                    + product.getProductId()
                                    )
                            );

            OrderItem orderItem =
                    new OrderItem(
                            order,
                            product,
                            cartItem.getQuantity(),
                            cartItem.getUnitPrice()
                    );

            orderItemRepository.save(orderItem);

            int newQuantity =
                    inventory.getQuantityOnHand()
                            - cartItem.getQuantity();

            inventory.setQuantityOnHand(
                    newQuantity
            );

            inventoryRepository.save(
                    inventory
            );
        }

        // Clear cart after successful checkout
        cartItemRepository.deleteAll(
                cartItems
        );

        cart.setTotalAmount(
                BigDecimal.ZERO
        );

        cartRepository.save(cart);

        return order;
    }

    public List<Order> getCustomerOrders(
            User customer
    ) {

        return orderRepository
                .findByCustomer(customer);
    }

    public List<Order> getOrdersByStatus(
            OrderStatus status
    ) {

        return orderRepository
                .findByStatus(status);
    }

    public List<OrderItem> getOrderItems(
            Order order
    ) {

        return orderItemRepository
                .findByOrder(order);
    }

    public Order updateOrderStatus(
            Long orderId,
            OrderStatus status
    ) {

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with id: "
                                                + orderId
                                )
                        );

        order.setStatus(status);

        return orderRepository.save(order);
    }
}