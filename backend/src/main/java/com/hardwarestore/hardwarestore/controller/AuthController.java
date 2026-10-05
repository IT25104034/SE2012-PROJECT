package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.dto.LoginRequest;
import com.hardwarestore.hardwarestore.dto.RegisterRequest;
import com.hardwarestore.hardwarestore.dto.UserResponse;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:5175"},
        allowCredentials = "true"
)
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request,
            HttpSession session
    ) {
        try {

            User user = new User();

            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());

            User savedUser = userService.registerUser(user);

            storeUserSession(session, savedUser);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(toUserResponse(savedUser));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            exception.getMessage()
                    )
            );

        } catch (IllegalStateException exception) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpSession session
    ) {
        try {

            User user = userService.loginUser(
                    request.getEmail(),
                    request.getPassword()
            );

            storeUserSession(session, user);

            return ResponseEntity.ok(
                    toUserResponse(user)
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            exception.getMessage()
                    )
            );
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(
            HttpSession session
    ) {

        Long userId =
                (Long) session.getAttribute("userId");

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Please login first"
                            )
                    );
        }

        User user = userService.getUserById(userId);

        if (!user.isActive()) {

            session.invalidate();

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "This account is inactive"
                            )
                    );
        }

        return ResponseEntity.ok(
                toUserResponse(user)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpSession session
    ) {

        session.invalidate();

        return ResponseEntity
                .noContent()
                .build();
    }

    private void storeUserSession(
            HttpSession session,
            User user
    ) {

        session.setAttribute(
                "userId",
                user.getId()
        );

        session.setAttribute(
                "name",
                user.getName()
        );

        session.setAttribute(
                "email",
                user.getEmail()
        );

        session.setAttribute(
                "role",
                user.getRole().getRoleName()
        );
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