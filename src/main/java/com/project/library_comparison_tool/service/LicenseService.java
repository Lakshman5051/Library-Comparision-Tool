package com.project.library_comparison_tool.service;

import org.springframework.stereotype.Service;

/**
 * Service for determining license type and cost model
 */
@Service
public class LicenseService {

    /**
     * Check if a license is an open source license
     * Detects common open source licenses using pattern matching
     * 
     * @param license License string
     * @return true if open source, false otherwise
     */
    public boolean isOpenSourceLicense(String license) {
        if (license == null) return false;
        
        String lower = license.toLowerCase();
        return lower.contains("apache") ||
                lower.contains("mit") ||
                lower.contains("bsd") ||
                lower.contains("gpl") ||
                lower.contains("lgpl") ||
                lower.contains("mpl") ||
                // Additional common open source licenses
                lower.contains("isc") ||
                lower.contains("unlicense") ||
                lower.contains("cc0") ||
                lower.contains("wtfpl") ||
                lower.contains("artistic") ||
                lower.contains("epl") ||
                lower.contains("cddl") ||
                lower.contains("zlib") ||
                lower.contains("boost") ||
                lower.contains("0bsd") ||
                lower.contains("cc-by") ||
                lower.contains("public domain");
    }

    /**
     * Determine cost model based on license type
     * 
     * @param license License string (can be null)
     * @return Cost description ("Free / Open Source", "Check License", or "Unknown")
     */
    public String determineCost(String license) {
        if (license != null && isOpenSourceLicense(license)) {
            return "Free / Open Source";
        } else if (license == null) {
            return "Unknown";
        } else {
            return "Check License";
        }
    }
}

