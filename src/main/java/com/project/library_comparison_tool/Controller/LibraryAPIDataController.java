package com.project.library_comparison_tool.Controller;
import com.project.library_comparison_tool.service.LibrariesIoDataLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/data")

/** This method is to load data from libraries.io
   * for this i have created a controller
 */
public class LibraryAPIDataController {

        private final LibrariesIoDataLoader dataLoader ;

        public LibraryAPIDataController(LibrariesIoDataLoader dataLoader) {
            this.dataLoader = dataLoader;
        }

        /**
         * This method is for loading the data
         * doc link check : https://libraries.io/api
         * 
         * Examples:
         * - Load 1 library: POST /api/admin/data/load?query=react&platform=NPM&pages=1&limit=1
         * - Load all from 1 page: POST /api/admin/data/load?query=react&platform=NPM&pages=1
         * - Load 5 libraries: POST /api/admin/data/load?query=react&platform=NPM&pages=1&limit=5
         * 
         * @param query Search term (e.g., "react", "lodash")
         * @param platform Platform (e.g., "NPM", "Maven", "PyPI")
         * @param pages Number of pages to fetch (default: 1)
         * @param limit Maximum number of libraries to load (default: unlimited, use -1 for unlimited)
         */
        @PostMapping("/load")
        public ResponseEntity<Map<String, Object>> loadLibraries(
                @RequestParam String query,
                @RequestParam String platform,
                @RequestParam(defaultValue = "1") int pages,
                @RequestParam(defaultValue = "-1") int limit) {

            int count = dataLoader.loadLibraries(query, platform, pages, limit);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", query);
            response.put("platform", platform);
            response.put("pagesLoaded", pages);
            response.put("limit", limit == -1 ? "unlimited" : limit);
            response.put("librariesLoaded", count);

            return ResponseEntity.ok(response);
        }

        /**
         * Load a single specific library by name and platform
         * Useful for step-by-step testing of individual libraries
         * 
         * Example: POST /api/admin/data/load-one?name=react&platform=NPM
         * 
         * @param name Exact library name (e.g., "react", "lodash", "com.fasterxml.jackson.core:jackson-databind")
         * @param platform Platform (e.g., "NPM", "Maven", "PyPI")
         */
        @PostMapping("/load-one")
        public ResponseEntity<Map<String, Object>> loadSingleLibrary(
                @RequestParam String name,
                @RequestParam String platform) {

            int count = dataLoader.loadSingleLibrary(name, platform);

            Map<String, Object> response = new HashMap<>();
            response.put("success", count > 0);
            response.put("libraryName", name);
            response.put("platform", platform);
            response.put("librariesLoaded", count);
            response.put("message", count > 0 ? "Library loaded successfully" : "Library not found or failed to load");

            return ResponseEntity.ok(response);
        }

        /**
         * Load popular libraries
         * POST /api/admin/data/load-popular
         */
        @PostMapping("/load-popular")
        public ResponseEntity<Map<String, Object>> loadPopularLibraries() {

            int count = dataLoader.loadPopularLibraries();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("librariesLoaded", count);
            response.put("message", "Loaded popular libraries across multiple platforms");

            return ResponseEntity.ok(response);
        }
    }
