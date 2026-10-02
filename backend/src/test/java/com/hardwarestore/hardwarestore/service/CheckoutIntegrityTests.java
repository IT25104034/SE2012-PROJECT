package com.hardwarestore.hardwarestore.service;

import com.hardwarestore.hardwarestore.model.*;
import com.hardwarestore.hardwarestore.repository.*;
import com.hardwarestore.hardwarestore.exception.ResourceConflictException;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class CheckoutIntegrityTests {
    @Autowired CartService carts;
    @Autowired OrderService orders;
    @Autowired UserRepository users;
    @Autowired CategoryRepository categories;
    @Autowired ProductRepository products;
    @Autowired OrderRepository orderRepository;
    @Autowired OrderItemRepository orderItems;
    @Autowired CartItemRepository cartItems;
    @Autowired CartRepository cartRepository;
    User customer() {
        var user=new User();user.setName("Test");user.setEmail(UUID.randomUUID()+"@example.com");user.setPassword("test hash");user.setRole(Role.CUSTOMER);return users.save(user);
    }
    Product product(int quantity) {
        var category=new Category();category.setName("Test category");category=categories.save(category);
        return products.save(new Product("Test product","",new BigDecimal("12.50"),null,quantity,category));
    }
    @Test void checkoutCreatesItemsDeductsStockAndClearsCart() {
        var user=customer();var product=product(5);carts.addItem(user,product,2);
        var order=orders.checkout(user);
        assertEquals(new BigDecimal("25.00"),order.getTotalAmount());
        assertEquals(3,products.findById(product.getProductId()).orElseThrow().getQuantity());
        assertTrue(carts.getCartItems(user).isEmpty());assertEquals(1,orderItems.findByOrder(order).size());
    }
    @Test void failedMultiProductCheckoutRollsBackEarlierStockUpdates() {
        var user=customer();var first=product(3);var second=product(1);
        carts.addItem(user,first,2);carts.addItem(user,second,1);
        second.setQuantity(0);products.save(second);
        assertThrows(ResourceConflictException.class,()->orders.checkout(user));
        assertEquals(3,products.findById(first.getProductId()).orElseThrow().getQuantity());
        assertEquals(2,carts.getCartItems(user).size());assertTrue(orderRepository.findByCustomer(user).isEmpty());
    }
    @Test void concurrentCustomersCannotBuyTheSameLastUnit() throws Exception {
        var first=customer();var second=customer();var product=product(1);
        carts.addItem(first,product,1);carts.addItem(second,product,1);
        var start=new CountDownLatch(1);var executor=Executors.newFixedThreadPool(2);
        try {
            Callable<Boolean> a=()->{start.await();try{orders.checkout(first);return true;}catch(ResourceConflictException ex){return false;}};
            Callable<Boolean> b=()->{start.await();try{orders.checkout(second);return true;}catch(ResourceConflictException ex){return false;}};
            var one=executor.submit(a);var two=executor.submit(b);start.countDown();
            assertNotEquals(one.get(10,TimeUnit.SECONDS),two.get(10,TimeUnit.SECONDS));
            assertEquals(0,products.findById(product.getProductId()).orElseThrow().getQuantity());
            assertEquals(1,orderRepository.findByCustomer(first).size()+orderRepository.findByCustomer(second).size());
        } finally {executor.shutdownNow();}
    }
    @Test void cancellationRestoresStockWithoutDoubleRestocking() {
        var user=customer();var product=product(2);carts.addItem(user,product,2);var order=orders.checkout(user);
        orders.updateOrderStatus(order.getOrderId(),OrderStatus.CANCELLED);
        orders.updateOrderStatus(order.getOrderId(),OrderStatus.CANCELLED);
        assertEquals(2,products.findById(product.getProductId()).orElseThrow().getQuantity());
    }
}
