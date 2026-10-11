package com.hardwarestore.hardwarestore.controller;

import com.hardwarestore.hardwarestore.model.RoleName;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class CatalogueAccess {
    private CatalogueAccess() {}
    static void requireAdmin(HttpSession session) {
        if (session.getAttribute("userId") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please login first");
        }
        if (session.getAttribute("role") != RoleName.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
