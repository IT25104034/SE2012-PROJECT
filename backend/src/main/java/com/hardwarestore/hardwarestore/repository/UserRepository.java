package com.hardwarestore.hardwarestore.repository;

import com.hardwarestore.hardwarestore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u order by u.id")
    List<User> findAllForRoleUpdate();

    Optional<User> findByEmail(String email);
}