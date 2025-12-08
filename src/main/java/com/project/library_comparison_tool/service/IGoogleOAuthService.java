package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.dto.GoogleUserInfo;

import java.io.IOException;
import java.security.GeneralSecurityException;

//interface
public interface IGoogleOAuthService {

    //verify
    GoogleUserInfo verifyGoogleToken(String idToken) throws GeneralSecurityException, IOException;

    //validate
    boolean isValidTokenFormat(String idToken);
}