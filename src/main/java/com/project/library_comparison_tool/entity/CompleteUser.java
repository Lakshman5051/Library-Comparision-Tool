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


        /**
         * RELATIONSHIP: User → Favorites (One-to-Many)
         * One user can favorite multiple libraries
         */
        /* Uncomment when Favorite entity is implemented
        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private Set<Favorite> favorites = new HashSet<>();
        */

        // ============================================
        // HELPER METHODS FOR FAVORITES
        // ============================================
        // Uncomment when Favorite entity is implemented

        /*
        public void addFavorite(Library library) {
            Favorite favorite = new Favorite();
            favorite.setUser(this);
            favorite.setLibrary(library);
            favorites.add(favorite);
        }

        public void removeFavorite(Library library) {
            favorites.removeIf(f -> f.getLibrary().equals(library));
        }

        public boolean hasFavorited(Library library) {
            return favorites.stream()
                    .anyMatch(f -> f.getLibrary().equals(library));
        }

        public int getFavoriteCount() {
            return favorites.size();
        }
        */

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
