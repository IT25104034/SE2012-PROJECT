package com.hardwarestore.hardwarestore.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "store.google.enabled=true", "store.google.client-id=test-client.apps.googleusercontent.com",
    "store.google.client-secret=test-secret", "store.google.frontend-url=http://localhost:5173"
})
@ActiveProfiles("test")
class GoogleLoginTests {
    @Autowired Environment environment;
    HttpResponse<String> get(String path) throws Exception {
        return HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("http://localhost:" + environment.getProperty("local.server.port") + path)).GET().build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test void authorizationUsesGoogleWithStateNonceAndExactCallback() throws Exception {
        var res = get("/oauth2/authorization/google");
        assertEquals(302, res.statusCode());
        var location = res.headers().firstValue("location").orElseThrow();
        assertTrue(location.startsWith("https://accounts.google.com/o/oauth2/v2/auth?"));
        assertTrue(location.contains("state="));
        assertTrue(location.contains("nonce="));
        assertTrue(location.contains("redirect_uri=http://localhost:8081/login/oauth2/code/google") || location.contains("redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Flogin%2Foauth2%2Fcode%2Fgoogle"));
    }
    @Test void forgedCallbackWithoutAuthorizationSessionFails() throws Exception {
        var res = get("/login/oauth2/code/google?code=forged&state=forged");
        assertEquals(302, res.statusCode());
        assertEquals("http://localhost:5173/login?google=failed", res.headers().firstValue("location").orElseThrow());
        assertEquals(401, get("/api/auth/me").statusCode());
    }
    @Test void publicConfigurationExposesOnlyAvailabilityAndPublicCatalogueStillWorks() throws Exception {
        var config = get("/api/auth/google/config");
        assertEquals(200, config.statusCode());
        assertEquals("{\"enabled\":true}", config.body());
        assertEquals(200, get("/api/products").statusCode());
        assertEquals(401, get("/api/admin/users").statusCode());
    }
}
