package com.hardwarestore.hardwarestore.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    public UserService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
    public User registerUser(User user) {

        if (emailExists(user.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        user.setRole(Role.CUSTOMER);

        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

}