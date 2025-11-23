package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // THE CRITICAL LINK: Which user owns this project?
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", nullable = false)
        private User user;  // ← This creates the ownership relationship!

        @Column(nullable = false, length = 200)
        private String name;

        @Column(length = 1000)
        private String description;

        // Project status
        @Enumerated(EnumType.STRING)
        @Column(length = 20)
        @Builder.Default
        private ProjectStatus status = ProjectStatus.PLANNING;

        // Is this project public (visible to others)?
        @Column(name = "is_public")
        @Builder.Default
        private Boolean isPublic = false;

        @CreationTimestamp
        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;

        @UpdateTimestamp
        @Column(name = "updated_at")
        private LocalDateTime updatedAt;

        // RELATIONSHIP: Project has many libraries (through join table)
        @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private Set<ProjectLibrary> projectLibraries = new HashSet<>();

        // HELPER METHODS

        /**
         * Add a library to this project
         */
        public void addLibrary(Library library, boolean isRequired) {
            ProjectLibrary projectLibrary = new ProjectLibrary();
            projectLibrary.setProject(this);
            projectLibrary.setLibrary(library);
            projectLibrary.setIsRequired(isRequired);
            projectLibrary.setAddedAt(LocalDateTime.now());
            projectLibraries.add(projectLibrary);
        }

        /**
         * Remove a library from this project
         */
        public void removeLibrary(Library library) {
            projectLibraries.removeIf(pl -> pl.getLibrary().equals(library));
        }

        /**
         * Check if project contains a specific library
         */
        public boolean containsLibrary(Library library) {
            return projectLibraries.stream()
                    .anyMatch(pl -> pl.getLibrary().equals(library));
        }

        /**
         * Get count of libraries in this project
         */
        public int getLibraryCount() {
            return projectLibraries.size();
        }

        /**
         * Check if user owns this project
         */
        public boolean isOwnedBy(User user) {
            return this.user != null && this.user.getId().equals(user.getId());
        }

        /**
         * Check if user owns this project (by ID)
         */
        public boolean isOwnedBy(Long userId) {
            return this.user != null && this.user.getId().equals(userId);
        }
    }

    /**
     * Project Status Enum
     */
    enum ProjectStatus {
        PLANNING,    // Just planning, haven't started
        ACTIVE,      // Currently working on it
        COMPLETED,   // Project is done
        ON_HOLD,     // Temporarily paused
        CANCELLED    // Project cancelled
    }

