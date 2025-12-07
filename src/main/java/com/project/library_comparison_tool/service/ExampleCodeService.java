package com.project.library_comparison_tool.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.library_comparison_tool.entity.Library;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for extracting example code snippets from GitHub repositories
 * Extracts from README.md and examples directory
 */
@Service
public class ExampleCodeService {

    private static final String GITHUB_API_BASE = "https://api.github.com";
    private static final int MAX_CODE_LENGTH = 2000; // Match database TEXT field limit
    private static final int MIN_CODE_LENGTH = 20; // Minimum meaningful code length
    
    // Rate limiting: GitHub allows 60 requests/hour for unauthenticated, 5,000/hour with token
    private static volatile boolean githubRateLimited = false;
    private static volatile long rateLimitResetTime = 0;
    private static final long RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
    
    private final ObjectMapper objectMapper;
    private final String githubToken;

    public ExampleCodeService(
            @Value("${github.api.token:}") String githubToken) {
        this.objectMapper = new ObjectMapper();
        this.githubToken = (githubToken != null && !githubToken.trim().isEmpty()) ? githubToken.trim() : null;

        //i added a debugging point
        if (this.githubToken != null) {
            System.out.println("✓ GitHub API token configured. Rate limit: 5,000 requests/hour");
        } else {
            System.out.println("⚠ GitHub API token not configured. Rate limit: 60 requests/hour");
            System.out.println("  → To increase rate limit, add github.api.token to application.properties");
        }
    }

    /**
     * Extract example code snippet from GitHub repository
     * Tries README.md first, then examples directory
     * 
     * @param library Library to extract code for
     * @return Example code snippet or null if not found
     */
    public String extractExampleCode(Library library) {
        if (library == null) {
            return null;
        }

        // If no repository URL, generate code directly
        if (library.getRepositoryUrl() == null || library.getRepositoryUrl().isEmpty()) {
            System.out.println("    → No repository URL, generating example code automatically");
            String generatedCode = generateExampleCode(library);
            if (generatedCode != null && isValidCode(generatedCode)) {
                System.out.println("    → Generated example code based on library name and category");
                return generatedCode;
            }
            return null;
        }

        // Check if rate limited
        if (isRateLimited()) {
            System.out.println("    ⚠ GitHub API rate limited. Generating example code automatically.");
            String generatedCode = generateExampleCode(library);
            if (generatedCode != null && isValidCode(generatedCode)) {
                System.out.println("    → Generated example code based on library name and category");
                return generatedCode;
            }
            return null;
        }

        GitHubRepoInfo repoInfo = extractGitHubInfo(library.getRepositoryUrl());
        if (repoInfo == null) {
            System.out.println("    → Could not extract GitHub info, generating example code automatically");
            String generatedCode = generateExampleCode(library);
            if (generatedCode != null && isValidCode(generatedCode)) {
                System.out.println("    → Generated example code based on library name and category");
                return generatedCode;
            }
            return null;
        }

        // Strategy 1: Try README.md
        String code = extractFromReadme(repoInfo.owner, repoInfo.repo, library.getLanguage());
        if (code != null && isValidCode(code)) {
            System.out.println("    → Extracted example code from README.md");
            return code;
        }

        // Strategy 2: Try examples directory (only if not rate limited)
        if (!isRateLimited()) {
            code = extractFromExamplesDirectory(repoInfo.owner, repoInfo.repo, library.getLanguage());
            if (code != null && isValidCode(code)) {
                System.out.println("    → Extracted example code from examples directory");
                return code;
            }
        }

        // Strategy 3: Generate example code based on library name, language, and category
        System.out.println("    → README extraction failed, generating example code automatically");
        String generatedCode = generateExampleCode(library);
        if (generatedCode != null && isValidCode(generatedCode)) {
            System.out.println("    → Generated example code based on library name and category");
            return generatedCode;
        }

        return null;
    }

    /**
     * Extract usage description from README.md to enhance useCase field
     * Looks for "Usage", "Quick Start", "Getting Started" sections
     * 
     * @param library Library to extract usage for
     * @return Usage description or null if not found
     */
    public String extractUsageDescription(Library library) {
        if (library == null || library.getRepositoryUrl() == null) {
            return null;
        }

        // Check if rate limited
        if (isRateLimited()) {
            return null;
        }

        GitHubRepoInfo repoInfo = extractGitHubInfo(library.getRepositoryUrl());
        if (repoInfo == null) {
            return null;
        }

        String readmeContent = fetchReadmeContent(repoInfo.owner, repoInfo.repo);
        if (readmeContent == null || readmeContent.isEmpty()) {
            return null;
        }

        // Look for usage sections
        String usage = extractUsageFromReadme(readmeContent);
        if (usage != null && !usage.isEmpty()) {
            System.out.println("    → Extracted usage description from README.md");
            return usage;
        }

        return null;
    }

