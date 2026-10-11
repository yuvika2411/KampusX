package com.kampusx.issue.repository;

import com.kampusx.issue.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    List<Issue> findByCategoryCategoryHeadId(Long categoryHeadId);
    List<Issue> findByReporterId(Long reporterId);
    List<Issue> findByResolverId(Long resolverId);
}