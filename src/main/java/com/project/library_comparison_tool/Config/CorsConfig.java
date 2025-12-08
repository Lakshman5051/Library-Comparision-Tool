package com.project.library_comparison_tool.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * CORS Configuration
 * NOTE: This is DEPRECATED - CORS is now configured in SecurityConfig.
 * Keeping this for backward compatibility but it should be removed if not needed.
 * The SecurityConfig CORS configuration takes precedence.
 */
@Configuration
public class CorsConfig {
    // Commented out to avoid conflicts with SecurityConfig CORS
    // CORS is now handled in SecurityConfig.corsConfigurationSource()
    /*
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // IMPORTANT: Cannot use "*" when allowCredentials is true
        // Must specify exact origins for session cookies to work
        config.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "https://*.vercel.app"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true); // CRITICAL: Enable credentials (cookies, sessions)
        config.setExposedHeaders(Arrays.asList("Set-Cookie")); // Expose session cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
    */
}