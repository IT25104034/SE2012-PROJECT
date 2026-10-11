package com.hardwarestore.hardwarestore.config;

import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.RoleName;
import com.hardwarestore.hardwarestore.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public RoleInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {

        createRoleIfMissing(
                RoleName.CUSTOMER,
                "Own shopping and orders"
        );

        createRoleIfMissing(
                RoleName.STAFF,
                "Order operations and stock"
        );

        createRoleIfMissing(
                RoleName.ADMIN,
                "Catalogue, accounts and operations"
        );
    }

    private void createRoleIfMissing(
            RoleName roleName,
            String description
    ) {

        if (roleRepository
                .findByRoleName(roleName)
                .isEmpty()) {

            Role role = new Role(
                    roleName,
                    description
            );

            roleRepository.save(role);
        }
    }
}