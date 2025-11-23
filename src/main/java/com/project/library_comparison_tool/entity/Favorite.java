package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorites", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "library_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorite {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // Link to User
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        // Link to Library (YOUR EXISTING LIBRARY ENTITY!)
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "library_id", nullable = false)
        private Library library;

        // When was this library favorited?
        @CreationTimestamp
        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;

        // HELPER METHODS

        /**
         * Get the library name (convenience method)
         */
        public String getLibraryName() {
            return library != null ? library.getName() : null;
        }

        /**
         * Get the user's username (convenience method)
         */
        public String getUsername() {
            return user != null ? user.getUsername() : null;
        }

        /**
         * Check if this favorite belongs to a specific user
         */
        public boolean belongsTo(User user) {
            return this.user != null && this.user.getId().equals(user.getId());
        }

        /**
         * Check if this favorite belongs to a specific user (by ID)
         */
        public boolean belongsTo(Long userId) {
            return this.user != null && this.user.getId().equals(userId);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Favorite)) return false;
            Favorite that = (Favorite) o;
            return user != null && user.equals(that.user) &&
                    library != null && library.equals(that.library);
        }

        @Override
        public int hashCode() {
            return getClass().hashCode();
        }
    }
