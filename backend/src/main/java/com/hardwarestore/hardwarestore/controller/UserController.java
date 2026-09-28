package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.dto.UserResponse;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // ADMIN ONLY - VIEW ALL USERS
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            HttpSession session
    ) {

        ResponseEntity<?> accessDenied =
                checkAdminAccess(session);

        if (accessDenied != null) {
            return accessDenied;
        }

        List<UserResponse> users =
                userService
                        .getAllUsers()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(users);
    }


    // ADMIN ONLY - CHANGE USER ROLE
    @PutMapping("/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            HttpSession session
    ) {

        // STEP 1 - CHECK ADMIN ACCESS
        ResponseEntity<?> accessDenied =
                checkAdminAccess(session);

        if (accessDenied != null) {
            return accessDenied;
        }


        // STEP 2 - PREVENT ADMIN FROM CHANGING OWN ROLE
        Long currentUserId =
                (Long) session.getAttribute("userId");

        if (
                currentUserId != null &&
                        currentUserId.equals(userId)
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "You cannot change your own role"
                            )
                    );
        }


        // STEP 3 - GET ROLE FROM REQUEST BODY
        String roleValue =
                request.get("role");

        if (
                roleValue == null ||
                        roleValue.isBlank()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Role is required"
                            )
                    );
        }


        // STEP 4 - CONVERT STRING TO ROLE ENUM
        try {

            Role role =
                    Role.valueOf(
                            roleValue
                                    .trim()
                                    .toUpperCase()
                    );


            // STEP 5 - UPDATE USER ROLE
            User updatedUser =
                    userService.updateUserRole(
                            userId,
                            role
                    );


            // STEP 6 - RETURN SAFE USER RESPONSE
            return ResponseEntity.ok(
                    toResponse(updatedUser)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Role must be CUSTOMER or ADMIN"
                            )
                    );
        }
    }


    // CHECK WHETHER CURRENT SESSION BELONGS TO ADMIN
    private ResponseEntity<?> checkAdminAccess(
            HttpSession session
    ) {

        Role role =
                (Role) session.getAttribute("role");


        // USER NOT LOGGED IN
        if (role == null) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Please login first"
                            )
                    );
        }


        // USER LOGGED IN BUT NOT ADMIN
        if (role != Role.ADMIN) {

            return ResponseEntity
                    .status(
                            HttpStatus.FORBIDDEN
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Admin access required"
                            )
                    );
        }


        // ADMIN ACCESS ALLOWED
        return null;
    }


    // CONVERT USER ENTITY TO SAFE RESPONSE DTO
    private UserResponse toResponse(
            User user
    ) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}