package com.hardwarestore.hardwarestore.dto;
import com.hardwarestore.hardwarestore.model.Role;
import jakarta.validation.constraints.NotNull;
public record UpdateRoleRequest(@NotNull(message = "Role is required") Role role) {}
