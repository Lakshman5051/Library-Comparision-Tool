package com.project.library_comparison_tool.repository;

import com.project.library_comparison_tool.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {


    List<Favorite> findByUserId(Long userId);

    Optional<Favorite> findByUserIdAndLibraryId(Long userId, Long libraryId);

    Boolean existsByUserIdAndLibraryId(Long userId, Long libraryId);

    Long countByUserId(Long userId);

    void deleteByUserIdAndLibraryId(Long userId, Long libraryId);
}