package com.project.library_comparison_tool.dto;

import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.LibraryDependency;
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
    private String category;
    private String description;

    private String categories;

    private String framework;
    private String runtimeEnvironment;
    private String language;
    private String packageManager;

    private String supplier;
    private String licenseType;
    private String cost;

    private String latestVersion;
    private String lastUpdated;

    // metrics for comparision
    private Integer githubStars;
    private Long downloadsLast30Days;
    private Integer githubForks;
    private Integer dependentProjectsCount;
    private LocalDate lastCommitDate;
    private Boolean isDeprecated;
    private Boolean hasSecurityVulnerabilities;

    private String homepageUrl;
    private String repositoryUrl;
    private String documentationUrl;
    private String packageUrl;


    private String keywords;
    private List<String> tags;
    private List<String> supportedOs;

    private String exampleCodeSnippet;


    private List<String> dependencyNames;
    private Integer dependencyCount;

    // popularity score ranking
    private Double popularityScore;

    // quality grade(A,B,C)
    private String qualityGrade;

    // maintained actively this library or not
    private Boolean activelyMaintained;

    //formatting the display
    private String popularityDisplay;

    // no. of downloads
    private String downloadsDisplay;


    public static LibraryDTO fromEntity(Library library) {
        if (library == null) {
            return null;
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
                .category(library.getCategory())
                .categories(library.getCategories())
                .description(library.getDescription())


                .framework(library.getFramework())
                .runtimeEnvironment(library.getRuntimeEnvironment())
                .language(library.getLanguage())
                .packageManager(library.getPackageManager())


                .supplier(library.getSupplier())
                .licenseType(library.getLicenseType())
                .cost(library.getCost())


                .latestVersion(library.getLatestVersion())
                .lastUpdated(library.getLastUpdated())

                // Popularity metrics
                .githubStars(library.getGithubStars())
                .downloadsLast30Days(library.getDownloadsLast30Days())
                .githubForks(library.getGithubForks())
                .dependentProjectsCount(library.getDependentProjectsCount())
                .lastCommitDate(library.getLastCommitDate())
                .isDeprecated(library.getIsDeprecated())
                .hasSecurityVulnerabilities(library.getHasSecurityVulnerabilities())


                .homepageUrl(library.getHomepageUrl())
                .repositoryUrl(library.getRepositoryUrl())
                .documentationUrl(library.getDocumentationUrl())
                .packageUrl(library.getPackageUrl())


                .keywords(library.getKeywords())
                .tags(library.getTags())
                .supportedOs(library.getSupportedOs())


                .exampleCodeSnippet(library.getExampleCodeSnippet())


                .dependencyNames(depNames)
                .dependencyCount(depCount)


                .popularityScore(library.getPopularityScore())
                .qualityGrade(library.getQualityGrade())
                .activelyMaintained(library.isActivelyMaintained())
                .popularityDisplay(formatPopularity(library.getGithubStars()))
                .downloadsDisplay(formatDownloads(library.getDownloadsLast30Days()))

                .build();
    }

    // List<LibraryDTO> - > DTO
    public static List<LibraryDTO> fromEntities(List<Library> libraries) {
        if (libraries == null) {
            return null;
        }

        return libraries.stream()
                .map(LibraryDTO::fromEntity)
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

    // display formatter donwloads
    private static String formatDownloads(Long downloads) {
        if (downloads == null) {
            return null;
        }

        if (downloads >= 1_000_000_000) {
            return String.format("%.1fB/month", downloads / 1_000_000_000.0);
        } else if (downloads >= 1_000_000) {
            return String.format("%.1fM/month", downloads / 1_000_000.0);
        } else if (downloads >= 1_000) {
            return String.format("%.1fK/month", downloads / 1_000.0);
        } else {
            return downloads + "/month";
        }
    }
}