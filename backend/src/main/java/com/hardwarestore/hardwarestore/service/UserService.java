package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.exception.ResourceNotFoundException;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.hardwarestore.hardwarestore.dto.CreateUserRequest;
import java.util.List;
import java.util.Locale;
import org.springframework.transaction.annotation.Transactional;
import com.hardwarestore.hardwarestore.exception.ResourceConflictException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User updateRole(Long userId, Role role) {
        List<User> users = userRepository.findAllForRoleUpdate();
        User user = users.stream().filter(item -> item.getId().equals(userId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (user.getRole() == Role.ADMIN && role != Role.ADMIN
                && users.stream().filter(item -> item.getRole() == Role.ADMIN).count() <= 1) {
            throw new ResourceConflictException("The last administrator cannot be demoted. Create another admin first.", null);
        }
        user.setRole(role);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() { return userRepository.findAll(); }

    public User createManagedUser(CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (emailExists(email)) throw new IllegalArgumentException("Email already registered");
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        return userRepository.save(user);
    }

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public User registerUser(User user) {

        user.setEmail(user.getEmail().trim().toLowerCase(Locale.ROOT));
        if (emailExists(user.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        user.setRole(Role.CUSTOMER);

        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password")
                );

        if (user.getGoogleSubject() != null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );
    }
}
