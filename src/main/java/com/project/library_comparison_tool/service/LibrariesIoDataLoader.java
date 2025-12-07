package com.project.library_comparison_tool.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.dto.LibraryIOMapperDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LibrariesIoDataLoader {
    private final LibrariesIoApiService apiService;
    private final LibraryIOMapperDTO mapper;
    private final LibraryService libraryService;

    public LibrariesIoDataLoader(LibrariesIoApiService apiService,
                                 LibraryIOMapperDTO mapper,
                                 LibraryService libraryService) {
        this.apiService = apiService;
        this.mapper = mapper;
        this.libraryService = libraryService;
    }

    /**
     * Load libraries for a specific query and platform (WITH DETAILED INFO)
     * @param query Search term (like - "json", "logging")
     * @param platform Platform (like - "Maven", "NPM")
     * @param maxPages How many pages to fetch (each page = ~30 results)
     * @param limit Maximum number of libraries to load (-1 for unlimited)
     * @return Number of libraries loaded
     */
    public int loadLibraries(String query, String platform, int maxPages, int limit) {
        int totalLoaded = 0;
        boolean limitReached = false;

        System.out.println("═══════════════════════════════════");
        System.out.println("🚀 LOADING LIBRARIES FROM LIBRARIES.IO");
        System.out.println("═══════════════════════════════════");
        System.out.println("Query: " + query);
        System.out.println("Platform: " + platform);
        System.out.println("Pages: " + maxPages);
        System.out.println("Limit: " + (limit == -1 ? "Unlimited" : limit + " libraries"));
        System.out.println("═══════════════════════════════════\n");

        for (int page = 1; page <= maxPages && !limitReached; page++) {
            System.out.println("\n📄 Fetching page " + page + "...");

            // STEP 1: Fetch search results
            List<JsonNode> apiResults = apiService.searchLibraries(query, platform, page);

            if (apiResults.isEmpty()) {
                System.out.println("No more results. Stopping.");
                break;
            }

            System.out.println("Found " + apiResults.size() + " libraries in search results");

            // STEP 2: Process each library
            for (JsonNode apiResult : apiResults) {
                // Check if limit reached
                if (limit != -1 && totalLoaded >= limit) {
                    System.out.println("\n⏹️  Limit reached (" + limit + " libraries). Stopping.");
                    limitReached = true;
                    break;
                }
                try {
                    // Map basic info from search result
                    Library library = mapper.mapToLibrary(apiResult, query);

                    if (library != null && library.getName() != null) {
                        String libraryPlatform = library.getPackageManager();
                        String libraryName = library.getName();

                        System.out.println("\n  📦 Processing: " + libraryName + " (" + libraryPlatform + ")");

                        // STEP 3: Fetch detailed information (has dependent_repos_count!)
                        try {
                            JsonNode detailedInfo = apiService.getLibraryDetails(libraryPlatform, libraryName);

                            if (detailedInfo != null) {
                                // Enrich with detailed data
                                library = mapper.enrichWithDetailedInfo(library, detailedInfo);
                                
                                // Log key fields for verification
                                System.out.println("  ✓ Details fetched:");
                                System.out.println("     - Categories: " + (library.getCategories() != null ? library.getCategories() : "N/A"));
                                System.out.println("     - Framework: " + (library.getFramework() != null ? library.getFramework() : "N/A"));
                                System.out.println("     - Runtime: " + (library.getRuntimeEnvironment() != null ? library.getRuntimeEnvironment() : "N/A"));
                                System.out.println("     - Stars: " + (library.getGithubStars() != null ? library.getGithubStars() : "N/A"));
                                System.out.println("     - Forks: " + (library.getGithubForks() != null ? library.getGithubForks() : "N/A"));
                                System.out.println("     - Dependents: " + (library.getDependentProjectsCount() != null ? library.getDependentProjectsCount() : "N/A"));
                                System.out.println("     - Deprecated: " + (library.getIsDeprecated() != null ? library.getIsDeprecated() : "N/A"));
                                System.out.println("     - Has Vulnerabilities: " + (library.getHasSecurityVulnerabilities() != null ? library.getHasSecurityVulnerabilities() : "N/A"));
                                System.out.println("     - Vulnerability Count: " + (library.getVulnerabilities() != null ? library.getVulnerabilities().size() : 0));
                                System.out.println("     - Documentation URL: " + (library.getDocumentationUrl() != null && !library.getDocumentationUrl().isEmpty() ? "✓" : "✗"));
                                System.out.println("     - Example Code: " + (library.getExampleCodeSnippet() != null && !library.getExampleCodeSnippet().isEmpty() ? "✓" : "✗"));
                                System.out.println("     - Use Case: " + (library.getUseCase() != null && !library.getUseCase().isEmpty() ? "✓" : "✗"));
                            } else {
                                System.out.println("  ⚠ Loaded without details: " + libraryName);
                            }

                            // Small delay to respect rate limits (100ms = 600 requests/minute, well under 60/min limit)
                            Thread.sleep(100);

                        } catch (Exception detailError) {
                            System.err.println("  ⚠ Error fetching details (continuing anyway): " + detailError.getMessage());
                        }

                        // STEP 4: Save to database
                        Library saved = libraryService.addOrUpdateLibrary(library);
                        System.out.println("  💾 Saved to database (ID: " + saved.getId() + ")");
                        totalLoaded++;
                    }

                } catch (Exception e) {
                    System.err.println("  ✗ Error loading library: " + e.getMessage());
                }
            }

            // Rate limiting between pages - wait 1 second
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        System.out.println("\n═══════════════════════════════════");
        System.out.println("✅ LOADING COMPLETE!");
        System.out.println("═══════════════════════════════════");
        System.out.println("Total libraries loaded: " + totalLoaded);
        System.out.println("\n💡 Verification Tips:");
        System.out.println("   1. Check console logs above for each library's data");
        System.out.println("   2. Query database: SELECT * FROM library WHERE name LIKE '%react%'");
        System.out.println("   3. Use API: GET http://localhost:8080/api/libraries/search?name=react");
        System.out.println("   4. Check frontend: http://localhost:3000");
        System.out.println("═══════════════════════════════════\n");

        return totalLoaded;
    }
    /**
     * Load a single specific library by name and platform
     * Useful for step-by-step testing
     * 
     * @param libraryName Exact library name (e.g., "react", "lodash", "com.fasterxml.jackson.core:jackson-databind")
     * @param platform Platform (e.g., "NPM", "Maven", "PyPI")
     * @return Number of libraries loaded (0 or 1)
     */
    public int loadSingleLibrary(String libraryName, String platform) {
        System.out.println("═══════════════════════════════════");
        System.out.println("🎯 LOADING SINGLE LIBRARY");
        System.out.println("═══════════════════════════════════");
        System.out.println("Library Name: " + libraryName);
        System.out.println("Platform: " + platform);
        System.out.println("═══════════════════════════════════\n");

        try {
            // Fetch detailed information directly
            JsonNode detailedInfo = apiService.getLibraryDetails(platform, libraryName);

            if (detailedInfo == null) {
                System.err.println("❌ Library not found: " + libraryName + " (" + platform + ")");
                return 0;
            }

            // Map to Library entity
            Library library = mapper.mapToLibrary(detailedInfo, libraryName);

            if (library == null || library.getName() == null) {
                System.err.println("❌ Failed to map library data");
                return 0;
            }

            System.out.println("\n  📦 Processing: " + library.getName() + " (" + library.getPackageManager() + ")");

            // Enrich with detailed data (this will also fetch vulnerabilities, documentation, examples, etc.)
            library = mapper.enrichWithDetailedInfo(library, detailedInfo);

            // Log key fields for verification
            System.out.println("  ✓ Details fetched:");
            System.out.println("     - Categories: " + (library.getCategories() != null ? library.getCategories() : "N/A"));
            System.out.println("     - Framework: " + (library.getFramework() != null ? library.getFramework() : "N/A"));
            System.out.println("     - Runtime: " + (library.getRuntimeEnvironment() != null ? library.getRuntimeEnvironment() : "N/A"));
            System.out.println("     - Stars: " + (library.getGithubStars() != null ? library.getGithubStars() : "N/A"));
            System.out.println("     - Forks: " + (library.getGithubForks() != null ? library.getGithubForks() : "N/A"));
            System.out.println("     - Dependents: " + (library.getDependentProjectsCount() != null ? library.getDependentProjectsCount() : "N/A"));
            System.out.println("     - Deprecated: " + (library.getIsDeprecated() != null ? library.getIsDeprecated() : "N/A"));
            System.out.println("     - Has Vulnerabilities: " + (library.getHasSecurityVulnerabilities() != null ? library.getHasSecurityVulnerabilities() : "N/A"));
            System.out.println("     - Vulnerability Count: " + (library.getVulnerabilities() != null ? library.getVulnerabilities().size() : 0));
            System.out.println("     - Documentation URL: " + (library.getDocumentationUrl() != null && !library.getDocumentationUrl().isEmpty() ? "✓" : "✗"));
            System.out.println("     - Example Code: " + (library.getExampleCodeSnippet() != null && !library.getExampleCodeSnippet().isEmpty() ? "✓" : "✗"));
            System.out.println("     - Use Case: " + (library.getUseCase() != null && !library.getUseCase().isEmpty() ? "✓" : "✗"));

            // Save to database
            Library saved = libraryService.addOrUpdateLibrary(library);
            System.out.println("  💾 Saved to database (ID: " + saved.getId() + ")");

            System.out.println("\n═══════════════════════════════════");
            System.out.println("✅ SINGLE LIBRARY LOADED SUCCESSFULLY!");
            System.out.println("═══════════════════════════════════\n");

            return 1;

        } catch (Exception e) {
            System.err.println("❌ Error loading library: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    // Load popular libraries across multiple categories
    public int loadPopularLibraries() {
        int total = 0;
        int unlimited = -1; // No limit

        // Java libraries
        total += loadLibraries("json", "Maven", 2, unlimited);
        total += loadLibraries("logging", "Maven", 2, unlimited);
        total += loadLibraries("testing", "Maven", 2, unlimited);
        total += loadLibraries("web framework", "Maven", 2, unlimited);

        // JavaScript libraries
        total += loadLibraries("react", "NPM", 2, unlimited);
        total += loadLibraries("vue", "NPM", 1, unlimited);
        total += loadLibraries("express", "NPM", 1, unlimited);
        total += loadLibraries("testing", "NPM", 2, unlimited);

        return total;
    }
}