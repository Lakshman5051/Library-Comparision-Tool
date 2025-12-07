package com.project.library_comparison_tool.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.LibraryDependency;
import com.project.library_comparison_tool.service.CategoryService;
import com.project.library_comparison_tool.service.FrameworkService;
import com.project.library_comparison_tool.service.RuntimeEnvironmentService;
import com.project.library_comparison_tool.service.OperatingSystemService;
import com.project.library_comparison_tool.service.UseCaseService;
import com.project.library_comparison_tool.service.LicenseService;
import com.project.library_comparison_tool.service.DeprecationService;
import com.project.library_comparison_tool.service.SecurityVulnerabilityService;
import com.project.library_comparison_tool.service.DocumentationService;
import com.project.library_comparison_tool.service.ExampleCodeService;
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
    private final FrameworkService frameworkService;
    private final RuntimeEnvironmentService runtimeEnvironmentService;
    private final OperatingSystemService operatingSystemService;
    private final UseCaseService useCaseService;
    private final LicenseService licenseService;
    private final DeprecationService deprecationService;
    private final SecurityVulnerabilityService securityVulnerabilityService;
    private final DocumentationService documentationService;
    private final ExampleCodeService exampleCodeService;

    public LibraryIOMapperDTO(
            CategoryService categoryService,
            FrameworkService frameworkService,
            RuntimeEnvironmentService runtimeEnvironmentService,
            OperatingSystemService operatingSystemService,
            UseCaseService useCaseService,
            LicenseService licenseService,
            DeprecationService deprecationService,
            SecurityVulnerabilityService securityVulnerabilityService,
            DocumentationService documentationService,
            ExampleCodeService exampleCodeService) {
        this.categoryService = categoryService;
        this.frameworkService = frameworkService;
        this.runtimeEnvironmentService = runtimeEnvironmentService;
        this.operatingSystemService = operatingSystemService;
        this.useCaseService = useCaseService;
        this.licenseService = licenseService;
        this.deprecationService = deprecationService;
        this.securityVulnerabilityService = securityVulnerabilityService;
        this.documentationService = documentationService;
        this.exampleCodeService = exampleCodeService;
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

        // Parse last registry release date (from package registry)
        String publishedAt = getTextOrNull(apiResponse, "latest_stable_release_published_at");
        if (publishedAt != null) {
            library.setLastRegistryReleaseDate(publishedAt.substring(0, 10));
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

        // Cost model (based on license) - using LicenseService
        String license = library.getLicenseType();
        library.setCost(licenseService.determineCost(license));

        // Status flags
        // Check deprecation status using DeprecationService
        List<String> keywords = extractKeywordsFromJson(apiResponse);
        boolean isDeprecated = deprecationService.checkDeprecation(
                library.getPackageManager(),
                library.getName(),
                library.getDescription(),
                keywords
        );
        library.setIsDeprecated(isDeprecated);
        
        // Security vulnerabilities will be checked during enrichment
        // Set default values for now
        library.setHasSecurityVulnerabilities(false);
        library.setVulnerabilityCount(0);

        // Determine framework based on language and name - using FrameworkService
        String inferredFramework = frameworkService.inferFramework(library.getName(), library.getLanguage());
        library.setFramework(inferredFramework);

        // Runtime environment based on language and framework - using RuntimeEnvironmentService
        library.setRuntimeEnvironment(runtimeEnvironmentService.inferRuntimeEnvironment(
                library.getLanguage(), 
                inferredFramework
        ));

        // Infer supported operating systems - using OperatingSystemService
        library.setSupportedOs(operatingSystemService.inferSupportedOs(
                library.getLanguage(),
                library.getPackageManager(),
                library.getName()
        ));


        //Infer categories using CategoryService (multi-category support)
        // Note: keywords already extracted above for deprecation check
        Set<CategoryService.Category> inferredCategories = categoryService.inferCategories(
                library.getName(),
                library.getDescription(),
                keywords,
                library.getLanguage(),
                library.getPackageManager()
        );

        // Set all categories as comma-separated string (no single primary category)
        String allCategories = inferredCategories.stream()
                .map(CategoryService.Category::getDisplayName)
                .sorted()
                .collect(Collectors.joining(", "));
        library.setCategories(allCategories);

        // Generate use case description (plain English for non-technical users) - using UseCaseService
        String useCase = useCaseService.generateUseCase(library.getName(), library.getDescription(), allCategories, library.getLanguage());
        library.setUseCase(useCase);

        System.out.println("    → Categories: " + allCategories);
        System.out.println("    → Use Case: " + useCase);

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

        // Get last repository release date (from GitHub/GitLab) for maintenance check
        String latestReleasePublished = getTextOrNull(detailedResponse, "latest_release_published_at");
        if (latestReleasePublished != null && latestReleasePublished.length() >= 10) {
            try {
                LocalDate releaseDate = LocalDate.parse(latestReleasePublished.substring(0, 10));
                library.setLastRepositoryReleaseDate(releaseDate);
                System.out.println("    → Set repository release date: " + releaseDate);
            } catch (Exception e) {
                System.err.println("    ✗ Error parsing repository release date: " + e.getMessage());
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

        // Infer documentation URL using DocumentationService
        String apiDocumentationUrl = getTextOrNull(detailedResponse, "documentation_url");
        String documentationUrl = documentationService.inferDocumentationUrl(library, apiDocumentationUrl);
        if (documentationUrl != null && !documentationUrl.isEmpty()) {
            library.setDocumentationUrl(documentationUrl);
            System.out.println("    → Set documentation URL: " + documentationUrl);
        }

        // Get sourcerank (libraries.io quality score)
        Integer sourcerank = getIntOrNull(detailedResponse, "rank");
        if (sourcerank != null) {
            // You could store this if you add a field to Library entity
            System.out.println("    → Sourcerank: " + sourcerank);
        }

        // Re-infer categories with detailed information (multi-category support)
        List<String> keywords = extractKeywordsFromJson(detailedResponse);
        Set<CategoryService.Category> inferredCategories = categoryService.inferCategories(
                library.getName(),
                library.getDescription(),
                keywords,
                library.getLanguage(),
                library.getPackageManager()
        );

        // Update all categories (comma-separated)
        String allCategories = inferredCategories.stream()
                .map(CategoryService.Category::getDisplayName)
                .sorted()
                .collect(Collectors.joining(", "));
        library.setCategories(allCategories);

        // Extract example code snippet from GitHub
        String exampleCode = exampleCodeService.extractExampleCode(library);
        if (exampleCode != null && !exampleCode.isEmpty()) {
            library.setExampleCodeSnippet(exampleCode);
        }

        // Extract usage description from README to enhance useCase
        String usageFromReadme = exampleCodeService.extractUsageDescription(library);
        
        // Update use case - prefer README usage, fallback to generated useCase
        if (usageFromReadme != null && !usageFromReadme.isEmpty()) {
            library.setUseCase(usageFromReadme);
            System.out.println("    → Enhanced use case from README.md");
        } else if (library.getUseCase() == null || library.getUseCase().isEmpty()) {
            String useCase = useCaseService.generateUseCase(library.getName(), library.getDescription(), allCategories, library.getLanguage());
            library.setUseCase(useCase);
        }

        // Re-infer OS (in case we have more info now) - using OperatingSystemService
        library.setSupportedOs(operatingSystemService.inferSupportedOs(
                library.getLanguage(),
                library.getPackageManager(),
                library.getName()
        ));

        // Re-check deprecation status with detailed information (may have more accurate data)
        // Only update if we haven't already detected deprecation (to avoid unnecessary API calls)
        if (!Boolean.TRUE.equals(library.getIsDeprecated())) {
            List<String> detailedKeywords = extractKeywordsFromJson(detailedResponse);
            boolean isDeprecated = deprecationService.checkDeprecation(
                    library.getPackageManager(),
                    library.getName(),
                    library.getDescription(),
                    detailedKeywords
            );
            if (isDeprecated) {
                library.setIsDeprecated(true);
                System.out.println("    → Deprecation detected during enrichment");
            }
        }

        // Check security vulnerabilities using SecurityVulnerabilityService
        // This will set hasSecurityVulnerabilities, vulnerabilityCount, and populate vulnerabilities list
        List<com.project.library_comparison_tool.entity.Vulnerability> vulnerabilities = 
                securityVulnerabilityService.checkAndStoreVulnerabilities(library);
        
        // Add vulnerabilities to library (they're already linked in the service)
        if (vulnerabilities != null && !vulnerabilities.isEmpty()) {
            library.getVulnerabilities().clear();
            library.getVulnerabilities().addAll(vulnerabilities);
            library.setVulnerabilityCount(vulnerabilities.size());
            library.setHasSecurityVulnerabilities(true);
            System.out.println("    → Security vulnerabilities detected: " + vulnerabilities.size());
        }

        return library;
    }

}