package com.hardwarestore.hardwarestore.service;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GoogleAccountTests {
    UserRepository users;
    GoogleAccountService accounts;
    @BeforeEach void setup() {
        users = mock(UserRepository.class);
        accounts = new GoogleAccountService(users, new BCryptPasswordEncoder());
        when(users.saveAndFlush(any())).thenAnswer(call -> call.getArgument(0));
    }
    @Test void newGoogleAccountIsCustomerWithNormalizedEmailAndOpaquePassword() {
        User u = accounts.signIn("google-123", " Student@Example.com ", true, " Student ");
        assertEquals(Role.CUSTOMER, u.getRole());
        assertEquals("student@example.com", u.getEmail());
        assertEquals("Student", u.getName());
        assertEquals("google-123", u.getGoogleSubject());
        assertTrue(u.getPassword().startsWith("$2a$"));
    }
    @Test void returningIdentityUsesSubjectAndPreservesExistingRoleAndProfile() {
        User u = new User(); u.setRole(Role.STAFF); u.setEmail("original@example.com");
        when(users.findByGoogleSubject("same-subject")).thenReturn(Optional.of(u));
        assertSame(u, accounts.signIn("same-subject", "changed@example.com", true, "Changed"));
        assertEquals(Role.STAFF, u.getRole());
        verify(users, never()).saveAndFlush(any());
        verify(users, never()).findByEmail(any());
    }
    @Test void existingPasswordAccountIncludingAdminIsNeverLinkedByEmail() {
        User admin = new User(); admin.setRole(Role.ADMIN);
        when(users.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        assertEquals("existing-account", assertThrows(IllegalArgumentException.class,
                () -> accounts.signIn("new-subject", "ADMIN@example.com", true, "Admin")).getMessage());
        verify(users, never()).saveAndFlush(any());
    }
    @Test void unverifiedEmailCannotCreateAccount() {
        assertThrows(IllegalArgumentException.class, () -> accounts.signIn("sub", "a@b.com", false, "A"));
        verifyNoInteractions(users);
    }
    @Test void missingSubjectOrEmailIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> accounts.signIn("", "a@b.com", true, "A"));
        assertThrows(IllegalArgumentException.class, () -> accounts.signIn("sub", null, true, "A"));
        verifyNoInteractions(users);
    }
    @Test void googleOnlyAccountCannotUsePasswordLoginEvenWithMatchingHash() {
        User u = new User(); u.setGoogleSubject("sub"); u.setPassword(new BCryptPasswordEncoder().encode("examplepass"));
        when(users.findByEmail("a@b.com")).thenReturn(Optional.of(u));
        assertThrows(IllegalArgumentException.class, () -> new UserService(users, new BCryptPasswordEncoder()).loginUser("a@b.com", "examplepass"));
    }
}
