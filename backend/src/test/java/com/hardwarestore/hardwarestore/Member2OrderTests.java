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
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class Member2OrderTests {

    @Autowired
    ProductService products;

    @Autowired
    CategoryService categories;

    @Autowired
    InventoryService stock;

    @Autowired
    UserRepository users;

    @Autowired
    RoleRepository roles;

    @Autowired
    CartRepository carts;

    @Autowired
    CartItemRepository cartItems;

    @Autowired
    OrderRepository orders;

    @Autowired
    OrderItemRepository orderItems;

    @Autowired
    InventoryRepository inventories;

    @Autowired
    OrderService orderService;

    @Autowired
    EntityManager entityManager;

    @Autowired
    MockMvc mvc;

    private Product createProduct(String name) {

        Category category =
                categories.createCategory(
                        new Category(
                                "Tools",
                                "Test tools"
                        )
                );

        return products.createProduct(
                new Product(
                        name,
                        "Test product",
                        new BigDecimal("1500.00"),
                        null,
                        99,
                        category
                )
        );
    }

    private User createCustomer(String name, String email) {

        User customer = new User();

        customer.setName(name);
        customer.setEmail(email);
        customer.setPassword("test-only");
        customer.setRole(
                roles.findByRoleName(RoleName.CUSTOMER)
                        .orElseThrow()
        );

        return users.save(customer);
    }

    private Cart createCart(User customer) {
        return carts.save(new Cart(customer));
    }

    private void reload() {
        entityManager.flush();
        entityManager.clear();
    }

    private MockHttpSession customerSession(User customer) {

        MockHttpSession session =
                new MockHttpSession();

        session.setAttribute(
                "userId",
                customer.getId()
        );

        session.setAttribute(
                "role",
                RoleName.CUSTOMER
        );

        return session;
    }

    private MockHttpSession staffSession() {

        MockHttpSession session =
                new MockHttpSession();

        session.setAttribute(
                "userId",
                999L
        );

        session.setAttribute(
                "role",
                RoleName.STAFF
        );

        return session;
    }

    private Order createOrder(
            User customer,
            Product product,
            int quantity
    ) {

        stock.updateStock(
                product.getProductId(),
                10
        );

        Cart cart = createCart(customer);

        cartItems.save(
                new CartItem(
                        cart,
                        product,
                        quantity,
                        product.getPrice()
                )
        );

        return orderService.checkout(customer);
    }

    @Test
    void emptyCartCannotBeCheckedOut() {

        User customer =
                createCustomer(
                        "Empty Cart Customer",
                        "empty-cart@example.invalid"
                );

        createCart(customer);

        assertThatThrownBy(
                () -> orderService.checkout(customer)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(
                        "empty cart"
                );
    }

    @Test
    void invalidCartQuantityCannotBeCheckedOut() {

        User customer =
                createCustomer(
                        "Invalid Quantity Customer",
                        "invalid-quantity@example.invalid"
                );

        Product product =
                createProduct("Invalid Quantity Product");

        stock.updateStock(
                product.getProductId(),
                10
        );

        Cart cart = createCart(customer);

        cartItems.save(
                new CartItem(
                        cart,
                        product,
                        0,
                        product.getPrice()
                )
        );

        assertThatThrownBy(
                () -> orderService.checkout(customer)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(
                        "greater than zero"
                );
    }

    @Test
    void insufficientStockLeavesCartAndStockUnchanged() {

        User customer =
                createCustomer(
                        "Stock Customer",
                        "stock@example.invalid"
                );

        Product product =
                createProduct("Limited Stock Product");

        stock.updateStock(
                product.getProductId(),
                2
        );

        Cart cart = createCart(customer);

        cartItems.save(
                new CartItem(
                        cart,
                        product,
                        3,
                        product.getPrice()
                )
        );

        assertThatThrownBy(
                () -> orderService.checkout(customer)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining(
                        "Not enough stock"
                );

        reload();

        assertThat(
                inventories
                        .findByProductProductId(
                                product.getProductId()
                        )
                        .orElseThrow()
                        .getQuantityOnHand()
        ).isEqualTo(2);

        assertThat(
                cartItems.findByCart(
                        carts.findById(cart.getCartId())
                                .orElseThrow()
                )
        ).hasSize(1);

        assertThat(
                orders.findByCustomer(customer)
        ).isEmpty();
    }

    @Test
    void successfulCheckoutCreatesOrderAndClearsCart() {

        User customer =
                createCustomer(
                        "Checkout Customer",
                        "checkout@example.invalid"
                );

        Product product =
                createProduct("Checkout Product");

        Order order =
                createOrder(
                        customer,
                        product,
                        3
                );

        reload();

        assertThat(order.getOrderId())
                .isNotNull();

        assertThat(order.getStatus())
                .isEqualTo(OrderStatus.PENDING);

        assertThat(order.getTotalAmount())
                .isEqualByComparingTo(
                        product.getPrice()
                                .multiply(
                                        BigDecimal.valueOf(3)
                                )
                );

        assertThat(
                inventories
                        .findByProductProductId(
                                product.getProductId()
                        )
                        .orElseThrow()
                        .getQuantityOnHand()
        ).isEqualTo(7);

        assertThat(
                cartItems.count()
        ).isZero();

        assertThat(
                orderItems.findByOrder(
                        orders.findById(
                                order.getOrderId()
                        ).orElseThrow()
                )
        ).hasSize(1);
    }

    @Test
    void customerCanAccessOwnOrderItems() throws Exception {

        User customer =
                createCustomer(
                        "Owner Customer",
                        "owner@example.invalid"
                );

        Product product =
                createProduct("Owner Product");

        Order order =
                createOrder(
                        customer,
                        product,
                        1
                );

        mvc.perform(
                get(
                        "/api/orders/"
                                + order.getOrderId()
                                + "/items"
                ).session(
                        customerSession(customer)
                )
        ).andExpect(
                status().isOk()
        );
    }

    @Test
    void customerCannotAccessAnotherCustomersOrderItems()
            throws Exception {

        User owner =
                createCustomer(
                        "Order Owner",
                        "owner-two@example.invalid"
                );

        User otherCustomer =
                createCustomer(
                        "Other Customer",
                        "other@example.invalid"
                );

        Product product =
                createProduct("Private Order Product");

        Order order =
                createOrder(
                        owner,
                        product,
                        1
                );

        mvc.perform(
                get(
                        "/api/orders/"
                                + order.getOrderId()
                                + "/items"
                ).session(
                        customerSession(otherCustomer)
                )
        ).andExpect(
                status().isForbidden()
        );
    }

    @Test
    void staffCanAccessOrderItems() throws Exception {

        User customer =
                createCustomer(
                        "Staff Access Customer",
                        "staff-access@example.invalid"
                );

        Product product =
                createProduct("Staff Access Product");

        Order order =
                createOrder(
                        customer,
                        product,
                        1
                );

        mvc.perform(
                get(
                        "/api/orders/"
                                + order.getOrderId()
                                + "/items"
                ).session(
                        staffSession()
                )
        ).andExpect(
                status().isOk()
        );
    }

    @Test
    void orderStatusFollowsAgreedWorkflow() {

        User customer =
                createCustomer(
                        "Status Customer",
                        "status@example.invalid"
                );

        Product product =
                createProduct("Status Product");

        Order order =
                createOrder(
                        customer,
                        product,
                        1
                );

        order =
                orderService.updateOrderStatus(
                        order.getOrderId(),
                        OrderStatus.CONFIRMED
                );

        assertThat(order.getStatus())
                .isEqualTo(OrderStatus.CONFIRMED);

        order =
                orderService.updateOrderStatus(
                        order.getOrderId(),
                        OrderStatus.PROCESSING
                );

        assertThat(order.getStatus())
                .isEqualTo(OrderStatus.PROCESSING);

        order =
                orderService.updateOrderStatus(
                        order.getOrderId(),
                        OrderStatus.SHIPPED
                );

        assertThat(order.getStatus())
                .isEqualTo(OrderStatus.SHIPPED);

        order =
                orderService.updateOrderStatus(
                        order.getOrderId(),
                        OrderStatus.DELIVERED
                );

        assertThat(order.getStatus())
                .isEqualTo(OrderStatus.DELIVERED);
    }

    @Test
    void invalidOrderStatusTransitionIsRejected() {

        User customer =
                createCustomer(
                        "Transition Customer",
                        "transition@example.invalid"
                );

        Product product =
                createProduct("Transition Product");

        Order order =
                createOrder(
                        customer,
                        product,
                        1
                );

        assertThatThrownBy(
                () -> orderService.updateOrderStatus(
                        order.getOrderId(),
                        OrderStatus.SHIPPED
                )
        )
                .isInstanceOf(
                        IllegalArgumentException.class
                )
                .hasMessageContaining(
                        "Invalid order status transition"
                );

        assertThat(
                orders.findById(
                        order.getOrderId()
                ).orElseThrow().getStatus()
        ).isEqualTo(OrderStatus.PENDING);
    }

    @Test
    void cancellationRestoresStockAndChangesStatus() {

        User customer =
                createCustomer(
                        "Cancellation Customer",
                        "cancel@example.invalid"
                );

        Product product =
                createProduct("Cancellation Product");

        Order order =
                createOrder(
                        customer,
                        product,
                        3
                );

        reload();

        assertThat(
                inventories
                        .findByProductProductId(
                                product.getProductId()
                        )
                        .orElseThrow()
                        .getQuantityOnHand()
        ).isEqualTo(7);

        orderService.cancelOrder(
                order.getOrderId()
        );

        reload();

        assertThat(
                inventories
                        .findByProductProductId(
                                product.getProductId()
                        )
                        .orElseThrow()
                        .getQuantityOnHand()
        ).isEqualTo(10);

        assertThat(
                orders.findById(
                        order.getOrderId()
                ).orElseThrow().getStatus()
        ).isEqualTo(
                OrderStatus.CANCELLED
        );
    }

    @Test
    void repeatedCancellationDoesNotRestoreStockTwice() {

        User customer =
                createCustomer(
                        "Repeat Cancellation Customer",
                        "repeat-cancel@example.invalid"
                );

        Product product =
                createProduct("Repeat Cancellation Product");

        Order order =
                createOrder(
                        customer,
                        product,
                        2
                );

        orderService.cancelOrder(
                order.getOrderId()
        );

        reload();

        int stockAfterFirstCancellation =
                inventories
                        .findByProductProductId(
                                product.getProductId()
                        )
                        .orElseThrow()
                        .getQuantityOnHand();

        assertThat(stockAfterFirstCancellation)
                .isEqualTo(10);

        assertThatThrownBy(
                () -> orderService.cancelOrder(
                        order.getOrderId()
                )
        )
                .isInstanceOf(
                        IllegalArgumentException.class
                )
                .hasMessageContaining(
                        "cannot be cancelled"
                );

        reload();

        assertThat(
                inventories
                        .findByProductProductId(
                                product.getProductId()
                        )
                        .orElseThrow()
                        .getQuantityOnHand()
        ).isEqualTo(
                stockAfterFirstCancellation
        );
    }

    @Test
    void cancellationIsRejectedAfterShipping() {

        User customer =
                createCustomer(
                        "Shipping Customer",
                        "shipping@example.invalid"
                );

        Product product =
                createProduct("Shipping Product");

        Order order =
                createOrder(
                        customer,
                        product,
                        1
                );

        orderService.updateOrderStatus(
                order.getOrderId(),
                OrderStatus.CONFIRMED
        );

        orderService.updateOrderStatus(
                order.getOrderId(),
                OrderStatus.PROCESSING
        );

        orderService.updateOrderStatus(
                order.getOrderId(),
                OrderStatus.SHIPPED
        );

        assertThatThrownBy(
                () -> orderService.cancelOrder(
                        order.getOrderId()
                )
        )
                .isInstanceOf(
                        IllegalArgumentException.class
                )
                .hasMessageContaining(
                        "cannot be cancelled"
                );

        assertThat(
                orders.findById(
                        order.getOrderId()
                ).orElseThrow().getStatus()
        ).isEqualTo(
                OrderStatus.SHIPPED
        );
    }
}