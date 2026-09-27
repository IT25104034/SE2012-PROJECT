package com.hardwarestore.hardwarestore.repository;

import com.hardwarestore.hardwarestore.model.Cart;
import com.hardwarestore.hardwarestore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByCustomer(User customer);
}