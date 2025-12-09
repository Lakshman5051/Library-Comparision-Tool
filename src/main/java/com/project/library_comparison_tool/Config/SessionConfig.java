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

        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(secure);
        serializer.setSameSite(sameSite);

        System.out.println("Cookie name: SESSION");
        System.out.println("Cookie path: /");
        System.out.println("Cookie domain: " + (cookieDomain == null || cookieDomain.isBlank() ? "<request-host>" : cookieDomain));
        System.out.println("HttpOnly: true");
        System.out.println("Secure: " + secure);
        System.out.println("SameSite: " + sameSite);
        System.out.println("========== SESSION COOKIE CONFIGURED ==========\n");
        return serializer;
    }
}