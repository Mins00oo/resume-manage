package com.resumemanage.jobapply.repository;

import com.resumemanage.jobapply.domain.EmploymentType;
import com.resumemanage.jobapply.domain.JobApply;
import com.resumemanage.jobapply.domain.JobApplyStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class JobApplySpecifications {

    private JobApplySpecifications() {
    }

    public static Specification<JobApply> belongsToUser(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<JobApply> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<JobApply> hasStatus(JobApplyStatus status) {
        return (root, query, cb) -> cb.equal(root.get("currentStatus"), status);
    }

    public static Specification<JobApply> hasEmploymentType(EmploymentType type) {
        return (root, query, cb) -> cb.equal(root.get("employmentType"), type);
    }

    public static Specification<JobApply> submittedInYear(Integer year) {
        return (root, query, cb) -> cb.equal(cb.function("YEAR", Integer.class, root.get("submittedAt")), year);
    }

    public static Specification<JobApply> deadlineBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from != null && to != null) {
                return cb.between(root.get("deadline"), from, to);
            }
            if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("deadline"), from);
            }
            return cb.lessThanOrEqualTo(root.get("deadline"), to);
        };
    }

    public static Specification<JobApply> companyOrPositionContains(String search) {
        return (root, query, cb) -> {
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("company")), pattern),
                    cb.like(cb.lower(root.get("position")), pattern)
            );
        };
    }
}
