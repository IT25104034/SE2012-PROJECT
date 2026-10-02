package com.hardwarestore.hardwarestore.dto;

import com.hardwarestore.hardwarestore.model.Role;
import jakarta.validation.constraints.NotNull;

public class CreateUserRequest extends RegisterRequest {
    @NotNull(message = "Role is required")
    private Role role;
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
