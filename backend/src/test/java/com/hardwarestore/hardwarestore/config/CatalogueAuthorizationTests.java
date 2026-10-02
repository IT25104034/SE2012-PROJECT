package com.hardwarestore.hardwarestore.config;

import com.hardwarestore.hardwarestore.controller.CategoryController;
import com.hardwarestore.hardwarestore.controller.ProductController;
import com.hardwarestore.hardwarestore.model.Role;
import com.hardwarestore.hardwarestore.service.CategoryService;
import com.hardwarestore.hardwarestore.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CatalogueAuthorizationTests {

    private ProductService products;
    private CategoryService categories;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        products = mock(ProductService.class);
        categories = mock(CategoryService.class);
        mvc = MockMvcBuilders.standaloneSetup(
                        new ProductController(products), new CategoryController(categories))
                .addInterceptors(new CatalogueAuthorizationInterceptor())
                .build();
    }

    private MockHttpServletRequestBuilder write(String method, String path) {
        String json = path.startsWith("/api/products")
                ? "{\"name\":\"Test drill\",\"price\":10,\"quantity\":2,\"category\":{\"categoryId\":1}}"
                : "{\"name\":\"Test tools\"}";
        return request(HttpMethod.valueOf(method), path)
                .contentType(MediaType.APPLICATION_JSON).content(json);
    }

    private MockHttpSession session(Role role) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        session.setAttribute("role", role);
        return session;
    }

    @ParameterizedTest
    @CsvSource({"POST,/api/products", "PUT,/api/products/1", "DELETE,/api/products/1",
                "POST,/api/categories", "PUT,/api/categories/1", "DELETE,/api/categories/1"})
    void guestWritesAreUnauthorized(String method, String path) throws Exception {
        mvc.perform(write(method, path)).andExpect(status().isUnauthorized());
        verifyNoInteractions(products, categories);
    }

    @ParameterizedTest
    @CsvSource({"POST,/api/products", "PUT,/api/products/1", "DELETE,/api/products/1",
                "POST,/api/categories", "PUT,/api/categories/1", "DELETE,/api/categories/1"})
    void customerWritesAreForbidden(String method, String path) throws Exception {
        mvc.perform(write(method, path).session(session(Role.CUSTOMER)))
                .andExpect(status().isForbidden());
        verifyNoInteractions(products, categories);
    }

    @ParameterizedTest
    @CsvSource({"POST,/api/products", "PUT,/api/products/1", "DELETE,/api/products/1",
                "POST,/api/categories", "PUT,/api/categories/1", "DELETE,/api/categories/1"})
    void adminWritesReachTheService(String method, String path) throws Exception {
        mvc.perform(write(method, path).session(session(Role.ADMIN)))
                .andExpect(status().is2xxSuccessful());
        if (path.startsWith("/api/products")) {
            switch (method) {
                case "POST" -> verify(products).createProduct(any());
                case "PUT" -> verify(products).updateProduct(eq(1L), any());
                case "DELETE" -> verify(products).deleteProduct(1L);
            }
            verifyNoInteractions(categories);
        } else {
            switch (method) {
                case "POST" -> verify(categories).createCategory(any());
                case "PUT" -> verify(categories).updateCategory(eq(1L), any());
                case "DELETE" -> verify(categories).deleteCategory(1L);
            }
            verifyNoInteractions(products);
        }
    }

    @ParameterizedTest
    @CsvSource({"/api/products", "/api/products/1", "/api/categories", "/api/categories/1"})
    void catalogueReadsRemainPublic(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk());
    }

    @ParameterizedTest
    @CsvSource({"/api/products", "/api/categories"})
    void malformedGuestWritesAreBlockedBeforeValidation(String path) throws Exception {
        mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        MockHttpSession roleOnly = new MockHttpSession();
        roleOnly.setAttribute("role", Role.ADMIN);
        mvc.perform(post(path).session(roleOnly).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(products, categories);
    }

    @ParameterizedTest
    @CsvSource({"/api/products", "/api/products/1", "/api/categories", "/api/categories/1"})
    void corsPreflightRemainsPublic(String path) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", path);
        request.addHeader("Origin", "http://localhost:5173");
        request.addHeader("Access-Control-Request-Method", "PUT");
        assertTrue(new CatalogueAuthorizationInterceptor().preHandle(
                request, new MockHttpServletResponse(), new Object()));
        verifyNoInteractions(products, categories);
    }
}
