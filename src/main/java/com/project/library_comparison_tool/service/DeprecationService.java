package com.project.library_comparison_tool.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Scanner;

/**
 * Service for detecting deprecation status of libraries
 * Uses multiple strategies: platform-specific APIs and text analysis
 */
@Service
public class DeprecationService {

    private static final String[] DEPRECATION_KEYWORDS = {
        "deprecated", "deprecation", "no longer maintained",
        "has reached EOL and is no longer actively maintained",  // Maven pattern
        "unmaintained", "archived", "use ", "instead",
        "migrate to", "replaced by", "superseded",
        "end of life", "EOL", "discontinued"
    };

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Main method to check deprecation status
     * Tries platform-specific APIs first, then falls back to text analysis
     *
     * @param packageManager Package manager (NPM, PyPI, Maven, etc.)
     * @param libraryName Library/package name
     * @param description Library description
     * @param tags Library tags/keywords
     * @return true if library is deprecated, false otherwise
     */
    public boolean checkDeprecation(String packageManager, String libraryName, 
                                    String description, List<String> tags) {
        if (packageManager == null || libraryName == null) {
            // Fall back to text analysis if no package manager info
            return analyzeTextForDeprecation(description, tags, libraryName);
        }

        String upperPackageManager = packageManager.toUpperCase();

        // Try platform-specific APIs first
        try {
            switch (upperPackageManager) {
                case "NPM":
                    Boolean npmResult = checkNpmDeprecation(libraryName);
                    if (npmResult != null) {
                        return npmResult;
                    }
                    break;
                case "PYPI":
                    Boolean pypiResult = checkPyPIDeprecation(libraryName);
                    if (pypiResult != null) {
                        return pypiResult;
                    }
                    break;
                case "NUGET":
                    Boolean nugetResult = checkNuGetDeprecation(libraryName);
                    if (nugetResult != null) {
                        return nugetResult;
                    }
                    break;
                case "CARGO":
                case "CRATES":
                    Boolean cargoResult = checkCargoDeprecation(libraryName);
                    if (cargoResult != null) {
                        return cargoResult;
                    }
                    break;
                case "RUBYGEMS":
                    Boolean rubygemsResult = checkRubyGemsDeprecation(libraryName);
                    if (rubygemsResult != null) {
                        return rubygemsResult;
                    }
                    break;
                case "MAVEN":
                case "GRADLE":

                    break;
            }
        } catch (Exception e) {
            // If API call fails, fall back to text analysis
            System.err.println("Error checking deprecation via API for " + libraryName + ": " + e.getMessage());
        }

        // Fall back to text analysis
        return analyzeTextForDeprecation(description, tags, libraryName);
    }

