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
     * @return Number of libraries loaded
     */
    public int loadLibraries(String query, String platform, int maxPages) {
        int totalLoaded = 0;

        System.out.println("Loading libraries from libraries.io");
        System.out.println("Query: " + query);
        System.out.println("Platform: " + platform);
        System.out.println("Pages: " + maxPages);

        for (int page = 1; page <= maxPages; page++) {
            System.out.println("\nFetching page " + page + "...");

            // STEP 1: Fetch search results
            List<JsonNode> apiResults = apiService.searchLibraries(query, platform, page);

            if (apiResults.isEmpty()) {
                System.out.println("No more results. Stopping.");
                break;
            }

            // STEP 2: Process each library
            for (JsonNode apiResult : apiResults) {
                try {
                    // Map basic info from search result
                    Library library = mapper.mapToLibrary(apiResult, query);

                    if (library != null && library.getName() != null) {
                        String libraryPlatform = library.getPackageManager();
                        String libraryName = library.getName();

                        System.out.println("  Processing: " + libraryName);

                        // STEP 3: Fetch detailed information (has dependent_repos_count!)
                        try {
                            JsonNode detailedInfo = apiService.getLibraryDetails(libraryPlatform, libraryName);

                            if (detailedInfo != null) {
                                // Enrich with detailed data
                                library = mapper.enrichWithDetailedInfo(library, detailedInfo);
                                System.out.println("  ✓ Loaded with details: " + libraryName);
                            } else {
                                System.out.println("  ⚠ Loaded without details: " + libraryName);
                            }

                            // Small delay to respect rate limits (100ms = 600 requests/minute, well under 60/min limit)
                            Thread.sleep(100);

                        } catch (Exception detailError) {
                            System.err.println("  ⚠ Error fetching details (continuing anyway): " + detailError.getMessage());
                        }

                        // STEP 4: Save to database
                        libraryService.addOrUpdateLibrary(library);
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
        System.out.println("Loading complete!");
        System.out.println("Total libraries loaded: " + totalLoaded);
        System.out.println("═══════════════════════════════════\n");

        return totalLoaded;
    }
    // Load popular libraries across multiple categories
    public int loadPopularLibraries() {
        int total = 0;

        // Java libraries
        total += loadLibraries("json", "Maven", 2);
        total += loadLibraries("logging", "Maven", 2);
        total += loadLibraries("testing", "Maven", 2);
        total += loadLibraries("web framework", "Maven", 2);

        // JavaScript libraries
        total += loadLibraries("react", "NPM", 2);
        total += loadLibraries("vue", "NPM", 1);
        total += loadLibraries("express", "NPM", 1);
        total += loadLibraries("testing", "NPM", 2);

        return total;
    }
}