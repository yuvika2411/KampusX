package com.kampusx.issue.repository;

import com.kampusx.issue.entity.IssueComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface IssueCommentRepository extends JpaRepository<IssueComment, Long> {

    List<IssueComment> findByIssueIdOrderByIdAsc(Long issueId);

    long countByIssueId(Long issueId);

    @Query("SELECT c.issue.id, COUNT(c) FROM IssueComment c WHERE c.issue.id IN :issueIds GROUP BY c.issue.id")
    List<Object[]> countCommentsByIssueIds(@Param("issueIds") Collection<Long> issueIds);
}
