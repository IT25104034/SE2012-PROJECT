package com.hardwarestore.hardwarestore.config;
import com.hardwarestore.hardwarestore.controller.HealthController;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataAccessResourceFailureException;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class HealthTests {
    @Test void connectedDatabaseReportsUp() {
        var jdbc=mock(JdbcTemplate.class);when(jdbc.queryForObject("SELECT 1",Integer.class)).thenReturn(1);
        var response=new HealthController(jdbc).health();assertEquals(200,response.getStatusCode().value());assertEquals("UP",response.getBody().get("status"));
    }
    @Test void unavailableDatabaseReportsDownWithoutDetails() {
        var jdbc=mock(JdbcTemplate.class);when(jdbc.queryForObject("SELECT 1",Integer.class)).thenThrow(new DataAccessResourceFailureException("Private connection details"));
        var response=new HealthController(jdbc).health();assertEquals(503,response.getStatusCode().value());assertEquals(java.util.Map.of("status","DOWN"),response.getBody());
    }
}
