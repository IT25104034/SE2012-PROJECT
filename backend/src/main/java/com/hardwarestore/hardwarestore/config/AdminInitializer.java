package com.hardwarestore.hardwarestore.config;

import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);
    private static final String ADMIN_EMAIL = "admin@mustafa.com";
    private static final String ADMIN_PASSWORD = "admin";

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
        User existingUser = userRepository.findByEmail(ADMIN_EMAIL).orElse(null);
        if (existingUser != null) {
            if (existingUser.getRole() != Role.ADMIN) {
                logger.warn("Admin initialization skipped: {} belongs to a non-admin account.", ADMIN_EMAIL);
            }
            return;
        }

        User admin = new User();
        admin.setName("Admin");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        logger.info("Created initial admin account: {}", ADMIN_EMAIL);
    }
}
