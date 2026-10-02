package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.controller.UserManagementController;
import com.hardwarestore.hardwarestore.exception.GlobalExceptionHandler;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;

class UserManagementTests {
    UserRepository repository;
    MockMvc mvc;
    User admin;
    MockHttpSession session;
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    @BeforeEach void setup() {
        repository = mock(UserRepository.class);
        admin = new User(); admin.setId(1L); admin.setRole(Role.ADMIN); admin.setEmail("admin@example.com"); admin.setPassword("secret hash");
        when(repository.findById(1L)).thenReturn(Optional.of(admin));
        when(repository.findAll()).thenReturn(List.of(admin));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        mvc = MockMvcBuilders.standaloneSetup(new UserManagementController(new UserService(repository, encoder)))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        session = new MockHttpSession();session.setAttribute("userId",1L);
    }
    @Test void listDoesNotExposePasswords() throws Exception {
        mvc.perform(get("/api/admin/users").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }
    @Test void guestAndCustomerCannotManageUsers() throws Exception {
        mvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
        admin.setRole(Role.CUSTOMER);
        mvc.perform(get("/api/admin/users").session(session)).andExpect(status().isForbidden());
        verify(repository,never()).findAll();
    }
    @Test void staffAccountUsesHashedPasswordAndNormalizedEmail() throws Exception {
        mvc.perform(post("/api/admin/users").session(session).contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Staff\",\"email\":\"Staff@Example.com\",\"password\":\"Testpass123\",\"role\":\"STAFF\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.password").doesNotExist());
        var captor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(repository).save(captor.capture());
        assertEquals("staff@example.com",captor.getValue().getEmail());
        assertTrue(encoder.matches("Testpass123",captor.getValue().getPassword()));
    }
    @Test void duplicateEmailIsRejected() throws Exception {
        when(repository.findByEmail("staff@example.com")).thenReturn(Optional.of(admin));
        mvc.perform(post("/api/admin/users").session(session).contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Staff\",\"email\":\"staff@example.com\",\"password\":\"Testpass123\",\"role\":\"STAFF\"}"))
                .andExpect(status().isBadRequest());
        verify(repository,never()).save(any());
    }
}
