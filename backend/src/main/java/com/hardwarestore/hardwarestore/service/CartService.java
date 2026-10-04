package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.model.Cart;
import com.hardwarestore.hardwarestore.model.CartItem;
import com.hardwarestore.hardwarestore.model.Product;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.repository.CartItemRepository;
import com.hardwarestore.hardwarestore.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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

    public CartItem addItem(User customer,
                            Product product,
                            Integer quantity) {

        validateQuantity(quantity);

        Cart cart = getOrCreateCart(customer);

        CartItem existingItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + quantity;
            validateQuantity(newQuantity);
            validateStock(product, newQuantity);

            existingItem.setQuantity(newQuantity);

            CartItem savedItem = cartItemRepository.save(existingItem);
            updateCartTotal(cart);

            return savedItem;
        }

        validateStock(product, quantity);

        CartItem newItem = new CartItem(
                cart,
                product,
                quantity,
                product.getPrice()
        );

        CartItem savedItem = cartItemRepository.save(newItem);
        updateCartTotal(cart);

        return savedItem;
    }

    public CartItem updateQuantity(User customer,
                                   Product product,
                                   Integer quantity) {

        validateQuantity(quantity);
        validateStock(product, quantity);

        Cart cart = getOrCreateCart(customer);

        CartItem item = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found in cart"));

        item.setQuantity(quantity);

        CartItem savedItem = cartItemRepository.save(item);
        updateCartTotal(cart);

        return savedItem;
    }

    public void removeItem(User customer, Product product) {

        Cart cart = getOrCreateCart(customer);

        CartItem item = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found in cart"));

        cartItemRepository.delete(item);

        updateCartTotal(cart);
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }
    }

    private void validateStock(Product product, Integer requestedQuantity) {
        if (!product.isPurchasable()) {
            throw new IllegalArgumentException("Product is no longer available: " + product.getName());
        }
        if (product.getQuantity() == null || product.getQuantity() < requestedQuantity) {
            throw new IllegalArgumentException(
                    "Only " + (product.getQuantity() == null ? 0 : product.getQuantity())
                            + " units available for " + product.getName()
            );
        }
    }

    private void updateCartTotal(Cart cart) {

        List<CartItem> items = cartItemRepository.findByCart(cart);

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : items) {

            BigDecimal itemTotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            total = total.add(itemTotal);
        }

        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }
}
