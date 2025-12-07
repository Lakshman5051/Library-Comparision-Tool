package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // Authentication fields
        // MODIFIED: Made nullable to support OAuth users who don't have usernames
        @Column(unique = true, length = 50)
        private String username;

        @Column(nullable = false, unique = true, length = 100)
        private String email;

        // MODIFIED: Made nullable to support OAuth users who don't have passwords
        @Column(name = "password_hash")
        private String passwordHash;

        // OAuth specific fields
        @Column(name = "google_id", unique = true)
        private String googleId;

        @Column(name = "auth_provider", nullable = false)
        @Enumerated(EnumType.STRING)
        @Builder.Default
        private AuthProvider authProvider = AuthProvider.LOCAL;

        @Column(name = "profile_picture_url", length = 500)
        private String profilePictureUrl;

        @Column(name = "email_verified")
        @Builder.Default
        private Boolean emailVerified = false;

        // Profile fields
        @Column(name = "first_name", length = 100)
        private String firstName;

        @Column(name = "last_name", length = 100)
        private String lastName;

        // Account status
        @Column(name = "is_active")
        @Builder.Default
        private Boolean isActive = true;

        // Timestamps
        @CreationTimestamp
        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;

        @UpdateTimestamp
        @Column(name = "updated_at")
        private LocalDateTime updatedAt;

        @Column(name = "last_login_at")
        private LocalDateTime lastLoginAt;

        // User role (simplified: single role per user)
        @Enumerated(EnumType.STRING)
        @Column(name = "role", nullable = false, length = 20)
        @Builder.Default
        private Role role = Role.USER;

        /**
         * Check if user has a specific role
         */
        public boolean hasRole(Role role) {
            return this.role != null && this.role.equals(role);
        }

        /**
         * Get user's role
         */
        public Role getRole() {
            return role != null ? role : Role.USER;
        }

        /**
         * Set user's role
         */
        public void setRole(Role role) {
            this.role = role != null ? role : Role.USER;
        }

        /**
         * Check if user is an admin
         */
        public boolean isAdmin() {
            return hasRole(Role.ADMIN);
        }

        /**
         * Update last login timestamp
         */
        public void updateLastLogin() {
            this.lastLoginAt = LocalDateTime.now();
        }

        /**
         * Get full name
         */
        public String getFullName() {
            if (firstName != null && lastName != null) {
                return firstName + " " + lastName;
            } else if (firstName != null) {
                return firstName;
            } else if (lastName != null) {
                return lastName;
            }
            return username != null ? username : email;
        }

        /**
         * Check if this is a Google OAuth user
         */
        public boolean isGoogleUser() {
            return authProvider == AuthProvider.GOOGLE;
        }

        /**
         * Check if this is a local (username/password) user
         */
        public boolean isLocalUser() {
            return authProvider == AuthProvider.LOCAL;
        }
}

