package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

public class CompleteUser extends User {

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

        // ============================================
        // RELATIONSHIPS - This is where the magic happens!
        // ============================================

        /**
         * RELATIONSHIP 1: User → Roles (One-to-Many)
         * One user can have multiple roles (USER, ADMIN)
         */
        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
        @Builder.Default
        private Set<UserRole> userRoles = new HashSet<>();

        /**
         * RELATIONSHIP 2: User → Projects (One-to-Many)
         * One user can have multiple projects
         */
        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private Set<Project> projects = new HashSet<>();

        /**
         * RELATIONSHIP 3: User → Favorites (One-to-Many)
         * One user can favorite multiple libraries
         */
        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private Set<Favorite> favorites = new HashSet<>();

        // ============================================
        // HELPER METHODS FOR ROLES
        // ============================================

        public void addRole(Role role) {
            UserRole userRole = new UserRole();
            userRole.setUser(this);
            userRole.setRole(role);
            userRole.setGrantedAt(LocalDateTime.now());
            userRoles.add(userRole);
        }

        public void removeRole(Role role) {
            userRoles.removeIf(ur -> ur.getRole().equals(role));
        }

        public boolean hasRole(Role role) {
            return userRoles.stream()
                    .anyMatch(ur -> ur.getRole().equals(role));
        }

        public Set<Role> getRoles() {
            Set<Role> roles = new HashSet<>();
            userRoles.forEach(ur -> roles.add(ur.getRole()));
            return roles;
        }

        public boolean isAdmin() {
            return hasRole(Role.ADMIN);
        }

        // ============================================
        // HELPER METHODS FOR PROJECTS
        // ============================================

        /**
         * Add a project to this user
         */
        public void addProject(Project project) {
            projects.add(project);
            project.setUser(this);
        }

        /**
         * Remove a project from this user
         */
        public void removeProject(Project project) {
            projects.remove(project);
            project.setUser(null);
        }

        /**
         * Get count of user's projects
         */
        public int getProjectCount() {
            return projects.size();
        }

        /**
         * Check if user owns a specific project
         */
        public boolean ownsProject(Project project) {
            return projects.contains(project);
        }

        // ============================================
        // HELPER METHODS FOR FAVORITES
        // ============================================

        /**
         * Add a library to favorites
         */
        public void addFavorite(Library library) {
            Favorite favorite = new Favorite();
            favorite.setUser(this);
            favorite.setLibrary(library);
            favorites.add(favorite);
        }

        /**
         * Remove a library from favorites
         */
        public void removeFavorite(Library library) {
            favorites.removeIf(f -> f.getLibrary().equals(library));
        }

        /**
         * Check if user has favorited a library
         */
        public boolean hasFavorited(Library library) {
            return favorites.stream()
                    .anyMatch(f -> f.getLibrary().equals(library));
        }

        /**
         * Get count of user's favorites
         */
        public int getFavoriteCount() {
            return favorites.size();
        }

        // ============================================
        // OTHER HELPER METHODS
        // ============================================

        public void updateLastLogin() {
            this.lastLoginAt = LocalDateTime.now();
        }

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
