package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.dto.UserResponse;
import com.hardwarestore.hardwarestore.model.RoleName;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:5175"},
        allowCredentials = "true"
)
public class UserController {

    private final UserService userService;

    public UserController(
            UserService userService
    ) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers(
            HttpSession session
    ) {

        requireAdmin(session);

        return userService
                .getAllUsers()
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestParam RoleName role,
            HttpSession session
    ) {

        requireAdmin(session);

        Long loggedInUserId =
                (Long) session.getAttribute("userId");

        if (loggedInUserId != null
                && loggedInUserId.equals(userId)) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "You cannot change your own role"
                            )
                    );
        }

        User updatedUser =
                userService.updateUserRole(
                        userId,
                        role
                );

        return ResponseEntity.ok(
                toUserResponse(updatedUser)
        );
    }

    @PutMapping("/{userId}/active")
    public ResponseEntity<?> updateUserActiveStatus(
            @PathVariable Long userId,
            @RequestParam boolean active,
            HttpSession session
    ) {

        requireAdmin(session);

        Long loggedInUserId =
                (Long) session.getAttribute("userId");

        if (loggedInUserId != null
                && loggedInUserId.equals(userId)
                && !active) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "You cannot deactivate your own account"
                            )
                    );
        }

        User updatedUser =
                userService.updateUserActiveStatus(
                        userId,
                        active
                );

        return ResponseEntity.ok(
                Map.of(
                        "id", updatedUser.getId(),
                        "name", updatedUser.getName(),
                        "email", updatedUser.getEmail(),
                        "role", updatedUser.getRole().getRoleName(),
                        "active", updatedUser.isActive()
                )
        );
    }

    private void requireAdmin(
            HttpSession session
    ) {

        RoleName role =
                (RoleName) session.getAttribute("role");

        if (role == null) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please login first"
            );
        }

        if (role != RoleName.ADMIN) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin access required"
            );
        }
    }

    private UserResponse toUserResponse(
            User user
    ) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getRoleName(),
                user.isActive()
        );
    }
}