package com.kampusx.issue.repository;

import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssueStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    @EntityGraph(attributePaths = {"category", "location", "reporter"})
    List<Issue> findByCategoryCategoryHeadId(Long categoryHeadId);

    @EntityGraph(attributePaths = {"category", "location", "reporter"})
    List<Issue> findByReporterId(Long reporterId);

    @EntityGraph(attributePaths = {"category", "location", "reporter"})
    List<Issue> findByResolverId(Long resolverId);

    @Override
    @EntityGraph(attributePaths = {"category", "location", "reporter"})
    List<Issue> findAll();

    @Override
    @EntityGraph(attributePaths = {"category", "location", "reporter"})
    Optional<Issue> findById(Long id);

    long countByStatus(IssueStatus status);

    @Query("""
    SELECT i.category.id, i.category.name, COUNT(i)
    FROM Issue i
    GROUP BY i.category.id, i.category.name
    ORDER BY COUNT(i) DESC
    """)
    List<Object[]> countIssuesByCategory();

    @Query("""
    SELECT i.location.id, i.location.name, COUNT(i)
    FROM Issue i
    GROUP BY i.location.id, i.location.name
    ORDER BY COUNT(i) DESC
    """)
    List<Object[]> countIssuesByLocation();
}