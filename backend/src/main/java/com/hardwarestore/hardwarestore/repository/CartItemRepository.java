package com.hardwarestore.hardwarestore.repository;

import com.hardwarestore.hardwarestore.model.Cart;
import com.hardwarestore.hardwarestore.model.CartItem;
import com.hardwarestore.hardwarestore.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}