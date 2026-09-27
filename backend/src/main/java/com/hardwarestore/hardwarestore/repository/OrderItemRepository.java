package com.hardwarestore.hardwarestore.repository;

import com.hardwarestore.hardwarestore.model.Order;
import com.hardwarestore.hardwarestore.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);
}