    /**
     * Extract code from README.md
     */
    private String extractFromReadme(String owner, String repo, String language) {
        String readmeContent = fetchReadmeContent(owner, repo);
        if (readmeContent == null || readmeContent.isEmpty()) {
            return null;
        }

        // Extract code blocks from markdown
        List<String> codeBlocks = extractCodeBlocks(readmeContent, language);
        
        // Return first valid code block
        for (String code : codeBlocks) {
            if (isValidCode(code)) {
                return truncateCode(code);
            }
        }

        return null;
    }

    /**
     * Extract code from examples directory
     */
    private String extractFromExamplesDirectory(String owner, String repo, String language) {
        // Try common example directory names
        String[] exampleDirs = {"examples", "example", "samples", "sample", "demo", "demos"};
        
        for (String dir : exampleDirs) {
            String code = extractFromDirectory(owner, repo, dir, language);
            if (code != null && isValidCode(code)) {
                return code;
            }
        }

        return null;
    }

    /**
     * Extract code from a specific directory
     */
    private String extractFromDirectory(String owner, String repo, String directory, String language) {
        try {
            // List directory contents
            String apiUrl = GITHUB_API_BASE + "/repos/" + owner + "/" + repo + "/contents/" + directory;
            String jsonResponse = fetchJsonFromUrl(apiUrl);
            
            if (jsonResponse == null || jsonResponse.isEmpty()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(jsonResponse);
            
            // Handle both single file and array of files
            if (root.isArray()) {
                // Find first code file matching language
                for (JsonNode item : root) {
                    if (item.has("type") && "file".equals(item.get("type").asText())) {
                        String fileName = item.get("name").asText();
                        if (isCodeFile(fileName, language)) {
                            String downloadUrl = item.get("download_url").asText();
                            return fetchFileContent(downloadUrl);
                        }
                    }
                }
            }

            return null;
        } catch (Exception e) {
            System.err.println("    ✗ Error extracting from directory " + directory + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Fetch README.md content from GitHub
     */
    private String fetchReadmeContent(String owner, String repo) {
        try {
            String apiUrl = GITHUB_API_BASE + "/repos/" + owner + "/" + repo + "/readme";
            System.out.println("    → Fetching README from: " + apiUrl);
            System.out.println("       Using token: " + (githubToken != null ? "Yes" : "No"));
            
            String jsonResponse = fetchJsonFromUrl(apiUrl);
            
            if (jsonResponse == null || jsonResponse.isEmpty()) {
                System.out.println("    ✗ README fetch returned null or empty response");
                return null;
            }

            JsonNode root = objectMapper.readTree(jsonResponse);
            
            if (root.has("content") && root.has("encoding")) {
                String encoding = root.get("encoding").asText();
                String content = root.get("content").asText();
                
                System.out.println("    → README found! Encoding: " + encoding + ", Content length: " + content.length());
                
                if ("base64".equals(encoding)) {
                    byte[] decoded = Base64.getDecoder().decode(content);
                    String decodedContent = new String(decoded);
                    System.out.println("    → README decoded successfully, length: " + decodedContent.length() + " chars");
                    return decodedContent;
                } else {
                    System.out.println("    ⚠ README encoding not base64: " + encoding);
                }
            } else {
                System.out.println("    ✗ README response missing 'content' or 'encoding' fields");
            }

            return null;
        } catch (Exception e) {
            System.err.println("    ✗ Error fetching README: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Extract code blocks from markdown content
     */
    private List<String> extractCodeBlocks(String markdown, String language) {
        List<String> codeBlocks = new java.util.ArrayList<>();
        
        // Pattern: ```language\ncode\n``` or ```\ncode\n```
        Pattern pattern = Pattern.compile(
            "```(?:\\w+)?\\s*\\n(.*?)```",
            Pattern.DOTALL | Pattern.CASE_INSENSITIVE
        );
        
        Matcher matcher = pattern.matcher(markdown);
        
        while (matcher.find()) {
            String code = matcher.group(1).trim();
            
            // If language specified, prefer matching language
            String codeBlockLanguage = extractLanguageFromCodeBlock(markdown, matcher.start());
            if (language != null && codeBlockLanguage != null) {
                if (codeBlockLanguage.equalsIgnoreCase(language)) {
                    codeBlocks.add(0, code); // Prefer matching language
                } else {
                    codeBlocks.add(code);
                }
            } else {
                codeBlocks.add(code);
            }
        }

        return codeBlocks;
    }

    /**
     * Extract language from code block marker
     */
    private String extractLanguageFromCodeBlock(String markdown, int startPos) {
        // Look backwards from start position to find ```language
        int backPos = Math.max(0, startPos - 50);
        String before = markdown.substring(backPos, startPos);
        
        Pattern langPattern = Pattern.compile("```(\\w+)");
        Matcher langMatcher = langPattern.matcher(before);
        if (langMatcher.find()) {
            return langMatcher.group(1);
        }
        
        return null;
    }

    /**
     * Extract usage description from README
     * Looks for sections like "Usage", "Quick Start", "Getting Started"
     */
    private String extractUsageFromReadme(String readmeContent) {
        // Look for usage sections
        Pattern[] patterns = {
            Pattern.compile("(?i)##\\s*Usage\\s*\\n(.*?)(?=\\n##|$)", Pattern.DOTALL),
            Pattern.compile("(?i)##\\s*Quick\\s*Start\\s*\\n(.*?)(?=\\n##|$)", Pattern.DOTALL),
            Pattern.compile("(?i)##\\s*Getting\\s*Started\\s*\\n(.*?)(?=\\n##|$)", Pattern.DOTALL),
            Pattern.compile("(?i)###\\s*Usage\\s*\\n(.*?)(?=\\n##|$)", Pattern.DOTALL),
            Pattern.compile("(?i)###\\s*Quick\\s*Start\\s*\\n(.*?)(?=\\n##|$)", Pattern.DOTALL)
        };

        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(readmeContent);
            if (matcher.find()) {
                String usage = matcher.group(1).trim();
                // Remove code blocks from usage text
                usage = usage.replaceAll("```[\\s\\S]*?```", "");
                // Clean up markdown formatting
                usage = usage.replaceAll("`([^`]+)`", "$1"); // Remove inline code
                usage = usage.replaceAll("\\*\\*([^*]+)\\*\\*", "$1"); // Remove bold
                usage = usage.replaceAll("\\*([^*]+)\\*", "$1"); // Remove italic
                // Limit length
                if (usage.length() > 500) {
                    usage = usage.substring(0, 497) + "...";
                }
                if (usage.length() > 50) { // Minimum meaningful length
                    return usage;
                }
            }
        }

        return null;
    }

    /**
     * Check if file is a code file matching the language
     */
    private boolean isCodeFile(String fileName, String language) {
        if (fileName == null) {
            return false;
        }

        String lowerFileName = fileName.toLowerCase();
        
        // Common code file extensions
        String[] extensions = {
            ".js", ".jsx", ".ts", ".tsx", ".java", ".py", ".rb", ".go",
            ".rs", ".php", ".cpp", ".c", ".cs", ".swift", ".kt", ".scala"
        };

        for (String ext : extensions) {
            if (lowerFileName.endsWith(ext)) {
                // If language specified, prefer matching extensions
                if (language != null) {
                    String lowerLang = language.toLowerCase();
                    if ((lowerLang.contains("javascript") && (ext.equals(".js") || ext.equals(".jsx"))) ||
                        (lowerLang.contains("typescript") && (ext.equals(".ts") || ext.equals(".tsx"))) ||
                        (lowerLang.contains("java") && ext.equals(".java")) ||
                        (lowerLang.contains("python") && ext.equals(".py")) ||
                        (lowerLang.contains("ruby") && ext.equals(".rb")) ||
                        (lowerLang.contains("go") && ext.equals(".go")) ||
                        (lowerLang.contains("rust") && ext.equals(".rs"))) {
                        return true;
                    }
                }
                // If no language match, accept any code file
                return true;
            }
        }

        return false;
    }

    /**
     * Fetch file content from download URL
     */
    private String fetchFileContent(String downloadUrl) {
        try {
            URL url = new URL(downloadUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                Scanner scanner = new Scanner(connection.getInputStream());
                scanner.useDelimiter("\\A");
                String content = scanner.hasNext() ? scanner.next() : "";
                scanner.close();
                return content;
            }
            return null;
        } catch (Exception e) {
            System.err.println("    ✗ Error fetching file content: " + e.getMessage());
            return null;
        }
    }

    /**
     * Validate code snippet quality
     */
    private boolean isValidCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return false;
        }

        // Check length
        if (code.length() < MIN_CODE_LENGTH) {
            return false;
        }

        // Filter out installation commands
        String lowerCode = code.toLowerCase();
        if (lowerCode.contains("npm install") || 
            lowerCode.contains("pip install") ||
            lowerCode.contains("yarn add") ||
            lowerCode.contains("mvn install") ||
            lowerCode.contains("gradle") && lowerCode.contains("build")) {
            return false;
        }

        // Filter out configuration files (JSON, YAML, XML only)
        if (code.trim().startsWith("{") && code.trim().endsWith("}") && 
            !code.contains("function") && !code.contains("const") && !code.contains("var")) {
            // Might be JSON config, skip if too short
            if (code.length() < 100) {
                return false;
            }
        }

        // Prefer code with import/require statements (indicates actual usage)
        boolean hasImports = lowerCode.contains("import ") || 
                            lowerCode.contains("require(") ||
                            lowerCode.contains("from ") ||
                            lowerCode.contains("using ");

        // If no imports but has function/class definitions, still valid
        boolean hasCodeStructure = lowerCode.contains("function") ||
                                  lowerCode.contains("class ") ||
                                  lowerCode.contains("def ") ||
                                  lowerCode.contains("public ");

        return hasImports || hasCodeStructure;
    }

    /**
     * Truncate code to fit database limit
     */
    private String truncateCode(String code) {
        if (code == null) {
            return null;
        }
        
        if (code.length() <= MAX_CODE_LENGTH) {
            return code;
        }

        // Try to truncate at a newline
        String truncated = code.substring(0, MAX_CODE_LENGTH);
        int lastNewline = truncated.lastIndexOf('\n');
        if (lastNewline > MAX_CODE_LENGTH - 200) {
            return truncated.substring(0, lastNewline) + "\n// ... (truncated)";
        }

        return truncated + "\n// ... (truncated)";
    }

    /**
     * Extract owner and repo from GitHub URL
     */
    private GitHubRepoInfo extractGitHubInfo(String repositoryUrl) {
        if (repositoryUrl == null || repositoryUrl.isEmpty()) {
            System.out.println("    ⚠ Repository URL is null or empty");
            return null;
        }

        System.out.println("    → Extracting GitHub info from: " + repositoryUrl);

        // Pattern: https://github.com/{owner}/{repo}
        // Also handle: https://github.com/{owner}/{repo}.git
        // Also handle: http://github.com/{owner}/{repo}
        Pattern pattern = Pattern.compile("(?:https?://)?(?:www\\.)?github\\.com/([^/]+)/([^/]+?)(?:\\.git)?/?$", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(repositoryUrl);

        if (matcher.find()) {
            String owner = matcher.group(1);
            String repo = matcher.group(2);
            System.out.println("    → Extracted: owner='" + owner + "', repo='" + repo + "'");
            return new GitHubRepoInfo(owner, repo);
        }

        System.out.println("    ✗ Could not extract GitHub owner/repo from URL: " + repositoryUrl);
        return null;
    }

    /**
     * Check if GitHub API is rate limited
     */
    private boolean isRateLimited() {
        if (githubRateLimited) {
            // Check if rate limit window has passed
            if (System.currentTimeMillis() > rateLimitResetTime) {
                githubRateLimited = false;
                System.out.println("    → GitHub API rate limit window reset. Resuming API calls.");
                return false;
            }
            return true;
        }
        return false;
    }

    /**
     * Fetch JSON from GitHub API with rate limit handling and token authentication
     */
    private String fetchJsonFromUrl(String urlString) {
        try {
            // Check rate limit before making request
            if (isRateLimited()) {
                return null;
            }

            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("User-Agent", "LibraryComparisonTool/1.0");
            
            // Add GitHub token authentication if available
            if (githubToken != null && !githubToken.isEmpty()) {
                connection.setRequestProperty("Authorization", "token " + githubToken);
            }
            
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            int responseCode = connection.getResponseCode();
            
            if (responseCode == HttpURLConnection.HTTP_OK) {
                Scanner scanner = new Scanner(connection.getInputStream());
                scanner.useDelimiter("\\A");
                String response = scanner.hasNext() ? scanner.next() : "";
                scanner.close();
                return response;
            } else if (responseCode == HttpURLConnection.HTTP_NOT_FOUND) {
                return null;
            } else if (responseCode == 403) {
                // Rate limited or unauthorized
                String errorMessage = "Rate limited or unauthorized";
                try {
                    Scanner errorScanner = new Scanner(connection.getErrorStream());
                    errorScanner.useDelimiter("\\A");
                    String errorResponse = errorScanner.hasNext() ? errorScanner.next() : "";
                    errorScanner.close();
                    if (errorResponse.contains("rate limit")) {
                        errorMessage = "Rate limit exceeded";
                    } else if (errorResponse.contains("Bad credentials") || errorResponse.contains("401")) {
                        errorMessage = "Invalid GitHub token";
                    }
                } catch (Exception e) {
                    // Ignore error stream parsing errors
                }
                
                // Only set rate limit flag if we don't have a token (unauthenticated rate limit)
                if (githubToken == null || githubToken.isEmpty()) {
                    githubRateLimited = true;
                    rateLimitResetTime = System.currentTimeMillis() + RATE_LIMIT_WINDOW;
                    System.err.println("    ⚠ GitHub API rate limited (403). Will retry after 1 hour.");
                    System.err.println("    → Tip: Add github.api.token to application.properties for 5,000 requests/hour.");
                } else {
                    System.err.println("    ⚠ GitHub API error (403): " + errorMessage);
                    System.err.println("    → Check if your GitHub token is valid and has correct permissions.");
                }
                return null;
            } else if (responseCode == 401) {
                System.err.println("    ✗ GitHub API unauthorized (401). Invalid token.");
                return null;
            } else {
                System.err.println("    ✗ GitHub API error: " + responseCode);
                return null;
            }
        } catch (IOException e) {
            System.err.println("    ✗ Error fetching from GitHub API: " + e.getMessage());
            return null;
        }
    }

    /**
     * Generate example code snippet based on library name, language, and category
     * This is a fallback when README extraction fails
     */
    private String generateExampleCode(Library library) {
        if (library == null || library.getName() == null) {
            return null;
        }

        String libraryName = library.getName();
        String language = library.getLanguage();
        String categories = library.getCategories();
        String framework = library.getFramework();
        
        // Extract simple name (remove Maven coordinates, scoped packages)
        String simpleName = extractSimpleName(libraryName);
        
        // Generate code based on language and category
        String code = generateCodeByLanguage(language, simpleName, categories, framework);
        
        if (code != null && !code.isEmpty()) {
            return truncateCode(code);
        }
        
        return null;
    }

    /**
     * Extract simple name from library name (remove Maven coordinates, scoped packages)
     */
    private String extractSimpleName(String libraryName) {
        if (libraryName == null || libraryName.isEmpty()) {
            return "";
        }
        
        // Handle Maven coordinates
        if (libraryName.contains(":")) {
            String[] parts = libraryName.split(":");
            return parts[parts.length - 1];
        }
        
        // Handle scoped NPM packages
        if (libraryName.startsWith("@") && libraryName.contains("/")) {
            String[] parts = libraryName.split("/");
            return parts[parts.length - 1];
        }
        
        return libraryName;
    }

    /**
     * Generate code example based on programming language
     */
    private String generateCodeByLanguage(String language, String libraryName, String categories, String framework) {
        if (language == null) {
            language = "Unknown";
        }
        
        String simpleName = libraryName.toLowerCase();
        String categoryLower = (categories != null) ? categories.toLowerCase() : "";
        
        // JavaScript/TypeScript
        if ("JavaScript".equalsIgnoreCase(language) || "TypeScript".equalsIgnoreCase(language)) {
            return generateJavaScriptExample(simpleName, categoryLower, framework);
        }
        
        // Java
        if ("Java".equalsIgnoreCase(language)) {
            return generateJavaExample(simpleName, categoryLower, framework);
        }
        
        // Python
        if ("Python".equalsIgnoreCase(language)) {
            return generatePythonExample(simpleName, categoryLower, framework);
        }
        
        // Generic fallback
        return generateGenericExample(language, simpleName, categoryLower);
    }

    /**
     * Generate JavaScript/TypeScript example
     */
    private String generateJavaScriptExample(String libraryName, String categories, String framework) {
        StringBuilder code = new StringBuilder();
        
        // Import statement
        if (categories.contains("ui framework") || "react".equalsIgnoreCase(framework)) {
            code.append("import React from 'react';\n");
            code.append("import ").append(capitalizeFirst(libraryName)).append(" from '").append(libraryName).append("';\n\n");
            code.append("function App() {\n");
            code.append("  return (\n");
            code.append("    <div>\n");
            code.append("      <").append(capitalizeFirst(libraryName)).append(" />\n");
            code.append("    </div>\n");
            code.append("  );\n");
            code.append("}\n");
            code.append("\nexport default App;");
        } else if (categories.contains("web framework") || "express".equalsIgnoreCase(libraryName)) {
            code.append("const express = require('express');\n");
            code.append("const app = express();\n\n");
            code.append("app.get('/', (req, res) => {\n");
            code.append("  res.send('Hello World!');\n");
            code.append("});\n\n");
            code.append("app.listen(3000, () => {\n");
            code.append("  console.log('Server running on port 3000');\n");
            code.append("});");
        } else if (categories.contains("http client") || "axios".equalsIgnoreCase(libraryName)) {
            code.append("const axios = require('axios');\n\n");
            code.append("async function fetchData() {\n");
            code.append("  try {\n");
            code.append("    const response = await axios.get('https://api.example.com/data');\n");
            code.append("    console.log(response.data);\n");
            code.append("  } catch (error) {\n");
            code.append("    console.error('Error:', error);\n");
            code.append("  }\n");
            code.append("}\n\n");
            code.append("fetchData();");
        } else if (categories.contains("utilities") || "lodash".equalsIgnoreCase(libraryName)) {
            code.append("const _ = require('lodash');\n\n");
            code.append("const numbers = [1, 2, 3, 4, 5];\n");
            code.append("const doubled = _.map(numbers, n => n * 2);\n");
            code.append("console.log(doubled); // [2, 4, 6, 8, 10]\n\n");
            code.append("const users = [{name: 'John', age: 30}, {name: 'Jane', age: 25}];\n");
            code.append("const sorted = _.sortBy(users, 'age');\n");
            code.append("console.log(sorted);");
        } else if (categories.contains("testing") || "jest".equalsIgnoreCase(libraryName)) {
            code.append("const sum = require('./sum');\n\n");
            code.append("test('adds 1 + 2 to equal 3', () => {\n");
            code.append("  expect(sum(1, 2)).toBe(3);\n");
            code.append("});");
        } else {
            // Generic JavaScript
            code.append("const ").append(libraryName).append(" = require('").append(libraryName).append("');\n\n");
            code.append("// Example usage\n");
            code.append("const result = ").append(libraryName).append(".doSomething();\n");
            code.append("console.log(result);");
        }
        
        return code.toString();
    }

    /**
     * Generate Java example
     */
    private String generateJavaExample(String libraryName, String categories, String framework) {
        StringBuilder code = new StringBuilder();
        
        String className = capitalizeFirst(libraryName.replace("-", ""));
        String packageName = libraryName.toLowerCase().replace("-", "");
        
        if (categories.contains("web framework") || "spring".equalsIgnoreCase(framework) || libraryName.contains("spring")) {
            code.append("package com.example;\n\n");
            code.append("import org.springframework.boot.SpringApplication;\n");
            code.append("import org.springframework.boot.autoconfigure.SpringBootApplication;\n");
            code.append("import org.springframework.web.bind.annotation.GetMapping;\n");
            code.append("import org.springframework.web.bind.annotation.RestController;\n\n");
            code.append("@SpringBootApplication\n");
            code.append("public class Application {\n");
            code.append("    public static void main(String[] args) {\n");
            code.append("        SpringApplication.run(Application.class, args);\n");
            code.append("    }\n");
            code.append("}\n\n");
            code.append("@RestController\n");
            code.append("class HelloController {\n");
            code.append("    @GetMapping(\"/\")\n");
            code.append("    public String hello() {\n");
            code.append("        return \"Hello World!\";\n");
            code.append("    }\n");
            code.append("}");
        } else if (categories.contains("testing") || "junit".equalsIgnoreCase(libraryName)) {
            code.append("import org.junit.Test;\n");
            code.append("import static org.junit.Assert.*;\n\n");
            code.append("public class ExampleTest {\n");
            code.append("    @Test\n");
            code.append("    public void testExample() {\n");
            code.append("        assertEquals(2, 1 + 1);\n");
            code.append("    }\n");
            code.append("}");
        } else if (categories.contains("serialization") || libraryName.contains("jackson")) {
            code.append("import com.fasterxml.jackson.databind.ObjectMapper;\n\n");
            code.append("ObjectMapper mapper = new ObjectMapper();\n");
            code.append("String json = mapper.writeValueAsString(object);\n");
            code.append("MyObject obj = mapper.readValue(json, MyObject.class);");
        } else if (categories.contains("http client")) {
            code.append("import java.net.http.HttpClient;\n");
            code.append("import java.net.http.HttpRequest;\n");
            code.append("import java.net.URI;\n\n");
            code.append("HttpClient client = HttpClient.newHttpClient();\n");
            code.append("HttpRequest request = HttpRequest.newBuilder()\n");
            code.append("    .uri(URI.create(\"https://api.example.com\"))\n");
            code.append("    .build();\n");
            code.append("var response = client.send(request, HttpResponse.BodyHandlers.ofString());");
        } else {
            // Generic Java
            code.append("import ").append(packageName).append(".").append(className).append(";\n\n");
            code.append("public class Example {\n");
            code.append("    public static void main(String[] args) {\n");
            code.append("        ").append(className).append(" lib = new ").append(className).append("();\n");
            code.append("        lib.doSomething();\n");
            code.append("    }\n");
            code.append("}");
        }
        
        return code.toString();
    }

    /**
     * Generate Python example
     */
    private String generatePythonExample(String libraryName, String categories, String framework) {
        StringBuilder code = new StringBuilder();
        
        if (categories.contains("web framework") || "django".equalsIgnoreCase(libraryName) || "flask".equalsIgnoreCase(libraryName)) {
            if ("django".equalsIgnoreCase(libraryName)) {
                code.append("from django.http import HttpResponse\n");
                code.append("from django.urls import path\n\n");
                code.append("def hello(request):\n");
                code.append("    return HttpResponse('Hello World!')\n\n");
                code.append("urlpatterns = [\n");
                code.append("    path('', hello),\n");
                code.append("]");
            } else {
                code.append("from flask import Flask\n\n");
                code.append("app = Flask(__name__)\n\n");
                code.append("@app.route('/')\n");
                code.append("def hello():\n");
                code.append("    return 'Hello World!'\n\n");
                code.append("if __name__ == '__main__':\n");
                code.append("    app.run()");
            }
        } else if (categories.contains("http client") || "requests".equalsIgnoreCase(libraryName)) {
            code.append("import requests\n\n");
            code.append("response = requests.get('https://api.example.com/data')\n");
            code.append("print(response.json())\n\n");
            code.append("# POST request example\n");
            code.append("data = {'key': 'value'}\n");
            code.append("response = requests.post('https://api.example.com/post', json=data)");
        } else if (categories.contains("data processing") || "pandas".equalsIgnoreCase(libraryName)) {
            code.append("import pandas as pd\n\n");
            code.append("df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})\n");
            code.append("print(df)\n\n");
            code.append("# Basic operations\n");
            code.append("print(df.describe())");
        } else if (categories.contains("testing") || "pytest".equalsIgnoreCase(libraryName)) {
            code.append("def test_example():\n");
            code.append("    assert 1 + 1 == 2\n\n");
            code.append("# Run with: pytest test_example.py");
        } else {
            // Generic Python
            code.append("import ").append(libraryName).append("\n\n");
            code.append("# Example usage\n");
            code.append("result = ").append(libraryName).append(".do_something()\n");
            code.append("print(result)");
        }
        
        return code.toString();
    }

    /**
     * Generate generic example for other languages
     */
    private String generateGenericExample(String language, String libraryName, String categories) {
        StringBuilder code = new StringBuilder();
        
        code.append("// ").append(language).append(" example using ").append(libraryName).append("\n\n");
        code.append("// Import the library\n");
        code.append("import ").append(libraryName).append(";\n\n");
        code.append("// Basic usage example\n");
        code.append("var result = ").append(libraryName).append(".doSomething();\n");
        code.append("console.log(result);");
        
        return code.toString();
    }

    /**
     * Capitalize first letter of a string
     */
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    /**
     * Helper class for GitHub repo info
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

