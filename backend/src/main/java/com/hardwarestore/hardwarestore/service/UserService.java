package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public boolean emailExists(String email) {
        return userRepository
                .findByEmail(email)
                .isPresent();
    }


    public User registerUser(User user) {

        if (emailExists(user.getEmail())) {
            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        // Every new account starts as CUSTOMER
        user.setRole(Role.CUSTOMER);

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

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

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


    // ADMIN: get all registered users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    // ADMIN: update a user's role
    public User updateUserRole(
            Long userId,
            Role role
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: "
                                        + userId
                        )
                );

        user.setRole(role);

        return userRepository.save(user);
    }
}