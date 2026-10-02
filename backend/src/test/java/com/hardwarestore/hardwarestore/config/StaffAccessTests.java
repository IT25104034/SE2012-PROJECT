package com.hardwarestore.hardwarestore.config;

import com.hardwarestore.hardwarestore.controller.*;
import com.hardwarestore.hardwarestore.model.*;
import com.hardwarestore.hardwarestore.repository.*;
import com.hardwarestore.hardwarestore.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class StaffAccessTests {
    private MockHttpSession staff() {
        var session = new MockHttpSession();session.setAttribute("userId",1L);session.setAttribute("role",Role.STAFF);return session;
    }
    @Test void staffCanUpdateStock() throws Exception {
        var service = mock(InventoryService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new InventoryController(service)).build();
        mvc.perform(put("/api/inventory/1/stock").session(staff()).contentType(MediaType.APPLICATION_JSON).content("{\"quantity\":5}"))
                .andExpect(status().isOk());
        verify(service).updateStock(1L,5);
    }
    @Test void staffCanReadIncomingOrders() throws Exception {
        var service = mock(OrderService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new OrderController(service,mock(UserRepository.class),mock(OrderRepository.class))).build();
        mvc.perform(get("/api/orders/status/PENDING").session(staff())).andExpect(status().isOk());
        verify(service).getOrdersByStatus(OrderStatus.PENDING);
    }
    @Test void staffCannotWriteCatalogue() throws Exception {
        var products = mock(ProductService.class);
        var categories = mock(CategoryService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new ProductController(products),new CategoryController(categories))
                .addInterceptors(new CatalogueAuthorizationInterceptor()).build();
        for (String path : new String[]{"/api/products","/api/categories"}) {
            mvc.perform(post(path).session(staff()).contentType(MediaType.APPLICATION_JSON).content("{}")) .andExpect(status().isForbidden());
            mvc.perform(put(path+"/1").session(staff()).contentType(MediaType.APPLICATION_JSON).content("{}")) .andExpect(status().isForbidden());
            mvc.perform(delete(path+"/1").session(staff())).andExpect(status().isForbidden());
        }
        verifyNoInteractions(products,categories);
    }
}
