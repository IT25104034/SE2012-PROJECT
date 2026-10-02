package com.hardwarestore.hardwarestore.service;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.util.UUID;

@Service
public class GoogleAccountService {
    private final UserRepository users;
    private final BCryptPasswordEncoder encoder;
    public GoogleAccountService(UserRepository users, BCryptPasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }
    // Only called after Spring Security validates Google's OIDC response; no public claims API.
    @Transactional
    public User signIn(String subject, String email, boolean verified, String name) {
        if (subject == null || subject.isBlank() || email == null || email.isBlank() || !verified)
            throw new IllegalArgumentException("unverified");
        var existing = users.findByGoogleSubject(subject);
        if (existing.isPresent()) return existing.get();
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (users.findByEmail(normalized).isPresent()) throw new IllegalArgumentException("existing-account");
        User user = new User();
        user.setName(name == null || name.isBlank() ? normalized : name.trim());
        user.setEmail(normalized);
        user.setGoogleSubject(subject);
        user.setRole(Role.CUSTOMER);
        // Preserve non-null schema; password login is rejected for Google-only accounts.
        user.setPassword(encoder.encode(UUID.randomUUID().toString()));
        return users.saveAndFlush(user);
    }
}
