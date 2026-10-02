package com.hardwarestore.hardwarestore.config;

import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;

@Component
@ConditionalOnProperty(name = "store.bootstrap-admin.enabled", havingValue = "true", matchIfMissing = true)
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);
    @Value("${store.bootstrap-admin.email:admin@mustafa.com}")
    private String adminEmail;
    @Value("${store.bootstrap-admin.password:admin}")
    private String adminPassword;
    @Value("${store.bootstrap-admin.minimum-password-length:4}")
    private int minimumPasswordLength;

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository,
                            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Preserve existing accounts and passwords on subsequent starts.
        User existingUser = userRepository.findByEmail(adminEmail).orElse(null);
        if (existingUser != null) {
            if (existingUser.getRole() != Role.ADMIN) {
                logger.warn("Admin initialization skipped: {} belongs to a non-admin account.", adminEmail);
            }
            return;
        }

        if (adminPassword.length() < minimumPasswordLength || adminPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Initial administrator password does not meet the configured length requirements.");
        }
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        logger.info("Created initial admin account: {}", adminEmail);
    }
}
