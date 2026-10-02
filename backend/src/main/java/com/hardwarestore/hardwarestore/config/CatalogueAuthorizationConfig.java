package com.hardwarestore.hardwarestore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CatalogueAuthorizationConfig implements WebMvcConfigurer {
    private final CatalogueAuthorizationInterceptor interceptor;
    private final SessionRefreshInterceptor sessionRefresh;

    public CatalogueAuthorizationConfig(CatalogueAuthorizationInterceptor interceptor, SessionRefreshInterceptor sessionRefresh) {
        this.interceptor = interceptor;
        this.sessionRefresh = sessionRefresh;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionRefresh).addPathPatterns("/api/**").order(-100);
        registry.addInterceptor(interceptor)
                .addPathPatterns("/api/products", "/api/products/**",
                                 "/api/categories", "/api/categories/**");
    }
}
