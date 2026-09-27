package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.model.Cart;
import com.hardwarestore.hardwarestore.model.CartItem;
import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.CartItemRepository;
import com.hardwarestore.hardwarestore.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    public Cart getOrCreateCart(User customer) {
        return cartRepository.findByCustomer(customer)
                .orElseGet(() -> cartRepository.save(new Cart(customer)));
    }

    public List<CartItem> getCartItems(User customer) {
        Cart cart = getOrCreateCart(customer);
        return cartItemRepository.findByCart(cart);
    }

    public CartItem addItem(User customer, Product product, Integer quantity) {
        Cart cart = getOrCreateCart(customer);

        CartItem existingItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            return cartItemRepository.save(existingItem);
        }

        CartItem newItem = new CartItem(cart, product, quantity);
        return cartItemRepository.save(newItem);
    }

    public CartItem updateQuantity(User customer, Product product, Integer quantity) {
        Cart cart = getOrCreateCart(customer);

        CartItem item = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Product not found in cart"));

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void removeItem(User customer, Product product) {
        Cart cart = getOrCreateCart(customer);

        CartItem item = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Product not found in cart"));

        cartItemRepository.delete(item);
    }
}