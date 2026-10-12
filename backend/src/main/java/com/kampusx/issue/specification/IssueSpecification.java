package com.kampusx.issue.specification;

import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssuePriority;
import com.kampusx.issue.entity.IssueStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class IssueSpecification {

    public static Specification<Issue> filter(
            String status,
            String search,
            Long categoryId,
            Long locationId,
            String sort
    ) {
        return (root, query, cb) -> {

            List<Predicate> conditions = new ArrayList<>();

            // Status filter
            if (status != null && !status.isBlank()) {
                IssueStatus issueStatus;

                try {
                    issueStatus = IssueStatus.valueOf(
                            status.trim().toUpperCase(Locale.ROOT)
                    );
                } catch (IllegalArgumentException ex) {
                    throw new IllegalArgumentException(
                            "Invalid issue status: " + status
                    );
                }

                conditions.add(
                        cb.equal(root.get("status"), issueStatus)
                );
            }

            // Title search
            if (search != null && !search.isBlank()) {
                conditions.add(
                        cb.like(
                                cb.lower(root.get("title")),
                                "%" + search.trim()
                                        .toLowerCase(Locale.ROOT) + "%"
                        )
                );
            }

            // Category filter
            if (categoryId != null) {
                conditions.add(
                        cb.equal(
                                root.get("category").get("id"),
                                categoryId
                        )
                );
            }

            // Location filter
            if (locationId != null) {
                conditions.add(
                        cb.equal(
                                root.get("location").get("id"),
                                locationId
                        )
                );
            }
            if (query != null
                    && query.getResultType() != Long.class
                    && query.getResultType() != long.class
                    && "priority".equalsIgnoreCase(sort)) {

                var priorityOrder = cb.<Integer>selectCase()
                        .when(cb.equal(root.get("priority"),
                                IssuePriority.HIGH), 3)
                        .when(cb.equal(root.get("priority"),
                                IssuePriority.MEDIUM), 2)
                        .when(cb.equal(root.get("priority"),
                                IssuePriority.LOW), 1)
                        .otherwise(0);

                query.orderBy(
                        cb.desc(priorityOrder),
                        cb.desc(root.get("id"))
                );
            }
            return cb.and(conditions.toArray(new Predicate[0]));
        };
    }
}