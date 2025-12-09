package com.project.library_comparison_tool.dto;

import com.project.library_comparison_tool.entity.Favorite;
import com.project.library_comparison_tool.service.ComparisonService;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteDTO {

    private Long id;
    private Long userId;
    private String username;
    private Long libraryId;
    private String libraryName;
    private LocalDateTime createdAt;

    // Full library details (optional, populated when needed)
    private LibraryDTO library;


    public static FavoriteDTO fromEntity(Favorite favorite) {
        if (favorite == null) {
            return null;
        }

        return FavoriteDTO.builder()
                .id(favorite.getId())
                .userId(favorite.getUser() != null ? favorite.getUser().getId() : null)
                .username(favorite.getUsername())
                .libraryId(favorite.getLibrary() != null ? favorite.getLibrary().getId() : null)
                .libraryName(favorite.getLibraryName())
                .createdAt(favorite.getCreatedAt())
                .build();
    }


    public static FavoriteDTO fromEntityWithLibrary(Favorite favorite, ComparisonService comparisonService) {
        if (favorite == null) {
            return null;
        }

        FavoriteDTO dto = fromEntity(favorite);

        // Add full library details
        if (favorite.getLibrary() != null) {
            dto.setLibrary(LibraryDTO.fromEntity(favorite.getLibrary(), comparisonService));
        }

        return dto;
    }


    public static List<FavoriteDTO> fromEntities(List<Favorite> favorites) {
        if (favorites == null) {
            return null;
        }

        return favorites.stream()
                .map(FavoriteDTO::fromEntity)
                .collect(Collectors.toList());
    }


    public static List<FavoriteDTO> fromEntitiesWithLibraries(List<Favorite> favorites, ComparisonService comparisonService) {
        if (favorites == null) {
            return null;
        }

        return favorites.stream()
                .map(favorite -> fromEntityWithLibrary(favorite, comparisonService))
                .collect(Collectors.toList());
    }
}