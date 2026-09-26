package com.hardwarestore.hardwarestore.repository;

import com.hardwarestore.hardwarestore.model.Order;
import com.hardwarestore.hardwarestore.model.OrderStatus;
import com.hardwarestore.hardwarestore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomer(User customer);

    List<Order> findByStatus(OrderStatus status);
}