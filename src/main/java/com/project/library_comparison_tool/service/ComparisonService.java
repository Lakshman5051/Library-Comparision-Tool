package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.Vulnerability;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Unified Comparison Service
 * Handles all comparison logic and scoring calculations
 * Replaces scattered scoring methods with a single, comprehensive engine
 */
@Service
public class ComparisonService {

    // Score weights for overall score calculation
    private static final double WEIGHT_POPULARITY = 0.25;
    private static final double WEIGHT_MAINTENANCE = 0.20;
    private static final double WEIGHT_SECURITY = 0.25;
    private static final double WEIGHT_COMMUNITY = 0.15;
    private static final double WEIGHT_QUALITY = 0.15;

    /**
     * Comprehensive comparison result for a library
     */
    public static class ComparisonResult {
        // Multi-dimensional scores (0-10 each)
        private double popularityScore;
        private double maintenanceScore;
        private double securityScore;
        private double communityScore;
        private double qualityScore;
        
        // Overall weighted score (0-10)
        private double overallScore;
        
        // Quality grade (A-F)
        private String qualityGrade;
        
        // Additional metrics
        private boolean isActivelyMaintained;
        private int vulnerabilitySeverityScore; // Weighted vulnerability score

        // Getters
        public double getPopularityScore() { return popularityScore; }
        public double getMaintenanceScore() { return maintenanceScore; }
        public double getSecurityScore() { return securityScore; }
        public double getCommunityScore() { return communityScore; }
        public double getQualityScore() { return qualityScore; }
        public double getOverallScore() { return overallScore; }
        public String getQualityGrade() { return qualityGrade; }
        public boolean isActivelyMaintained() { return isActivelyMaintained; }
        public int getVulnerabilitySeverityScore() { return vulnerabilitySeverityScore; }
    }

    /**
     * Calculate comprehensive comparison result for a library
     * This is the single source of truth for all scoring
     */
    public ComparisonResult calculateComparison(Library library) {
        ComparisonResult result = new ComparisonResult();

        // Calculate multi-dimensional scores
        result.popularityScore = calculatePopularityScore(library);
        result.maintenanceScore = calculateMaintenanceScore(library);
        result.securityScore = calculateSecurityScore(library);
        result.communityScore = calculateCommunityScore(library);
        result.qualityScore = calculateQualityScore(library);

        // Calculate overall weighted score
        result.overallScore = calculateOverallScore(result);

        // Calculate quality grade
        result.qualityGrade = calculateQualityGrade(result.overallScore);

        // Additional metrics
        result.isActivelyMaintained = isActivelyMaintained(library);
        result.vulnerabilitySeverityScore = calculateVulnerabilitySeverityScore(library);

        return result;
    }

    /**
     * Popularity Score (0-10)
     * Based on GitHub stars and dependent projects
     */
    private double calculatePopularityScore(Library library) {
        double score = 0.0;
        int factors = 0;

        // GitHub Stars (0-5 points)
        if (library.getGithubStars() != null && library.getGithubStars() > 0) {
            // Logarithmic scale: 100K stars = 5 points
            double starScore = Math.min(5.0, (Math.log10(library.getGithubStars() + 1) / Math.log10(100000)) * 5);
            score += starScore;
            factors++;
        }

        // Dependent Projects (0-5 points)
        if (library.getDependentProjectsCount() != null && library.getDependentProjectsCount() > 0) {
            // Logarithmic scale: 100K dependents = 5 points
            double dependentScore = Math.min(5.0, (Math.log10(library.getDependentProjectsCount() + 1) / Math.log10(100000)) * 5);
            score += dependentScore;
            factors++;
        }

        // Penalties
        if (Boolean.TRUE.equals(library.getIsDeprecated())) {
            score *= 0.1; // Heavy penalty for deprecated
        }

        if (Boolean.TRUE.equals(library.getHasSecurityVulnerabilities())) {
            score *= 0.5; // Penalty for vulnerabilities
        }

        return factors > 0 ? Math.min(10.0, score) : 0.0;
    }

