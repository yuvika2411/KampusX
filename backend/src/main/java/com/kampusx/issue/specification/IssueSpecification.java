package com.kampusx.issue.specification;

import com.kampusx.issue.entity.Issue;
import org.springframework.data.jpa.domain.Specification;

public class IssueSpecification {

    public static Specification<Issue> filter(
            String status,
            String search
    ) {
        return (root, query, cb) -> {

            var conditions = new java.util.ArrayList<
                    jakarta.persistence.criteria.Predicate>();

            if (status != null && !status.isBlank()) {
                conditions.add(
                        cb.equal(
                                root.get("status").as(String.class),
                                status.toUpperCase()
                        )
                );
            }

            if (search != null && !search.isBlank()) {
                conditions.add(
                        cb.like(
                                cb.lower(root.get("title")),
                                "%" + search.trim().toLowerCase() + "%"
                        )
                );
            }

            return cb.and(conditions.toArray(
                    new jakarta.persistence.criteria.Predicate[0]
            ));
        };
    }
}