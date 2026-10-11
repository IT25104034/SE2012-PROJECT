package com.hardwarestore.hardwarestore;

import com.hardwarestore.hardwarestore.model.*;
import com.hardwarestore.hardwarestore.repository.*;
import com.hardwarestore.hardwarestore.service.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class Member1CatalogueTests {
    @Autowired ProductService products;
    @Autowired CategoryService categories;
    @Autowired InventoryService stock;
    @Autowired InventoryRepository inventories;
    @Autowired ProductRepository productRepository;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired CartService cartService;
    @Autowired CartRepository carts;
    @Autowired CartItemRepository cartItems;
    @Autowired OrderService orders;
    @Autowired EntityManager entityManager;
    @Autowired MockMvc mvc;

    private Product createProduct() {
        Category category = categories.createCategory(new Category("Tools", "Workshop tools"));
        return products.createProduct(new Product("Hammer", "Claw hammer", new BigDecimal("1500.00"), null, 99, category));
    }
    private void reload() { entityManager.flush(); entityManager.clear(); }
    private MockHttpSession admin() {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 1L);
        session.setAttribute("role", RoleName.ADMIN);
        return session;
    }

    @Test void newProductCreatesOneInventoryRecordAndMetadataEditsPreserveStock() {
        Product product = createProduct();
        Long id = product.getProductId();
        assertThat(product.getQuantity()).isZero();
        stock.updateStock(id, 12);
        reload();
        Product original = products.getProductById(id);
        Product changes = new Product("Better Hammer", "Revised", new BigDecimal("1600.00"), null, 500, original.getCategory());
        products.updateProduct(id, changes);
        reload();
        assertThat(products.getProductById(id).getQuantity()).isEqualTo(12);
        assertThat(products.getProductById(id).getName()).isEqualTo("Better Hammer");
        assertThat(inventories.findByProductProductId(id)).hasValueSatisfying(inventory -> {
            assertThat(inventory.getQuantityOnHand()).isEqualTo(12);
            assertThat(inventory.getReorderLevel()).isZero();
            assertThat(inventory.getLastUpdated()).isNotNull();
        });
        assertThat(inventories.count()).isEqualTo(1);
    }

    @Test void categoryArchiveHidesProductsAndRestoreKeepsIdsAndStock() {
        Product product = createProduct();
        Long id = product.getProductId();
        Long categoryId = product.getCategory().getCategoryId();
        stock.updateStock(id, 8);
        categories.deleteCategory(categoryId);
        reload();
        assertThat(products.getAllProducts()).isEmpty();
        assertThat(categories.getAllCategories()).isEmpty();
        assertThat(products.getAllProducts(true)).hasSize(1);
        Category restored = new Category("Tools", "Restored");
        categories.updateCategory(categoryId, restored);
        reload();
        assertThat(products.getAllProducts()).extracting(Product::getProductId).containsExactly(id);
        assertThat(products.getProductById(id).getQuantity()).isEqualTo(8);
        assertThat(categories.getCategoryById(categoryId).getCreatedAt()).isNotNull();
    }

    @Test void productArchiveRetainsTheInventoryAndCanBeRestored() {
        Product product = createProduct();
        Long id = product.getProductId();
        stock.updateStock(id, 7);
        products.deleteProduct(id);
        reload();
        assertThat(products.getAllProducts()).isEmpty();
        Product archived = products.getProductById(id);
        assertThat(archived.isActive()).isFalse();
        archived.setActive(true);
        products.updateProduct(id, archived);
        reload();
        assertThat(products.getProductById(id).getQuantity()).isEqualTo(7);
        assertThat(products.getAllProducts()).hasSize(1);
    }

    @Test void checkoutStillPersistsInventoryReductionAndClearsCart() {
        Product product = createProduct();
        stock.updateStock(product.getProductId(), 10);
        User customer = new User();
        customer.setName("Test customer"); customer.setEmail("test@example.invalid");
        customer.setPassword("test-only"); customer.setRole(roles.findByRoleName(RoleName.CUSTOMER).orElseThrow());
        users.save(customer);
        Cart cart = carts.save(new Cart(customer));
        cartItems.save(new CartItem(cart, product, 3, product.getPrice()));
        orders.checkout(customer);
        reload();
        assertThat(products.getProductById(product.getProductId()).getQuantity()).isEqualTo(7);
        assertThat(inventories.findByProductProductId(product.getProductId()).orElseThrow().getQuantityOnHand()).isEqualTo(7);
        assertThat(cartItems.count()).isZero();
    }

    @Test void archivedProductAlreadyInCartCannotBePurchased() {
        Product product = createProduct();
        stock.updateStock(product.getProductId(), 10);
        User customer = new User();
        customer.setName("Test customer"); customer.setEmail("archive@example.invalid");
        customer.setPassword("test-only"); customer.setRole(roles.findByRoleName(RoleName.CUSTOMER).orElseThrow()); users.save(customer);
        Cart cart = carts.save(new Cart(customer));
        cartItems.save(new CartItem(cart, product, 2, product.getPrice()));
        products.deleteProduct(product.getProductId());
        assertThatThrownBy(() -> orders.checkout(customer)).isInstanceOf(IllegalArgumentException.class).hasMessageContaining("no longer available");
        assertThat(product.getQuantity()).isEqualTo(10);
    }

    @Test void mutationAndArchiveListingRequireAnAdminSession() throws Exception {
        String body = "{\"name\":\"Tools\",\"description\":\"Test\"}";
        mvc.perform(post("/api/categories").contentType("application/json").content(body)).andExpect(status().isUnauthorized());
        MockHttpSession customer = new MockHttpSession();
        customer.setAttribute("userId", 2L); customer.setAttribute("role", RoleName.CUSTOMER);
        mvc.perform(post("/api/categories").session(customer).contentType("application/json").content(body)).andExpect(status().isForbidden());
        mvc.perform(get("/api/products?includeInactive=true")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/products/1").session(customer)).andExpect(status().isForbidden());
        mvc.perform(post("/api/categories").session(admin()).contentType("application/json").content(body)).andExpect(status().isOk());
    }

    @Test void cataloguePayloadCannotOverwriteInventoryStock() throws Exception {
        Product product = createProduct();
        stock.updateStock(product.getProductId(), 9);
        String body = "{\"name\":\"Hammer edited\",\"price\":1700,\"quantity\":1000,\"inventory\":{\"quantityOnHand\":1000},\"active\":true,\"category\":{\"categoryId\":" + product.getCategory().getCategoryId() + "}}";
        mvc.perform(put("/api/products/" + product.getProductId()).session(admin()).contentType("application/json").content(body))
            .andExpect(status().isOk()).andExpect(jsonPath("$.quantity").value(9)).andExpect(jsonPath("$.inventory").doesNotExist());
        reload();
        assertThat(products.getProductById(product.getProductId()).getQuantity()).isEqualTo(9);
    }

    @Test void archivedDetailIsHiddenAndNegativeStockIsRejected() throws Exception {
        Product product = createProduct();
        products.deleteProduct(product.getProductId());
        mvc.perform(get("/api/products/" + product.getProductId())).andExpect(status().isNotFound());
        assertThatThrownBy(() -> stock.updateStock(product.getProductId(), -1)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test void inventoryResponseIncludesProductWithoutRecursiveInventory() throws Exception {
        Product product = createProduct();
        stock.updateStock(product.getProductId(), 6);
        reload();
        mvc.perform(get("/api/inventory/" + product.getProductId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.quantityOnHand").value(6))
            .andExpect(jsonPath("$.product.productId").value(product.getProductId()))
            .andExpect(jsonPath("$.product.quantity").value(6))
            .andExpect(jsonPath("$.product.inventory").doesNotExist());
        assertThatThrownBy(() -> stock.createInventoryForProduct(product.getProductId(), 1, 0))
            .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("already exists");
    }

    @Test void staffStockUpdatesAreVisibleToCustomersAndCustomerUpdatesAreForbidden() throws Exception {
        Product product = createProduct();
        MockHttpSession staff = new MockHttpSession();
        staff.setAttribute("userId", 3L);
        staff.setAttribute("role", RoleName.STAFF);
        mvc.perform(put("/api/inventory/" + product.getProductId() + "/stock")
            .session(staff).contentType("application/json").content("{\"quantity\":11}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.quantityOnHand").value(11));
        reload();
        mvc.perform(get("/api/products/" + product.getProductId()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.quantity").value(11));
        MockHttpSession customer = new MockHttpSession();
        customer.setAttribute("userId", 4L);
        customer.setAttribute("role", RoleName.CUSTOMER);
        mvc.perform(put("/api/inventory/" + product.getProductId() + "/stock")
            .session(customer).contentType("application/json").content("{\"quantity\":99}"))
            .andExpect(status().isForbidden());
    }

    @Test void cartUsesInventoryStockAndRejectsArchivedProducts() {
        Product product = createProduct();
        stock.updateStock(product.getProductId(), 4);
        User customer = new User();
        customer.setName("Cart customer"); customer.setEmail("cart@example.invalid");
        customer.setPassword("test-only");
        customer.setRole(roles.findByRoleName(RoleName.CUSTOMER).orElseThrow());
        users.save(customer);
        assertThat(cartService.addItem(customer, product, 2).getQuantity()).isEqualTo(2);
        assertThatThrownBy(() -> cartService.addItem(customer, product, 3))
            .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Only 4");
        products.deleteProduct(product.getProductId());
        assertThatThrownBy(() -> cartService.addItem(customer, product, 1))
            .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("no longer available");
    }
}
