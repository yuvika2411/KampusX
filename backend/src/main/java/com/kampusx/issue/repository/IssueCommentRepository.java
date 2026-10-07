package com.kampusx.issue.repository;

import com.kampusx.issue.entity.IssueComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueCommentRepository extends JpaRepository<IssueComment, Long> {

    List<IssueComment> findByIssueIdOrderByIdAsc(Long issueId);
}