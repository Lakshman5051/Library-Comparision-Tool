package com.project.library_comparison_tool.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

/**
 * Spring Session configuration for cross-origin cookie sharing.
 *
 * This configuration ensures that session cookies work correctly
 * between frontend (localhost:3000) and backend (localhost:8080).
 */
@Configuration
public class SessionConfig {

    @Bean
    public CookieSerializer cookieSerializer(
            @Value("${app.session.cookie-domain:}") String cookieDomain,
            @Value("${app.session.same-site:Lax}") String sameSite,
            @Value("${app.session.secure:false}") boolean secure) {

        System.out.println("\n========== CONFIGURING SESSION COOKIE ==========");
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("SESSION");
        serializer.setCookiePath("/");

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            serializer.setDomainName(cookieDomain); // e.g. yourdomain.com in prod
            System.out.println("Cookie domain: " + cookieDomain);
        } // else use default host

        // Normalize SameSite value (case-insensitive)
        String normalizedSameSite = sameSite != null ? sameSite.trim() : "Lax";
        // Spring Session expects: "None", "Lax", "Strict" (case-sensitive)
        if (normalizedSameSite.equalsIgnoreCase("none")) {
            normalizedSameSite = "None";
        } else if (normalizedSameSite.equalsIgnoreCase("lax")) {
            normalizedSameSite = "Lax";
        } else if (normalizedSameSite.equalsIgnoreCase("strict")) {
            normalizedSameSite = "Strict";
        }

        // CRITICAL: SameSite=None requires Secure=true (browser requirement)
        boolean finalSecure = secure;
        if ("None".equals(normalizedSameSite) && !secure) {
            System.out.println("⚠️  WARNING: SameSite=None requires Secure=true. Auto-enabling Secure flag.");
            finalSecure = true;
        }

        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(finalSecure);
        serializer.setSameSite(normalizedSameSite);

        System.out.println("Cookie name: SESSION");
        System.out.println("Cookie path: /");
        System.out.println("Cookie domain: " + (cookieDomain == null || cookieDomain.isBlank() ? "<request-host>" : cookieDomain));
        System.out.println("HttpOnly: true");
        System.out.println("Secure: " + finalSecure + (finalSecure != secure ? " (auto-enabled for SameSite=None)" : ""));
        System.out.println("SameSite: " + normalizedSameSite);
        System.out.println("========== SESSION COOKIE CONFIGURED ==========\n");
        return serializer;
    }
}