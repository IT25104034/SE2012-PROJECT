package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.model.*;
import com.hardwarestore.hardwarestore.repository.UserRepository;
import com.hardwarestore.hardwarestore.config.*;
import com.hardwarestore.hardwarestore.exception.ResourceConflictException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class RoleManagementTests {
    private User user(long id, Role role) { var user = new User();user.setId(id);user.setRole(role);user.setEmail("test@example.com");return user; }
    @Test void lastAdminCannotBeDemoted() {
        var repo=mock(UserRepository.class);var admin=user(1,Role.ADMIN);
        when(repo.findAllForRoleUpdate()).thenReturn(List.of(admin));
        var service=new UserService(repo,new BCryptPasswordEncoder());
        assertThrows(ResourceConflictException.class,()->service.updateRole(1L,Role.STAFF));
        assertEquals(Role.ADMIN,admin.getRole());verify(repo,never()).save(any());
    }
    @Test void anotherAdminAllowsRoleChange() {
        var repo=mock(UserRepository.class);var admin=user(1,Role.ADMIN);
        when(repo.findAllForRoleUpdate()).thenReturn(List.of(admin,user(2,Role.ADMIN)));
        new UserService(repo,new BCryptPasswordEncoder()).updateRole(1L,Role.STAFF);
        assertEquals(Role.STAFF,admin.getRole());verify(repo).save(admin);
    }
    @Test void demotedSessionLosesCataloguePermissionImmediately() {
        var repo=mock(UserRepository.class);when(repo.findById(1L)).thenReturn(Optional.of(user(1,Role.CUSTOMER)));
        var request=new MockHttpServletRequest("DELETE","/api/products/1");
        request.getSession().setAttribute("userId",1L);request.getSession().setAttribute("role",Role.ADMIN);
        var response=new MockHttpServletResponse();new SessionRefreshInterceptor(repo).preHandle(request,response,new Object());
        var error=assertThrows(ResponseStatusException.class,()->new CatalogueAuthorizationInterceptor().preHandle(request,response,new Object()));
        assertEquals(403,error.getStatusCode().value());
    }
}
