package com.project.library_comparison_tool.dto;

import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.LibraryDependency;
import com.project.library_comparison_tool.entity.Vulnerability;
import com.project.library_comparison_tool.service.ComparisonService;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryDTO {
    private Long id;
    private String name;
    private String description;

    private String categories; // Comma-separated list of categories

    private String framework;
    private String runtimeEnvironment;
    private String language;
    private String packageManager;

    private String licenseType;
    private String cost;

    private String latestVersion;
    private String lastRegistryReleaseDate; // From package registry

    // metrics for comparision
    private Integer githubStars;
    private Integer githubForks;
    private Integer dependentProjectsCount;
    private LocalDate lastRepositoryReleaseDate; // From GitHub/GitLab repository
    private Boolean isDeprecated;
    private Boolean hasSecurityVulnerabilities;
    private Integer vulnerabilityCount; // Count of known vulnerabilities
    private List<VulnerabilityDTO> vulnerabilities; // Full vulnerability details

    private String homepageUrl;
    private String repositoryUrl;
    private String documentationUrl;
    private String packageUrl;

    private List<String> tags;
    private List<String> supportedOs;

    private String exampleCodeSnippet; // Code example showing how to use the library
    private String useCase; // Plain English description of when/why to use this library

    private List<String> dependencyNames;
    private Integer dependencyCount;

    // Comparison scores (from ComparisonService)
    private Double popularityScore;
    private Double maintenanceScore;
    private Double securityScore;
    private Double communityScore;
    private Double qualityScore;
    private Double overallScore;
    
    // quality grade(A,B,C)
    private String qualityGrade;

    // maintained actively this library or not
    private Boolean activelyMaintained;
    
    // Vulnerability severity score (weighted)
    private Integer vulnerabilitySeverityScore;

    //formatting the display
    private String popularityDisplay;


    // Overloaded method for backward compatibility (uses deprecated methods)
    public static LibraryDTO fromEntity(Library library) {
        return fromEntity(library, null);
    }
    
    // Main method with ComparisonService
    public static LibraryDTO fromEntity(Library library, ComparisonService comparisonService) {
        if (library == null) {
            return null;
        }
        
        // Calculate comparison scores using unified ComparisonService if available
        ComparisonService.ComparisonResult comparison = null;
        if (comparisonService != null) {
            comparison = comparisonService.calculateComparison(library);
        }

        // Extract dependency information
        List<String> depNames = null;
        Integer depCount = 0;

        if (library.getDependencies() != null && !library.getDependencies().isEmpty()) {
            depNames = library.getDependencies().stream()
                    .map(LibraryDependency::getDependencyName)
                    .collect(Collectors.toList());
            depCount = depNames.size();
        }

        // Build DTO
        return LibraryDTO.builder()

                .id(library.getId())
                .name(library.getName())
                .categories(library.getCategories())
                .description(library.getDescription())


                .framework(library.getFramework())
                .runtimeEnvironment(library.getRuntimeEnvironment())
                .language(library.getLanguage())
                .packageManager(library.getPackageManager())


                .licenseType(library.getLicenseType())
                .cost(library.getCost())


                .latestVersion(library.getLatestVersion())
                .lastRegistryReleaseDate(library.getLastRegistryReleaseDate())

                // Popularity metrics
                .githubStars(library.getGithubStars())
                .githubForks(library.getGithubForks())
                .dependentProjectsCount(library.getDependentProjectsCount())
                .lastRepositoryReleaseDate(library.getLastRepositoryReleaseDate())
                .isDeprecated(library.getIsDeprecated())
                .hasSecurityVulnerabilities(library.getHasSecurityVulnerabilities())
                .vulnerabilityCount(library.getVulnerabilityCount())
                .vulnerabilities(library.getVulnerabilities() != null ?
                        library.getVulnerabilities().stream()
                                .map(VulnerabilityDTO::fromEntity)
                                .collect(Collectors.toList()) : null)

                .homepageUrl(library.getHomepageUrl())
                .repositoryUrl(library.getRepositoryUrl())
                .documentationUrl(library.getDocumentationUrl())
                .packageUrl(library.getPackageUrl())


                .tags(library.getTags())
                .supportedOs(library.getSupportedOs())

                .exampleCodeSnippet(library.getExampleCodeSnippet())
                .useCase(library.getUseCase())

                .dependencyNames(depNames)
                .dependencyCount(depCount)


                // Comparison scores from unified ComparisonService (if available)
                .popularityScore(comparison != null ? comparison.getPopularityScore() : null)
                .maintenanceScore(comparison != null ? comparison.getMaintenanceScore() : null)
                .securityScore(comparison != null ? comparison.getSecurityScore() : null)
                .communityScore(comparison != null ? comparison.getCommunityScore() : null)
                .qualityScore(comparison != null ? comparison.getQualityScore() : null)
                .overallScore(comparison != null ? comparison.getOverallScore() : null)
                .qualityGrade(comparison != null ? comparison.getQualityGrade() : library.getQualityGrade())
                .activelyMaintained(comparison != null ? comparison.isActivelyMaintained() : library.isActivelyMaintained())
                .vulnerabilitySeverityScore(comparison != null ? comparison.getVulnerabilitySeverityScore() : null)
                .popularityDisplay(formatPopularity(library.getGithubStars()))

                .build();
    }

    // List<LibraryDTO> - > DTO
    // Overloaded method for backward compatibility
    public static List<LibraryDTO> fromEntities(List<Library> libraries) {
        return fromEntities(libraries, null);
    }
    
    // Main method with ComparisonService
    public static List<LibraryDTO> fromEntities(List<Library> libraries, ComparisonService comparisonService) {
        if (libraries == null) {
            return null;
        }

        return libraries.stream()
                .map(lib -> LibraryDTO.fromEntity(lib, comparisonService))
                .collect(Collectors.toList());
    }


    // display formatter popularity
    private static String formatPopularity(Integer stars) {
        if (stars == null) {
            return null;
        }

        if (stars >= 1_000_000) {
            return String.format("%.1fM stars", stars / 1_000_000.0);
        } else if (stars >= 1_000) {
            return String.format("%.1fK stars", stars / 1_000.0);
        } else {
            return stars + " stars";
        }
    }

}