package com.hardwarestore.hardwarestore.repository;

import com.hardwarestore.hardwarestore.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}