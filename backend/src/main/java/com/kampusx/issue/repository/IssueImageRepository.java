package com.kampusx.issue.repository;

import com.kampusx.issue.entity.IssueImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueImageRepository
        extends JpaRepository<IssueImage, Long> {

    List<IssueImage> findByIssueIdOrderByIdAsc(Long issueId);

    List<IssueImage> findByIssueId(Long issueId);
}