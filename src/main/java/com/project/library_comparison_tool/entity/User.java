package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
        @Column(nullable = false, unique = true, length = 50)
        private String username;

        @Column(nullable = false, unique = true, length = 100)
        private String email;

        @Column(name = "password_hash", nullable = false)
        private String passwordHash;

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

        // RELATIONSHIPS - We'll add these step by step

        // 1. User has many roles (ONE user → MANY roles)
        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        @Builder.Default
        private Set<UserRole> userRoles = new HashSet<>();

        // 2. User has many projects (ONE user → MANY projects)
        // We'll add this in Step 3
        // @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
        // private Set<Project> projects = new HashSet<>();

        // 3. User has many favorites (ONE user → MANY favorites)
        // We'll add this in Step 4
        // @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
        // private Set<Favorite> favorites = new HashSet<>();

        // HELPER METHODS

        /**
         * Add a role to this user
         */
        public void addRole(Role role) {
            UserRole userRole = new UserRole();
            userRole.setUser(this);
            userRole.setRole(role);
            userRole.setGrantedAt(LocalDateTime.now());
            userRoles.add(userRole);
        }

        /**
         * Remove a role from this user
         */
        public void removeRole(Role role) {
            userRoles.removeIf(ur -> ur.getRole().equals(role));
        }

        /**
         * Check if user has a specific role
         */
        public boolean hasRole(Role role) {
            return userRoles.stream()
                    .anyMatch(ur -> ur.getRole().equals(role));
        }

        /**
         * Get all roles as a Set
         */
        public Set<Role> getRoles() {
            Set<Role> roles = new HashSet<>();
            userRoles.forEach(ur -> roles.add(ur.getRole()));
            return roles;
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
            return username;
        }
}

