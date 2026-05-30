package com.smartcrm.repository;

import com.smartcrm.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // ─── Existing query (DO NOT REMOVE) ─────────────────────────────────────────
    List<Customer> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrCompanyContainingIgnoreCase(
            String name,
            String email,
            String phone,
            String company
    );

    // ─── New company lookup ──────────────────────────────────────────────────────

    /** Find all customers belonging to a specific company (case-insensitive exact match) */
    List<Customer> findByCompanyIgnoreCase(String company);
}