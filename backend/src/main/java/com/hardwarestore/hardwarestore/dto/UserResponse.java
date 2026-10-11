package com.hardwarestore.hardwarestore.dto;

import com.hardwarestore.hardwarestore.model.RoleName;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private RoleName role;
    private boolean active;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String name,
            String email,
            RoleName role,
            boolean active
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public RoleName getRole() {
        return role;
    }

    public void setRole(RoleName role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}