package com.hardwarestore.hardwarestore.repository;

import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByRoleName(RoleName roleName);
}