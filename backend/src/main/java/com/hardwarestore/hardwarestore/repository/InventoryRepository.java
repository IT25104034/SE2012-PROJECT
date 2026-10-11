package com.hardwarestore.hardwarestore.repository;

import com.hardwarestore.hardwarestore.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductProductId(Long productId);

    boolean existsByProductProductId(Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM Inventory i
            WHERE i.product.productId = :productId
            """)
    Optional<Inventory> findByProductProductIdForUpdate(
            @Param("productId") Long productId
    );
}