    /**
     * Check NPM package deprecation status via registry API
     * No API key required - public API
     *
     * @param packageName NPM package name
     * @return true if deprecated, false if not deprecated, null if check failed
     */
    public Boolean checkNpmDeprecation(String packageName) {
        try {
            String apiUrl = "https://registry.npmjs.org/" + packageName;
            String jsonResponse = fetchJsonFromUrl(apiUrl);

            if (jsonResponse == null || jsonResponse.isEmpty()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(jsonResponse);

            // Check top-level deprecated field
            if (root.has("deprecated") && !root.get("deprecated").isNull()) {
                String deprecatedMessage = root.get("deprecated").asText();
                if (deprecatedMessage != null && !deprecatedMessage.isEmpty()) {
                    System.out.println("    → NPM deprecation detected: " + deprecatedMessage);
                    return true;
                }
            }

            // Check latest version deprecated field
            if (root.has("versions")) {
                JsonNode versions = root.get("versions");
                if (versions.has("latest")) {
                    JsonNode latest = versions.get("latest");
                    if (latest.has("deprecated") && !latest.get("deprecated").isNull()) {
                        String deprecatedMessage = latest.get("deprecated").asText();
                        if (deprecatedMessage != null && !deprecatedMessage.isEmpty()) {
                            System.out.println("    → NPM version deprecation detected: " + deprecatedMessage);
                            return true;
                        }
                    }
                }
            }

            return false; // Package exists and is not deprecated
        } catch (Exception e) {
            System.err.println("    ✗ Error checking NPM deprecation for " + packageName + ": " + e.getMessage());
            return null; // Return null to indicate check failed
        }
    }

    /**
     * Check PyPI package deprecation status via JSON API
     * No API key required - public API
     *
     * @param packageName PyPI package name
     * @return true if deprecated, false if not deprecated, null if check failed
     */
    public Boolean checkPyPIDeprecation(String packageName) {
        try {
            String apiUrl = "https://pypi.org/pypi/" + packageName + "/json";
            String jsonResponse = fetchJsonFromUrl(apiUrl);

            if (jsonResponse == null || jsonResponse.isEmpty()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(jsonResponse);

            // Check info section
            if (root.has("info")) {
                JsonNode info = root.get("info");

                // Check project_urls for Status: Deprecated
                if (info.has("project_urls")) {
                    JsonNode projectUrls = info.get("project_urls");
                    if (projectUrls.isObject()) {
                        if (projectUrls.has("Status")) {
                            String status = projectUrls.get("Status").asText();
                            if (status != null && status.toLowerCase().contains("deprecated")) {
                                System.out.println("    → PyPI deprecation detected in project_urls");
                                return true;
                            }
                        }
                    }
                }

                // Check classifiers for deprecation indicators
                if (info.has("classifiers")) {
                    JsonNode classifiers = info.get("classifiers");
                    if (classifiers.isArray()) {
                        for (JsonNode classifier : classifiers) {
                            String classifierText = classifier.asText().toLowerCase();
                            if (classifierText.contains("deprecated") || 
                                classifierText.contains("inactive") ||
                                classifierText.contains("obsolete")) {
                                System.out.println("    → PyPI deprecation detected in classifiers: " + classifierText);
                                return true;
                            }
                        }
                    }
                }

                // Check description for deprecation keywords
                if (info.has("description")) {
                    String description = info.get("description").asText();
                    if (description != null && containsDeprecationKeywords(description)) {
                        System.out.println("    → PyPI deprecation detected in description");
                        return true;
                    }
                }
            }

            return false; // Package exists and no deprecation indicators found
        } catch (Exception e) {
            System.err.println("    ✗ Error checking PyPI deprecation for " + packageName + ": " + e.getMessage());
            return null; // Return null to indicate check failed
        }
    }

    /**
     * Check NuGet package deprecation status via V3 API
     * No API key required - public API
     *
     * @param packageName NuGet package name
     * @return true if deprecated, false if not deprecated, null if check failed
     */
    public Boolean checkNuGetDeprecation(String packageName) {
        try {
            // NuGet V3 API - get package metadata
            String apiUrl = "https://api.nuget.org/v3-flatcontainer/" + packageName.toLowerCase() + "/index.json";
            String jsonResponse = fetchJsonFromUrl(apiUrl);

            if (jsonResponse == null || jsonResponse.isEmpty()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(jsonResponse);

            // Check if package has versions
            if (root.has("versions") && root.get("versions").isArray()) {
                JsonNode versions = root.get("versions");
                if (versions.size() > 0) {
                    // Get latest version
                    String latestVersion = versions.get(versions.size() - 1).asText();
                    
                    // Check deprecation for latest version via catalog API
                    // Note: NuGet deprecation info is in the catalog, which requires more complex parsing
                    // For now, we'll rely on text analysis for NuGet
                    // Full implementation would require: https://api.nuget.org/v3/catalog0/index.json
                }
            }

            // NuGet V3 API doesn't directly expose deprecation in flatcontainer
            // Would need to check catalog API which is more complex
            // For now, return null to fall back to text analysis
            return null;
        } catch (Exception e) {
            System.err.println("    ✗ Error checking NuGet deprecation for " + packageName + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Check Cargo (Rust) package deprecation status via crates.io API
     * No API key required - public API
     *
     * @param packageName Cargo crate name
     * @return true if deprecated, false if not deprecated, null if check failed
     */
    public Boolean checkCargoDeprecation(String packageName) {
        try {
            String apiUrl = "https://crates.io/api/v1/crates/" + packageName;
            String jsonResponse = fetchJsonFromUrl(apiUrl);

            if (jsonResponse == null || jsonResponse.isEmpty()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(jsonResponse);

            // Check if crate exists
            if (root.has("crate")) {
                JsonNode crate = root.get("crate");
                
                // Check if all versions are yanked (indicates deprecation)
                if (root.has("versions") && root.get("versions").isArray()) {
                    JsonNode versions = root.get("versions");
                    boolean allYanked = true;
                    boolean anyYanked = false;
                    
                    for (JsonNode version : versions) {
                        if (version.has("yanked")) {
                            boolean yanked = version.get("yanked").asBoolean();
                            if (yanked) {
                                anyYanked = true;
                            } else {
                                allYanked = false;
                            }
                        } else {
                            allYanked = false;
                        }
                    }
                    
                    // If all versions are yanked, package is effectively deprecated
                    if (allYanked && versions.size() > 0) {
                        System.out.println("    → Cargo deprecation detected: all versions yanked");
                        return true;
                    }
                    
                    // If latest version is yanked, likely deprecated
                    if (versions.size() > 0 && versions.get(0).has("yanked")) {
                        boolean latestYanked = versions.get(0).get("yanked").asBoolean();
                        if (latestYanked) {
                            System.out.println("    → Cargo deprecation detected: latest version yanked");
                            return true;
                        }
                    }
                }
            }

            return false; // Package exists and versions are not yanked
        } catch (Exception e) {
            System.err.println("    ✗ Error checking Cargo deprecation for " + packageName + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Check RubyGems package deprecation status via API
     * No API key required - public API
     *
     * @param packageName RubyGems gem name
     * @return true if deprecated, false if not deprecated, null if check failed
     */
    public Boolean checkRubyGemsDeprecation(String packageName) {
        try {
            String apiUrl = "https://rubygems.org/api/v1/gems/" + packageName + ".json";
            String jsonResponse = fetchJsonFromUrl(apiUrl);

            if (jsonResponse == null || jsonResponse.isEmpty()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(jsonResponse);

            // RubyGems doesn't have explicit deprecation field
            // Check description for deprecation keywords
            if (root.has("info")) {
                String info = root.get("info").asText();
                if (info != null && containsDeprecationKeywords(info)) {
                    System.out.println("    → RubyGems deprecation detected in description");
                    return true;
                }
            }

            // Check homepage/description fields
            if (root.has("homepage_uri")) {
                String homepage = root.get("homepage_uri").asText();
                // Could check homepage, but that's less reliable
            }

            // RubyGems relies on text analysis - return null to use fallback
            return null;
        } catch (Exception e) {
            System.err.println("    ✗ Error checking RubyGems deprecation for " + packageName + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Analyze text for deprecation indicators
     * Fallback method that works for all package managers
     *
     * @param description Library description
     * @param tags Library tags/keywords
     * @param name Library name (for context)
     * @return true if deprecation indicators found, false otherwise
     */
    public boolean analyzeTextForDeprecation(String description, List<String> tags, String name) {
        // Check description
        if (description != null && !description.isEmpty()) {
            if (containsDeprecationKeywords(description)) {
                return true;
            }
        }

        // Check tags
        if (tags != null && !tags.isEmpty()) {
            for (String tag : tags) {
                if (tag != null && containsDeprecationKeywords(tag)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if text contains any deprecation keywords
     *
     * @param text Text to analyze
     * @return true if deprecation keywords found
     */
    private boolean containsDeprecationKeywords(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }

        String lowerText = text.toLowerCase();

        for (String keyword : DEPRECATION_KEYWORDS) {
            if (lowerText.contains(keyword.toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    /**
     * Fetch JSON response from URL
     * Simple HTTP GET without authentication
     *
     * @param urlString URL to fetch
     * @return JSON string or null if failed
     */
    private String fetchJsonFromUrl(String urlString) {
        try {
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json");
            connection.setConnectTimeout(5000); // 5 second timeout
            connection.setReadTimeout(5000);

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                Scanner scanner = new Scanner(connection.getInputStream());
                scanner.useDelimiter("\\A");
                String response = scanner.hasNext() ? scanner.next() : "";
                scanner.close();
                return response;
            } else if (responseCode == HttpURLConnection.HTTP_NOT_FOUND) {
                // Package doesn't exist - not deprecated, just doesn't exist
                return null;
            } else {
                System.err.println("    ✗ HTTP " + responseCode + " when fetching " + urlString);
                return null;
            }
        } catch (IOException e) {
            System.err.println("    ✗ Error fetching " + urlString + ": " + e.getMessage());
            return null;
        }
    }
}

