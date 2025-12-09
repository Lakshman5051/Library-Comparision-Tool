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

    // Link to Library
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id", nullable = false)
    private Library library;

    // When was this library added to the project?
    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    // Helper methods

    public String getLibraryName() {
        return library != null ? library.getName() : null;
    }


    public String getProjectName() {
        return project != null ? project.getName() : null;
    }


    public boolean belongsToProject(Long projectId) {
        return this.project != null && this.project.getId().equals(projectId);
    }


    public boolean isForLibrary(Long libraryId) {
        return this.library != null && this.library.getId().equals(libraryId);
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