package com.hardwarestore.hardwarestore.controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
@RestController
public class GoogleLoginController {
    private final boolean enabled;
    public GoogleLoginController(@Value("${store.google.enabled:false}") boolean enabled) { this.enabled = enabled; }
    @GetMapping("/api/auth/google/config")
    public Map<String, Boolean> config() { return Map.of("enabled", enabled); }
}