    /**
     * Maintenance Score (0-10)
     * Enhanced graduated score based on recency and release frequency
     */
    private double calculateMaintenanceScore(Library library) {
        double score = 0.0;
        int factors = 0;

        // Recency Score (0-6 points)
        if (library.getLastRepositoryReleaseDate() != null) {
            long daysSinceRelease = ChronoUnit.DAYS.between(
                library.getLastRepositoryReleaseDate(),
                LocalDate.now()
            );

            if (daysSinceRelease <= 7) {
                score += 6.0; // Very recent
            } else if (daysSinceRelease <= 30) {
                score += 5.0; // Recent
            } else if (daysSinceRelease <= 90) {
                score += 4.0; // Moderately recent
            } else if (daysSinceRelease <= 180) {
                score += 3.0; // Somewhat recent
            } else if (daysSinceRelease <= 365) {
                score += 2.0; // Old
            } else {
                score += 1.0; // Very old
            }
            factors++;
        }

        // Registry Release Recency (0-2 points)
        if (library.getLastRegistryReleaseDate() != null) {
            try {
                LocalDate registryDate = LocalDate.parse(library.getLastRegistryReleaseDate());
                long daysSinceRegistry = ChronoUnit.DAYS.between(registryDate, LocalDate.now());
                
                if (daysSinceRegistry <= 90) {
                    score += 2.0;
                } else if (daysSinceRegistry <= 180) {
                    score += 1.0;
                }
                factors++;
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }

        // Version Activity (0-2 points)
        // If has latest version, assume some activity
        if (library.getLatestVersion() != null && !library.getLatestVersion().isEmpty()) {
            score += 2.0;
            factors++;
        }

        // Penalty for deprecated
        if (Boolean.TRUE.equals(library.getIsDeprecated())) {
            score = Math.min(score, 2.0); // Max 2 points if deprecated
        }

        return factors > 0 ? Math.min(10.0, score / factors * 10) : 0.0;
    }

    /**
     * Security Score (0-10)
     * Enhanced with vulnerability severity weighting
     */
    private double calculateSecurityScore(Library library) {
        double score = 10.0; // Start with perfect score

        // If deprecated, severe penalty
        if (Boolean.TRUE.equals(library.getIsDeprecated())) {
            return 2.0; // Very low score for deprecated
        }

        // If no vulnerabilities, return perfect score
        if (!Boolean.TRUE.equals(library.getHasSecurityVulnerabilities()) || 
            library.getVulnerabilities() == null || 
            library.getVulnerabilities().isEmpty()) {
            return 10.0;
        }

        // Calculate penalty based on vulnerability severity
        double penalty = 0.0;
        List<Vulnerability> vulnerabilities = library.getVulnerabilities();

        for (Vulnerability vuln : vulnerabilities) {
            String severity = vuln.getSeverity();
            if (severity != null) {
                switch (severity.toUpperCase()) {
                    case "CRITICAL":
                        penalty += 3.0; // Heavy penalty
                        break;
                    case "HIGH":
                        penalty += 2.0; // Significant penalty
                        break;
                    case "MEDIUM":
                        penalty += 1.0; // Moderate penalty
                        break;
                    case "LOW":
                        penalty += 0.5; // Light penalty
                        break;
                    default:
                        penalty += 1.0; // Default moderate penalty
                }
            } else {
                // If no severity, use count-based penalty
                penalty += 1.0;
            }
        }

        // Apply penalty (max penalty = 9, so minimum score is 1)
        score = Math.max(1.0, score - penalty);

        return score;
    }

    /**
     * Community Score (0-10)
     * Based on forks and community engagement
     */
    private double calculateCommunityScore(Library library) {
        double score = 0.0;
        int factors = 0;

        // Forks (0-5 points)
        if (library.getGithubForks() != null && library.getGithubForks() > 0) {
            // Logarithmic scale: 10K forks = 5 points
            double forkScore = Math.min(5.0, (Math.log10(library.getGithubForks() + 1) / Math.log10(10000)) * 5);
            score += forkScore;
            factors++;
        }

        // Dependent Projects (0-5 points)
        if (library.getDependentProjectsCount() != null && library.getDependentProjectsCount() > 0) {
            // Logarithmic scale: 100K dependents = 5 points
            double dependentScore = Math.min(5.0, (Math.log10(library.getDependentProjectsCount() + 1) / Math.log10(100000)) * 5);
            score += dependentScore;
            factors++;
        }

        return factors > 0 ? Math.min(10.0, score) : 0.0;
    }

    /**
     * Quality Score (0-10)
     * Based on stars, maintenance, security, and dependents
     */
    private double calculateQualityScore(Library library) {
        double score = 0.0;
        int factors = 0;

        // Stars (0-2.5 points)
        if (library.getGithubStars() != null) {
            score += Math.min(2.5, library.getGithubStars() / 1000.0);
            factors++;
        }

        // Active Maintenance (0-2.5 points)
        if (isActivelyMaintained(library)) {
            score += 2.5;
        }
        factors++;

        // No Security Issues (0-2.5 points)
        if (!Boolean.TRUE.equals(library.getHasSecurityVulnerabilities())) {
            score += 2.5;
        }
        factors++;

        // Has Dependents (0-2.5 points)
        if (library.getDependentProjectsCount() != null && library.getDependentProjectsCount() > 0) {
            score += Math.min(2.5, library.getDependentProjectsCount() / 100.0);
            factors++;
        }

        return factors > 0 ? Math.min(10.0, (score / factors) * 10) : 0.0;
    }

    /**
     * Calculate overall weighted score (0-10)
     */
    private double calculateOverallScore(ComparisonResult result) {
        double overall = 
            (result.popularityScore * WEIGHT_POPULARITY) +
            (result.maintenanceScore * WEIGHT_MAINTENANCE) +
            (result.securityScore * WEIGHT_SECURITY) +
            (result.communityScore * WEIGHT_COMMUNITY) +
            (result.qualityScore * WEIGHT_QUALITY);

        return Math.round(overall * 10.0) / 10.0; // Round to 1 decimal
    }

    /**
     * Calculate quality grade (A-F) based on overall score
     */
    private String calculateQualityGrade(double overallScore) {
        if (overallScore >= 9.0) return "A";
        if (overallScore >= 7.0) return "B";
        if (overallScore >= 5.0) return "C";
        if (overallScore >= 3.0) return "D";
        return "F";
    }

    /**
     * Check if library is actively maintained
     * Enhanced: More nuanced than simple binary check
     */
    private boolean isActivelyMaintained(Library library) {
        if (library.getLastRepositoryReleaseDate() == null) {
            return false;
        }

        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        return library.getLastRepositoryReleaseDate().isAfter(sixMonthsAgo);
    }

    /**
     * Calculate weighted vulnerability severity score
     * Higher score = more severe vulnerabilities
     */
    private int calculateVulnerabilitySeverityScore(Library library) {
        if (!Boolean.TRUE.equals(library.getHasSecurityVulnerabilities()) ||
            library.getVulnerabilities() == null ||
            library.getVulnerabilities().isEmpty()) {
            return 0;
        }

        int severityScore = 0;
        for (Vulnerability vuln : library.getVulnerabilities()) {
            String severity = vuln.getSeverity();
            if (severity != null) {
                switch (severity.toUpperCase()) {
                    case "CRITICAL":
                        severityScore += 10;
                        break;
                    case "HIGH":
                        severityScore += 7;
                        break;
                    case "MEDIUM":
                        severityScore += 4;
                        break;
                    case "LOW":
                        severityScore += 1;
                        break;
                    default:
                        severityScore += 2;
                }
            } else {
                severityScore += 2; // Default if no severity
            }
        }

        return severityScore;
    }

    /**
     * Get popularity score for ranking (legacy support)
     * This replaces the old getPopularityScore() method
     */
    public double getPopularityScoreForRanking(Library library) {
        ComparisonResult result = calculateComparison(library);
        // Convert 0-10 score to ranking score
        return result.getPopularityScore() * 10000; // Scale for ranking
    }
}

