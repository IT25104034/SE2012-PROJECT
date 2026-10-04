package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.RoleName;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.RoleRepository;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean emailExists(String email) {

        return userRepository
                .findByEmail(
                        email.trim().toLowerCase()
                )
                .isPresent();
    }

    public User registerUser(User user) {

        String normalizedEmail =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        if (emailExists(normalizedEmail)) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        Role customerRole =
                roleRepository
                        .findByRoleName(
                                RoleName.CUSTOMER
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "CUSTOMER role has not been configured"
                                )
                        );

        user.setEmail(normalizedEmail);
        user.setRole(customerRole);
        user.setActive(true);

        String hashedPassword =
                passwordEncoder.encode(
                        user.getPassword()
                );

        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    public User loginUser(
            String email,
            String password
    ) {

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid email or password"
                                )
                        );

        if (!user.isActive()) {

            throw new IllegalArgumentException(
                    "This account is inactive"
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        return user;
    }

    public User getUserById(Long userId) {

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + userId
                        )
                );
    }

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    public User updateUserRole(
            Long userId,
            RoleName roleName
    ) {

        User user =
                getUserById(userId);

        Role role =
                roleRepository
                        .findByRoleName(roleName)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        roleName
                                                + " role has not been configured"
                                )
                        );

        user.setRole(role);

        return userRepository.save(user);
    }

    public User updateUserActiveStatus(
            Long userId,
            boolean active
    ) {

        User user =
                getUserById(userId);

        user.setActive(active);

        return userRepository.save(user);
    }
}