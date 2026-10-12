package com.kampusx.issue.repository;

import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    List<Issue> findByCategoryCategoryHeadId(Long categoryHeadId);
    List<Issue> findByReporterId(Long reporterId);
    List<Issue> findByResolverId(Long resolverId);
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