package com.project.library_comparison_tool.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.LibraryDependency;
import com.project.library_comparison_tool.service.CategoryService;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class LibraryIOMapperDTO {

    private final CategoryService categoryService;

    public LibraryIOMapperDTO(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    //Convert libraries.io API response to Library entity
    public Library mapToLibrary(JsonNode apiResponse, String searchQuery) {
        if (apiResponse == null) {
            return null;
        }

        Library library = new Library();

        library.setName(getTextOrNull(apiResponse, "name"));
        library.setDescription(getTextOrNull(apiResponse, "description"));

        String platform = getTextOrNull(apiResponse, "platform");
        library.setPackageManager(platform); // "Maven", "NPM", etc.
        library.setLanguage(getTextOrNull(apiResponse, "language"));

        library.setLatestVersion(getTextOrNull(apiResponse, "latest_stable_release_number"));

        // Parse last updated date
        String publishedAt = getTextOrNull(apiResponse, "latest_stable_release_published_at");
        if (publishedAt != null) {
            library.setLastUpdated(publishedAt.substring(0, 10));
        }

        // URLs
        library.setHomepageUrl(getTextOrNull(apiResponse, "homepage"));
        library.setRepositoryUrl(getTextOrNull(apiResponse, "repository_url"));
        library.setPackageUrl(getTextOrNull(apiResponse, "package_manager_url"));

        // Popularity metrics
        library.setGithubStars(getIntOrNull(apiResponse, "stars"));
        library.setGithubForks(getIntOrNull(apiResponse, "forks"));
        library.setDependentProjectsCount(getIntOrNull(apiResponse, "dependent_repos_count"));

        // License
        JsonNode licenses = apiResponse.get("normalized_licenses");
        if (licenses != null && licenses.isArray() && licenses.size() > 0) {
            library.setLicenseType(licenses.get(0).asText());
        }

        // Cost model (based on license)
        String license = library.getLicenseType();
        if (license != null && isOpenSourceLicense(license)) {
            library.setCost("Free / Open Source");
        } else if (license == null) {
            library.setCost("Unknown");
        } else {
            library.setCost("Check License");
        }

        // Status flags
        library.setIsDeprecated(false);
        library.setHasSecurityVulnerabilities(false);

        // Determine framework based on language and name
        library.setFramework(inferFramework(library.getName(), library.getLanguage()));

        // Runtime environment based on language
        library.setRuntimeEnvironment(inferRuntimeEnvironment(library.getLanguage()));

        // Infer supported operating systems
        library.setSupportedOs(inferSupportedOs(
                library.getLanguage(),
                library.getPackageManager(),
                library.getName()
        ));


        //Infer categories using CategoryService
        List<String> keywords = extractKeywordsFromJson(apiResponse);
        Set<CategoryService.Category> inferredCategories = categoryService.inferCategories(
                library.getName(),
                library.getDescription(),
                keywords,
                library.getLanguage(),
                library.getPackageManager()
        );

        // Set primary category
        CategoryService.Category primaryCategory = categoryService.getPrimaryCategory(inferredCategories);
        library.setCategory(primaryCategory.getDisplayName());

        // Set all categories as comma-separated string
        String allCategories = inferredCategories.stream()
                .map(CategoryService.Category::getDisplayName)
                .sorted()
                .collect(Collectors.joining(", "));
        library.setCategories(allCategories);

        System.out.println("    → Categories: " + allCategories);

        return library;
    }

    //Map dependencies from API response
    public List<LibraryDependency> mapDependencies(JsonNode dependenciesResponse, Library library) {
        List<LibraryDependency> dependencies = new ArrayList<>();

        if (dependenciesResponse == null || !dependenciesResponse.has("dependencies")) {
            return dependencies;
        }

        JsonNode depsArray = dependenciesResponse.get("dependencies");
        if (depsArray.isArray()) {
            depsArray.forEach(dep -> {
                LibraryDependency dependency = new LibraryDependency();
                dependency.setDependencyName(dep.get("name").asText());
                dependency.setLibrary(library);
                dependencies.add(dependency);
            });
        }

        return dependencies;
    }

    private String getTextOrNull(JsonNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        if (field != null && !field.isNull()) {
            return field.asText();
        }
        return null;
    }

    private Integer getIntOrNull(JsonNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        if (field != null && !field.isNull() && field.isNumber()) {
            return field.asInt();
        }
        return null;
    }

    private boolean isOpenSourceLicense(String license) {
        String lower = license.toLowerCase();
        return lower.contains("apache") ||
                lower.contains("mit") ||
                lower.contains("bsd") ||
                lower.contains("gpl") ||
                lower.contains("lgpl") ||
                lower.contains("mpl");
    }

    private String inferFramework(String name, String language) {
        if (name == null) return "none";

        String lower = name.toLowerCase();

        // Java frameworks
        if (lower.contains("spring")) return "spring";

        // JavaScript frameworks
        if (lower.contains("react")) return "react";
        if (lower.contains("vue")) return "vue";
        if (lower.contains("angular")) return "angular";
        if (lower.contains("express")) return "express";

        // Python frameworks
        if (lower.contains("django")) return "django";
        if (lower.contains("flask")) return "flask";

        return "none";
    }

    private String inferRuntimeEnvironment(String language) {
        if (language == null) return "unknown";

        String lower = language.toLowerCase();

        if (lower.contains("java")) return "jvm";
        if (lower.contains("javascript") || lower.contains("typescript")) return "browser";
        if (lower.contains("python")) return "python";
        if (lower.contains("c++") || lower.contains("c") || lower.contains("rust")) return "native";
        if (lower.contains("go")) return "native";
        if (lower.contains("c#") || lower.contains("f#")) return "dotnet";

        return "unknown";
    }

    /**
     * Extract keywords from libraries.io JSON response
     */
    private List<String> extractKeywordsFromJson(JsonNode apiResponse) {
        List<String> keywords = new ArrayList<>();

        JsonNode keywordsNode = apiResponse.get("keywords");
        if (keywordsNode != null && keywordsNode.isArray()) {
            keywordsNode.forEach(node -> keywords.add(node.asText()));
        }

        return keywords;
    }

    /**
     * Enrich library with detailed information from project details API
     * This gets data not available in search results like dependent_repos_count
     *
     * @param library Existing library object from search
     * @param detailedResponse JSON response from /api/{platform}/{name} endpoint
     * @return Enriched library object
     */
    public Library enrichWithDetailedInfo(Library library, JsonNode detailedResponse) {
        if (detailedResponse == null || library == null) {
            return library;
        }

        // Get dependent_repos_count (KEY FIELD - not in search results!)
        Integer dependents = getIntOrNull(detailedResponse, "dependent_repos_count");
        if (dependents != null && dependents > 0) {
            library.setDependentProjectsCount(dependents);
            System.out.println("    → Set dependents: " + dependents);
        }

        // Get last commit/release date for maintenance check
        String latestReleasePublished = getTextOrNull(detailedResponse, "latest_release_published_at");
        if (latestReleasePublished != null && latestReleasePublished.length() >= 10) {
            try {
                LocalDate releaseDate = LocalDate.parse(latestReleasePublished.substring(0, 10));
                library.setLastCommitDate(releaseDate);
                System.out.println("    → Set commit date: " + releaseDate);
            } catch (Exception e) {
                System.err.println("    ✗ Error parsing commit date: " + e.getMessage());
            }
        }

        // Update forks if not already set (more accurate in details)
        Integer forks = getIntOrNull(detailedResponse, "forks");
        if (forks != null && (library.getGithubForks() == null || library.getGithubForks() == 0)) {
            library.setGithubForks(forks);
        }

        // Update repository URL if more accurate
        String repoUrl = getTextOrNull(detailedResponse, "repository_url");
        if (repoUrl != null && !repoUrl.isEmpty()) {
            library.setRepositoryUrl(repoUrl);
        }

        // Get sourcerank (libraries.io quality score)
        Integer sourcerank = getIntOrNull(detailedResponse, "rank");
        if (sourcerank != null) {
            // You could store this if you add a field to Library entity
            System.out.println("    → Sourcerank: " + sourcerank);
        }

        // Re-infer categories with detailed information
        List<String> keywords = extractKeywordsFromJson(detailedResponse);
        Set<CategoryService.Category> inferredCategories = categoryService.inferCategories(
                library.getName(),
                library.getDescription(),
                keywords,
                library.getLanguage(),
                library.getPackageManager()
        );

        // Update primary category
        CategoryService.Category primaryCategory = categoryService.getPrimaryCategory(inferredCategories);
        library.setCategory(primaryCategory.getDisplayName());

        // Update all categories
        String allCategories = inferredCategories.stream()
                .map(CategoryService.Category::getDisplayName)
                .sorted()
                .collect(Collectors.joining(", "));
        library.setCategories(allCategories);

        // Re-infer OS (in case we have more info now)
        library.setSupportedOs(inferSupportedOs(
                library.getLanguage(),
                library.getPackageManager(),
                library.getName()
        ));

        return library;
    }

    /**
     * Infer supported operating systems based on platform and language
     * @param language Programming language
     * @param platform Package manager
     * @param name Library name
     * @return List of supported OS
     */
    private List<String> inferSupportedOs(String language, String platform, String name) {
        if (language == null && platform == null) {
            return List.of("Unknown");
        }

        String lowerName = name != null ? name.toLowerCase() : "";

        // Browser-based (platform-agnostic)
        if (language != null && language.equalsIgnoreCase("JavaScript")) {
            if (lowerName.contains("react") || lowerName.contains("vue") ||
                    lowerName.contains("angular") || lowerName.contains("svelte")) {
                return List.of("Browser (all OS)");
            }
        }

        // Platform-based inference
        if (platform != null) {
            switch (platform.toUpperCase()) {
                case "NPM":
                    return List.of("Linux", "macOS", "Windows");
                case "MAVEN":
                case "GRADLE":
                    return List.of("Linux", "macOS", "Windows", "Any OS with JVM");
                case "PYPI":
                    return List.of("Linux", "macOS", "Windows");
                case "NUGET":
                    return List.of("Windows", "Linux", "macOS");
                case "GO":
                    return List.of("Linux", "macOS", "Windows", "BSD");
                case "CARGO":
                    return List.of("Linux", "macOS", "Windows");
                case "RUBYGEMS":
                    return List.of("Linux", "macOS", "Windows");
                case "COCOAPODS":
                case "SWIFTPM":
                    return List.of("macOS", "iOS");
                case "PACKAGIST": // PHP
                    return List.of("Linux", "macOS", "Windows");
                case "HEX": // Elixir
                    return List.of("Linux", "macOS", "Windows");
                case "CRATES": // Rust (alternative name)
                    return List.of("Linux", "macOS", "Windows");
            }
        }

        // Language-based fallback
        if (language != null) {
            if (language.equalsIgnoreCase("Java") ||
                    language.equalsIgnoreCase("Kotlin") ||
                    language.equalsIgnoreCase("Scala")) {
                return List.of("Linux", "macOS", "Windows", "Any OS with JVM");
            }
        }

        return List.of("Platform-dependent");
    }
}