package com.project.library_comparison_tool.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "library")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Library {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "library_seq")
    @SequenceGenerator(
            name = "library_seq",
            sequenceName = "library_seq",
            allocationSize = 1
    )
    private Long id;


    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String categories; // Comma-separated list of categories (multi-category support)

    @Column(length = 1000)
    private String description;


    private String framework;
    private String runtimeEnvironment;
    private String language;
    private String packageManager;


    private String licenseType;
    private String cost;


    private String latestVersion;
    private String lastRegistryReleaseDate; // From package registry (npm, pypi, maven, etc.)


    //metrics
    private Integer githubStars;
    private Integer githubForks;


    private Integer dependentProjectsCount;


    private LocalDate lastRepositoryReleaseDate; // From GitHub/GitLab repository


    @Column(columnDefinition = "boolean default false")
    private Boolean isDeprecated;


    @Column(columnDefinition = "boolean default false")
    private Boolean hasSecurityVulnerabilities;

    @Column
    private Integer vulnerabilityCount; // Count of known vulnerabilities

    @OneToMany(
            mappedBy = "library",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Vulnerability> vulnerabilities = new ArrayList<>();

    private String homepageUrl;              // Official website
    private String repositoryUrl;            // GitHub/GitLab repo
    private String documentationUrl;         // Docs site
    private String packageUrl;               // Maven Central, npm registry, etc.


    @ElementCollection
    @CollectionTable(
            name = "library_tags",
            joinColumns = @JoinColumn(name = "library_id")
    )
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "library_supported_os",
            joinColumns = @JoinColumn(name = "library_id")
    )
    @Column(name = "os_name")
    @Builder.Default
    private List<String> supportedOs = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String exampleCodeSnippet; // Code example showing how to use the library

    @Column(length = 2000)
    private String useCase; // Plain English description of when/why to use this library (for non-technical users)

    // entity relationships
    @OneToMany(
            mappedBy = "library",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<LibraryDependency> dependencies = new ArrayList<>();

    // Helper methods for managing vulnerabilities
    public void addVulnerability(Vulnerability vulnerability) {
        vulnerabilities.add(vulnerability);
        vulnerability.setLibrary(this);
        updateVulnerabilityCount();
    }

    public void removeVulnerability(Vulnerability vulnerability) {
        vulnerabilities.remove(vulnerability);
        vulnerability.setLibrary(null);
        updateVulnerabilityCount();
    }

    public void clearVulnerabilities() {
        vulnerabilities.clear();
        updateVulnerabilityCount();
    }

    private void updateVulnerabilityCount() {
        this.vulnerabilityCount = vulnerabilities != null ? vulnerabilities.size() : 0;
        this.hasSecurityVulnerabilities = vulnerabilityCount != null && vulnerabilityCount > 0;
    }

    // Helper methods for managing dependencies
    public void addDependency(LibraryDependency dependency) {
        dependencies.add(dependency);
        dependency.setLibrary(this);
    }

    public void removeDependency(LibraryDependency dependency) {
        dependencies.remove(dependency);
        dependency.setLibrary(null);
    }

    // All scoring logic has been moved to ComparisonService

    @Deprecated
    public double getPopularityScore() {
        // Legacy method - kept for backward compatibility
        // Returns default value - use ComparisonService for accurate score
        return 0.0;
    }
    
    @Deprecated
    public boolean isActivelyMaintained() {
        // Legacy method - kept for backward compatibility
        if (lastRepositoryReleaseDate == null) {
            return false;
        }
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        return lastRepositoryReleaseDate.isAfter(sixMonthsAgo);
    }

    @Deprecated
    public String getQualityGrade() {
        // Legacy method - kept for backward compatibility
        // Returns default grade - use ComparisonService for accurate grade
        return "C";
    }
}