package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.model.CartItem;
import com.hardwarestore.hardwarestore.model.Order;
import com.hardwarestore.hardwarestore.model.OrderStatus;
import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.service.CartService;
import com.hardwarestore.hardwarestore.service.OrderService;
import com.hardwarestore.hardwarestore.repository.ProductRepository;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CartController {

    private final CartService cartService;
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartController(CartService cartService,
                          OrderService orderService,
                          UserRepository userRepository,
                          ProductRepository productRepository) {
        this.cartService = cartService;
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/cart/{userId}")
    public List<CartItem> getCart(@PathVariable Long userId) {

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return cartService.getCartItems(customer);
    }

    @PostMapping("/cart/{userId}/items/{productId}")
    public CartItem addItem(@PathVariable Long userId,
                            @PathVariable Long productId,
                            @RequestParam Integer quantity) {

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return cartService.addItem(customer, product, quantity);
    }

    @PutMapping("/cart/{userId}/items/{productId}")
    public CartItem updateQuantity(@PathVariable Long userId,
                                   @PathVariable Long productId,
                                   @RequestParam Integer quantity) {

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return cartService.updateQuantity(customer, product, quantity);
    }

    @DeleteMapping("/cart/{userId}/items/{productId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long userId,
                                           @PathVariable Long productId) {

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        cartService.removeItem(customer, product);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cart/{userId}/checkout")
    public Order checkout(@PathVariable Long userId) {

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderService.checkout(customer);
    }

    @GetMapping("/orders/{userId}")
    public List<Order> getCustomerOrders(@PathVariable Long userId) {

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderService.getCustomerOrders(customer);
    }

    @PutMapping("/orders/{orderId}/status")
    public Order updateOrderStatus(@PathVariable Long orderId,
                                   @RequestParam OrderStatus status) {

        return orderService.updateOrderStatus(orderId, status);
    }
}