package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // Owner of the project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Project details
    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    // Project status (lifecycle)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PLANNING;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationship: Project has many libraries (via ProjectLibrary join table)
    @OneToMany(
            mappedBy = "project",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<ProjectLibrary> projectLibraries = new ArrayList<>();

    // Helper methods

    public boolean belongsTo(User user) {
        return this.user != null && this.user.getId().equals(user.getId());
    }


    public boolean belongsTo(Long userId) {
        return this.user != null && this.user.getId().equals(userId);
    }


    public void addLibrary(ProjectLibrary projectLibrary) {
        projectLibraries.add(projectLibrary);
        projectLibrary.setProject(this);
    }


    public void removeLibrary(ProjectLibrary projectLibrary) {
        projectLibraries.remove(projectLibrary);
        projectLibrary.setProject(null);
    }


    public int getLibraryCount() {
        return projectLibraries != null ? projectLibraries.size() : 0;
    }


    public String getOwnerUsername() {
        return user != null ? user.getUsername() : null;
    }

    
    public String getOwnerEmail() {
        return user != null ? user.getEmail() : null;
    }
}