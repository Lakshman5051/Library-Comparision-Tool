package com.project.library_comparison_tool.service;

import com.project.library_comparison_tool.dto.FavoriteDTO;
import com.project.library_comparison_tool.entity.Favorite;
import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.User;
import com.project.library_comparison_tool.repository.FavoriteRepository;
import com.project.library_comparison_tool.repository.LibraryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final LibraryRepository libraryRepository;
    private final ComparisonService comparisonService;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            LibraryRepository libraryRepository,
            ComparisonService comparisonService
    ) {
        this.favoriteRepository = favoriteRepository;
        this.libraryRepository = libraryRepository;
        this.comparisonService = comparisonService;
    }


    @Transactional
    public FavoriteDTO addFavorite(Long userId, Long libraryId, User user) {
        // Validate library ID
        if (libraryId == null) {
            throw new IllegalArgumentException("Library ID is required");
        }

        // Check if library exists
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Library not found with ID: " + libraryId));

        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndLibraryId(userId, libraryId)) {
            throw new IllegalArgumentException("Library is already in your favorites");
        }

        // Create favorite entity
        Favorite favorite = Favorite.builder()
                .user(user)
                .library(library)
                .build();

        // Save to database
        Favorite savedFavorite = favoriteRepository.save(favorite);

        // Return DTO with full library details
        return FavoriteDTO.fromEntityWithLibrary(savedFavorite, comparisonService);
    }


    public List<FavoriteDTO> getUserFavorites(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        return FavoriteDTO.fromEntitiesWithLibraries(favorites, comparisonService);
    }


    public List<FavoriteDTO> getUserFavoritesBasic(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        return FavoriteDTO.fromEntities(favorites);
    }


    @Transactional
    public void removeFavorite(Long userId, Long libraryId) {
        // Validate library ID
        if (libraryId == null) {
            throw new IllegalArgumentException("Library ID is required");
        }

        // Check if favorite exists
        Favorite favorite = favoriteRepository.findByUserIdAndLibraryId(userId, libraryId)
                .orElseThrow(() -> new IllegalArgumentException("Favorite not found for this library"));

        // Verify ownership (extra security check)
        if (!favorite.belongsTo(userId)) {
            throw new IllegalArgumentException("You do not have permission to remove this favorite");
        }

        // Delete favorite
        favoriteRepository.deleteByUserIdAndLibraryId(userId, libraryId);
    }


    public Boolean isFavorited(Long userId, Long libraryId) {
        if (userId == null || libraryId == null) {
            return false;
        }
        return favoriteRepository.existsByUserIdAndLibraryId(userId, libraryId);
    }


    public Long getFavoritesCount(Long userId) {
        if (userId == null) {
            return 0L;
        }
        return favoriteRepository.countByUserId(userId);
    }


    public Optional<FavoriteDTO> getFavoriteById(Long favoriteId, Long userId) {
        if (favoriteId == null || userId == null) {
            return Optional.empty();
        }

        return favoriteRepository.findById(favoriteId)
                .filter(favorite -> favorite.belongsTo(userId))
                .map(favorite -> FavoriteDTO.fromEntityWithLibrary(favorite, comparisonService));
    }
}