package com.kampusx.issue.repository;

import com.kampusx.issue.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByCategoryCategoryHeadId(Long categoryHeadId);
    List<Issue> findByReporterId(Long reporterId);
}