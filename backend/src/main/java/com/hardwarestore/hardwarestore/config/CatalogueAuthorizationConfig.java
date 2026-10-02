package com.hardwarestore.hardwarestore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CatalogueAuthorizationConfig implements WebMvcConfigurer {
    private final CatalogueAuthorizationInterceptor interceptor;

    public CatalogueAuthorizationConfig(CatalogueAuthorizationInterceptor interceptor) {
        this.interceptor = interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(interceptor)
                .addPathPatterns("/api/products", "/api/products/**",
                                 "/api/categories", "/api/categories/**");
    }
}
