package com.hardwarestore.hardwarestore.config;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.model.User;
import com.hardwarestore.hardwarestore.service.GoogleAccountService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class GoogleSessionTests {
    OidcUser identity() {
        OidcUser identity = mock(OidcUser.class);
        when(identity.getSubject()).thenReturn("subject");
        when(identity.getEmail()).thenReturn("customer@example.com");
        when(identity.getEmailVerified()).thenReturn(true);
        when(identity.getFullName()).thenReturn("Customer");
        return identity;
    }
    @Test void successfulGoogleLoginRotatesSessionAndPopulatesExistingStoreAttributes() throws Exception {
        var accounts = mock(GoogleAccountService.class);
        var user = new User(); user.setId(42L); user.setRole(Role.CUSTOMER); user.setEmail("customer@example.com");
        when(accounts.signIn("subject", "customer@example.com", true, "Customer")).thenReturn(user);
        var request = new MockHttpServletRequest(); var session = new MockHttpSession(); request.setSession(session);
        String oldId = session.getId();
        var response = new MockHttpServletResponse();
        new GoogleLoginConfig().googleSuccess(accounts,"http://localhost:5173").onAuthenticationSuccess(request, response,
                new OAuth2AuthenticationToken(identity(), List.of(), "google"));
        assertNotEquals(oldId, session.getId());
        assertEquals(42L, session.getAttribute("userId"));
        assertEquals(Role.CUSTOMER, session.getAttribute("role"));
        assertEquals("customer@example.com", session.getAttribute("email"));
        assertEquals("http://localhost:5173/login", response.getRedirectedUrl());
    }
    @Test void emailCollisionDoesNotLeaveAnAuthenticatedStoreSession() throws Exception {
        var accounts = mock(GoogleAccountService.class);
        when(accounts.signIn(anyString(),anyString(),anyBoolean(),anyString())).thenThrow(new IllegalArgumentException("existing-account"));
        var request = new MockHttpServletRequest(); var session = new MockHttpSession(); request.setSession(session);
        var response = new MockHttpServletResponse();
        new GoogleLoginConfig().googleSuccess(accounts,"http://localhost:5173").onAuthenticationSuccess(request,response,
                new OAuth2AuthenticationToken(identity(),List.of(),"google"));
        assertTrue(session.isInvalid());
        assertEquals("http://localhost:5173/login?google=existing-account", response.getRedirectedUrl());
    }
}
