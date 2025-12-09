package com.project.library_comparison_tool.repository;

import com.project.library_comparison_tool.entity.Library;
import com.project.library_comparison_tool.entity.Project;
import com.project.library_comparison_tool.entity.ProjectLibrary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectLibraryRepository extends JpaRepository<ProjectLibrary, Long> {


    List<ProjectLibrary> findByProject(Project project);


    List<ProjectLibrary> findByProjectId(Long projectId);


    Optional<ProjectLibrary> findByProjectAndLibrary(Project project, Library library);


    Optional<ProjectLibrary> findByProjectIdAndLibraryId(Long projectId, Long libraryId);


    Boolean existsByProjectIdAndLibraryId(Long projectId, Long libraryId);


    Long countByProjectId(Long projectId);


    void deleteByProjectIdAndLibraryId(Long projectId, Long libraryId);

    void deleteByProjectId(Long projectId);
}