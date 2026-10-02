package com.hardwarestore.hardwarestore.config;

import com.hardwarestore.hardwarestore.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.server.ResponseStatusException;

@Component
public class SessionRefreshInterceptor implements HandlerInterceptor {
    private final UserRepository users;
    public SessionRefreshInterceptor(UserRepository users) { this.users = users; }
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (request.getMethod().equals("OPTIONS")) return true;
        var session = request.getSession(false);
        if (session != null && session.getAttribute("userId") instanceof Long userId) {
            var user = users.findById(userId).orElse(null);
            if (user == null) {
                session.invalidate();
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists. Please login again.");
            }
            session.setAttribute("role", user.getRole());
            session.setAttribute("email", user.getEmail());
        }
        return true;
    }
}
