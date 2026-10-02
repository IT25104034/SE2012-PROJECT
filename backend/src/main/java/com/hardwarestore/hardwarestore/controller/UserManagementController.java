package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.dto.CreateUserRequest;
import com.hardwarestore.hardwarestore.dto.UserResponse;
import com.hardwarestore.hardwarestore.dto.UpdateRoleRequest;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {
    private final UserService users;
    public UserManagementController(UserService users) { this.users = users; }
    private void requireAdmin(HttpSession session) {
        if (session.getAttribute("userId") == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please login first");
        User current = users.getUserById((Long) session.getAttribute("userId"));
        if (current.getRole() != Role.ADMIN) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
    }
    @GetMapping
    public List<UserResponse> list(HttpSession session) {
        requireAdmin(session);
        return users.getAllUsers().stream().map(this::response).toList();
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request, HttpSession session) {
        requireAdmin(session);
        return response(users.createManagedUser(request));
    }
    @PutMapping("/{userId}/role")
    public UserResponse updateRole(@PathVariable Long userId, @Valid @RequestBody UpdateRoleRequest request, HttpSession session) {
        requireAdmin(session);
        return response(users.updateRole(userId, request.role()));
    }
    private UserResponse response(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
