package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_libraries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "library_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectLibrary {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // Link to Project
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "project_id", nullable = false)
        private Project project;

        // Link to Library (YOUR EXISTING LIBRARY ENTITY!)
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "library_id", nullable = false)
        private Library library;

        // METADATA about this relationship

        // Is this library required or optional for the project?
        @Column(name = "is_required")
        @Builder.Default
        private Boolean isRequired = true;

        // When was this library added to the project?
        @CreationTimestamp
        @Column(name = "added_at", nullable = false, updatable = false)
        private LocalDateTime addedAt;

        // Optional: User's notes about this library in this project
        @Column(length = 500)
        private String notes;

        // Optional: Which phase of project is this for?
        @Column(length = 50)
        private String phase; // e.g., "development", "production", "testing"

        // HELPER METHODS

        /**
         * Get the library name (convenience method)
         */
        public String getLibraryName() {
            return library != null ? library.getName() : null;
        }

        /**
         * Get the project name (convenience method)
         */
        public String getProjectName() {
            return project != null ? project.getName() : null;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ProjectLibrary)) return false;
            ProjectLibrary that = (ProjectLibrary) o;
            return project != null && project.equals(that.project) &&
                    library != null && library.equals(that.library);
        }

        @Override
        public int hashCode() {
            return getClass().hashCode();
        }
    }
