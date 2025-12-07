package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.entity.Library;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for inferring documentation URLs for libraries
 * Uses multiple strategies: API data, homepage, repository patterns, and ecosystem-specific patterns
 */
@Service
public class DocumentationService {

    /**
     * Infer documentation URL for a library using multiple strategies
     * 
     * Priority order:
     * 1. Libraries.io API documentation_url (if provided)
     * 2. Homepage URL (if it looks like documentation)
     * 3. Ecosystem-specific patterns (GitHub Pages, ReadTheDocs, etc.)
     * 4. Package manager pages (NPM, PyPI, etc.)
     * 
     * @param library Library to infer documentation URL for
     * @param apiDocumentationUrl Documentation URL from Libraries.io API (can be null)
     * @return Documentation URL or null if none found
     */
    public String inferDocumentationUrl(Library library, String apiDocumentationUrl) {
        if (library == null) {
            return null;
        }

        // Strategy 1: Use API-provided documentation URL if available
        if (apiDocumentationUrl != null && !apiDocumentationUrl.isEmpty()) {
            return apiDocumentationUrl;
        }

        // Strategy 2: Check if homepage URL looks like documentation
        String homepageUrl = library.getHomepageUrl();
        if (homepageUrl != null && !homepageUrl.isEmpty()) {
            String lowerHomepage = homepageUrl.toLowerCase();
            if (lowerHomepage.contains("docs") || 
                lowerHomepage.contains("documentation") ||
                lowerHomepage.contains("readthedocs") ||
                lowerHomepage.contains("doc") ||
                lowerHomepage.endsWith(".io") ||
                lowerHomepage.contains("github.io")) {
                return homepageUrl;
            }
        }

        // Strategy 3: Ecosystem-specific inference
        String packageManager = library.getPackageManager();
        String repositoryUrl = library.getRepositoryUrl();
        String libraryName = library.getName();

        if (packageManager != null && repositoryUrl != null && libraryName != null) {
            String inferredUrl = inferFromEcosystem(packageManager, repositoryUrl, libraryName, homepageUrl);
            if (inferredUrl != null) {
                return inferredUrl;
            }
        }

        // Strategy 4: Fallback to package manager pages (they often have docs sections)
        return inferFromPackageManager(packageManager, libraryName);
    }

    /**
     * Infer documentation URL based on ecosystem patterns
     */
    private String inferFromEcosystem(String packageManager, String repositoryUrl, String libraryName, String homepageUrl) {
        String upperPackageManager = packageManager.toUpperCase();

        // Extract owner/repo from GitHub URL
        GitHubRepoInfo repoInfo = extractGitHubInfo(repositoryUrl);
        if (repoInfo == null) {
            return null;
        }

        String owner = repoInfo.owner;
        String repo = repoInfo.repo;

        // Try ecosystem-specific patterns
        List<String> candidates = new ArrayList<>();

        switch (upperPackageManager) {
            case "NPM":
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://" + libraryName.toLowerCase() + ".readthedocs.io");
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                if (homepageUrl != null && homepageUrl.contains("github.io")) {
                    candidates.add(homepageUrl);
                }
                break;

            case "PYPI":
                candidates.add("https://" + libraryName.toLowerCase() + ".readthedocs.io");
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://readthedocs.io/projects/" + libraryName.toLowerCase());
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;

            case "MAVEN":
            case "GRADLE":
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                // Maven Central sometimes has docs
                if (homepageUrl != null && homepageUrl.contains("mvnrepository.com")) {
                    candidates.add(homepageUrl);
                }
                break;

            case "RUBYGEMS":
                candidates.add("https://" + owner + ".github.io/" + libraryName.toLowerCase());
                candidates.add("https://www.rubydoc.info/gems/" + libraryName.toLowerCase());
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;

            case "NUGET":
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;

            case "CARGO":
            case "CRATES":
                // docs.rs is the standard for Rust crates
                candidates.add("https://docs.rs/" + libraryName.toLowerCase());
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;

            case "GO":
                // pkg.go.dev is the standard for Go packages
                if (repositoryUrl.contains("github.com")) {
                    String modulePath = owner + "/" + repo;
                    candidates.add("https://pkg.go.dev/github.com/" + modulePath);
                }
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;

            case "PACKAGIST":
            case "COMPOSER":
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://packagist.org/packages/" + owner + "/" + libraryName.toLowerCase());
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;

            case "COCOAPODS":
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://cocoapods.org/pods/" + libraryName);
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;

            case "HEX":
                candidates.add("https://hexdocs.pm/" + libraryName.toLowerCase());
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;

            default:
                // Generic GitHub patterns for unknown ecosystems
                candidates.add("https://" + owner + ".github.io/" + repo);
                candidates.add("https://github.com/" + owner + "/" + repo + "/wiki");
                break;
        }

        // Return first candidate (we could validate URLs, but that requires HTTP calls)
        return candidates.isEmpty() ? null : candidates.get(0);
    }

    /**
     * Fallback: Infer from package manager pages
     */
    private String inferFromPackageManager(String packageManager, String libraryName) {
        if (packageManager == null || libraryName == null) {
            return null;
        }

        String upperPackageManager = packageManager.toUpperCase();

        switch (upperPackageManager) {
            case "NPM":
                return "https://www.npmjs.com/package/" + libraryName.toLowerCase();
            case "PYPI":
                return "https://pypi.org/project/" + libraryName.toLowerCase() + "/";
            case "NUGET":
                return "https://www.nuget.org/packages/" + libraryName + "/";
            case "RUBYGEMS":
                return "https://rubygems.org/gems/" + libraryName;
            case "CARGO":
            case "CRATES":
                return "https://crates.io/crates/" + libraryName.toLowerCase();
            default:
                return null;
        }
    }

    /**
     * Extract owner and repo name from GitHub URL
     */
    private GitHubRepoInfo extractGitHubInfo(String repositoryUrl) {
        if (repositoryUrl == null || repositoryUrl.isEmpty()) {
            return null;
        }

        // Pattern: https://github.com/{owner}/{repo}
        // Pattern: https://github.com/{owner}/{repo}.git
        Pattern pattern = Pattern.compile("github\\.com/([^/]+)/([^/]+?)(?:\\.git)?/?$");
        Matcher matcher = pattern.matcher(repositoryUrl);

        if (matcher.find()) {
            String owner = matcher.group(1);
            String repo = matcher.group(2);
            return new GitHubRepoInfo(owner, repo);
        }

        // Pattern: git@github.com:{owner}/{repo}.git
        pattern = Pattern.compile("git@github\\.com:([^/]+)/([^/]+?)(?:\\.git)?$");
        matcher = pattern.matcher(repositoryUrl);

        if (matcher.find()) {
            String owner = matcher.group(1);
            String repo = matcher.group(2);
            return new GitHubRepoInfo(owner, repo);
        }

        return null;
    }

    /**
     * Helper class to hold GitHub repo information
     */
    private static class GitHubRepoInfo {
        String owner;
        String repo;

        GitHubRepoInfo(String owner, String repo) {
            this.owner = owner;
            this.repo = repo;
        }
    }
}

