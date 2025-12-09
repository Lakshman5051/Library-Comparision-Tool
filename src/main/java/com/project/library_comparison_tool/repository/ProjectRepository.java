package com.project.library_comparison_tool.repository;

import com.project.library_comparison_tool.entity.Project;
import com.project.library_comparison_tool.entity.ProjectStatus;
import com.project.library_comparison_tool.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {


    List<Project> findByUser(User user);

    List<Project> findByUserId(Long userId);

    Optional<Project> findByIdAndUser(Long id, User user);

    Optional<Project> findByIdAndUserId(Long id, Long userId);

    List<Project> findByUserIdAndStatus(Long userId, ProjectStatus status);

    Long countByUserId(Long userId);

    Boolean existsByIdAndUserId(Long id, Long userId);
}