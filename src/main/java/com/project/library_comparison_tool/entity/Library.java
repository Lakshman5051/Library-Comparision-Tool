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

    private String category;

    @Column(length = 500)
    private String categories;

    @Column(length = 1000)
    private String description;


    private String framework;
    private String runtimeEnvironment;
    private String language;
    private String packageManager;



    private String supplier;
    private String licenseType;
    private String cost;


    private String latestVersion;
    private String lastUpdated;




    //metrics
    private Integer githubStars;

    private Long downloadsLast30Days;


    private Integer githubForks;


    private Integer dependentProjectsCount;


    private LocalDate lastCommitDate;


    @Column(columnDefinition = "boolean default false")
    private Boolean isDeprecated;


    @Column(columnDefinition = "boolean default false")
    private Boolean hasSecurityVulnerabilities;


    private String homepageUrl;              // Official website
    private String repositoryUrl;            // GitHub/GitLab repo
    private String documentationUrl;         // Docs site
    private String packageUrl;               // Maven Central, npm registry, etc.




    private String keywords;


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
    private String exampleCodeSnippet;

    // entity relationships
    @OneToMany(
            mappedBy = "library",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<LibraryDependency> dependencies = new ArrayList<>();

    // Helper methods for managing dependencies
    public void addDependency(LibraryDependency dependency) {
        dependencies.add(dependency);
        dependency.setLibrary(this);
    }

    public void removeDependency(LibraryDependency dependency) {
        dependencies.remove(dependency);
        dependency.setLibrary(null);
    }

    // combine different metrics to showcase in rank wise
    public double getPopularityScore() {
        double score = 0.0;

        if (githubStars != null) {
            score += githubStars * 0.1;
        }

        if (downloadsLast30Days != null) {
            score += downloadsLast30Days * 0.00001; // Scale down large numbers
        }

        if (dependentProjectsCount != null) {
            score += dependentProjectsCount * 0.5;
        }

        // Penalize deprecated or vulnerable libraries
        if (Boolean.TRUE.equals(isDeprecated)) {
            score *= 0.1;
        }

        if (Boolean.TRUE.equals(hasSecurityVulnerabilities)) {
            score *= 0.5;
        }

        return score;
    }

    // library status(actively maintained or not)
    public boolean isActivelyMaintained() {
        if (lastCommitDate == null) {
            return false;
        }

        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        return lastCommitDate.isAfter(sixMonthsAgo);
    }

    //quality indicator
    public String getQualityGrade() {
        double score = 0;
        int factors = 0;

        // Stars (out of 10)
        if (githubStars != null) {
            score += Math.min(githubStars / 1000.0, 10);
            factors++;
        }

        //Active maintenance (out of 10)
        if (isActivelyMaintained()) {
            score += 10;
        }
        factors++;

        // No security issues (out of 10)
        if (!Boolean.TRUE.equals(hasSecurityVulnerabilities)) {
            score += 10;
        }
        factors++;

        // Has dependents (out of 10)
        if (dependentProjectsCount != null && dependentProjectsCount > 0) {
            score += Math.min(dependentProjectsCount / 100.0, 10);
            factors++;
        }

        // Calculate average
        double avgScore = factors > 0 ? score / factors : 0;

        if (avgScore >= 9) return "A";
        if (avgScore >= 7) return "B";
        if (avgScore >= 5) return "C";
        if (avgScore >= 3) return "D";
        return "F";
    }
}