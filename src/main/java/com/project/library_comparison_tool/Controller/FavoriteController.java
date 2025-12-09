package com.project.library_comparison_tool.Controller;

import com.project.library_comparison_tool.dto.AddFavoriteRequest;
import com.project.library_comparison_tool.dto.FavoriteDTO;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.service.FavoriteService;
import com.project.library_comparison_tool.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserService userService;

    public FavoriteController(
            FavoriteService favoriteService,
            UserService userService
    ) {
        this.favoriteService = favoriteService;
        this.userService = userService;
    }

    // get current user
    private User getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new IllegalStateException("User not authenticated");
        }
        return userService.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    // add favorites of a user
    @PostMapping
    public ResponseEntity<Map<String, Object>> addFavorite(
            @RequestBody AddFavoriteRequest request,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            FavoriteDTO favorite = favoriteService.addFavorite(user.getId(), request.getLibraryId(), user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Library added to favorites");
            response.put("favorite", favorite);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to add favorite: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //Get User Favorites
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserFavorites(HttpSession session) {
        try {
            User user = getCurrentUser(session);
            List<FavoriteDTO> favorites = favoriteService.getUserFavorites(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("favorites", favorites);
            response.put("count", favorites.size());

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get favorites: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //Remove their favorite
    @DeleteMapping("/{libraryId}")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @PathVariable Long libraryId,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            favoriteService.removeFavorite(user.getId(), libraryId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Library removed from favorites");

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to remove favorite: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //chekc if already its favorited by user
    @GetMapping("/{libraryId}/check")
    public ResponseEntity<Map<String, Object>> checkIfFavorited(
            @PathVariable Long libraryId,
            HttpSession session) {
        try {
            User user = getCurrentUser(session);
            Boolean isFavorited = favoriteService.isFavorited(user.getId(), libraryId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isFavorited", isFavorited);

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to check favorite status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // get the count of user's favorites
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getFavoritesCount(HttpSession session) {
        try {
            User user = getCurrentUser(session);
            Long count = favoriteService.getFavoritesCount(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", count);

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get favorites count: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}