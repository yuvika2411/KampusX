package com.kampusx.issue.repository;

import com.kampusx.issue.entity.IssueVote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueVoteRepository extends JpaRepository<IssueVote, Long> {

    boolean existsByIssueIdAndUserId(Long issueId, Long userId);

    long countByIssueId(Long issueId);
}