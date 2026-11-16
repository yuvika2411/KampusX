package com.kampusx.issue.repository;

import com.kampusx.issue.entity.IssueVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface IssueVoteRepository extends JpaRepository<IssueVote, Long> {

    boolean existsByIssueIdAndUserId(Long issueId, Long userId);

    long countByIssueId(Long issueId);

    @Query("SELECT v.issue.id, COUNT(v) FROM IssueVote v WHERE v.issue.id IN :issueIds GROUP BY v.issue.id")
    List<Object[]> countVotesByIssueIds(@Param("issueIds") Collection<Long> issueIds);

    @Query("SELECT v.issue.id FROM IssueVote v WHERE v.issue.id IN :issueIds AND v.user.id = :userId")
    List<Long> findVotedIssueIdsByUserId(@Param("issueIds") Collection<Long> issueIds, @Param("userId") Long userId);
}
