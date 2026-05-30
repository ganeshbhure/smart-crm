package com.smartcrm.service;

import com.smartcrm.dto.CompanyDetailResponse;
import com.smartcrm.dto.CompanySummaryResponse;
import com.smartcrm.entity.Customer;
import com.smartcrm.entity.Note;
import com.smartcrm.exception.ResourceNotFoundException;
import com.smartcrm.repository.CustomerRepository;
import com.smartcrm.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CustomerRepository customerRepository;
    private final NoteRepository noteRepository;

    public CompanyService(CustomerRepository customerRepository, NoteRepository noteRepository) {
        this.customerRepository = customerRepository;
        this.noteRepository = noteRepository;
    }

    // ─── NORMALIZATION ────────────────────────────────────────────────────────────
    // Single source of truth used by every method in this service.
    // Grouping key  : trimmed + lowercased → "Acme ", "ACME", "acme" all → "acme"
    // Display name  : trimmed, original casing of the FIRST customer encountered.
    private String normalizeKey(String company) {
        if (company == null || company.isBlank()) return "unknown";
        return company.trim().toLowerCase();
    }

    private String displayName(String company) {
        if (company == null || company.isBlank()) return "Unknown";
        return company.trim();
    }

    // ─── CORE GROUPING HELPER ─────────────────────────────────────────────────────
    // All counting and listing flows through here — logic is never duplicated.
    // Returns: normalized-key → List<Customer>  (insertion order preserved).
    private Map<String, List<Customer>> groupByCompany(List<Customer> allCustomers) {
        Map<String, List<Customer>> grouped = new LinkedHashMap<>();
        for (Customer c : allCustomers) {
            grouped.computeIfAbsent(normalizeKey(c.getCompany()), k -> new ArrayList<>()).add(c);
        }
        return grouped;
    }

    // ─── GET TOTAL COMPANY COUNT ──────────────────────────────────────────────────
    // Exposed via GET /api/companies/count.
    // Both the Analytics and Companies pages read this from the backend so they
    // always agree — no client-side recount.
    public long getCompanyCount() {
        return groupByCompany(customerRepository.findAll()).size();
    }

    // ─── GET ALL COMPANIES (summary list) ────────────────────────────────────────
    // Returns exactly ONE CompanySummaryResponse per normalized company name.
    // "Acme", "ACME", "acme " all collapse into a single entry whose name is the
    // trimmed casing of whichever customer record was loaded first.
    public List<CompanySummaryResponse> getAllCompanies() {

        Map<String, List<Customer>> grouped = groupByCompany(customerRepository.findAll());
        List<CompanySummaryResponse> result = new ArrayList<>();

        for (List<Customer> customers : grouped.values()) {
            List<Long> ids = customers.stream().map(Customer::getId).collect(Collectors.toList());

            String companyName   = displayName(customers.get(0).getCompany());
            long openCount       = noteRepository.countByCustomer_IdInAndStatus(ids, "OPEN");
            long inProgressCount = noteRepository.countByCustomer_IdInAndStatus(ids, "IN_PROGRESS");
            long resolvedCount   = noteRepository.countByCustomer_IdInAndStatus(ids, "RESOLVED");

            CompanySummaryResponse dto = new CompanySummaryResponse();
            dto.setName(companyName);
            dto.setCustomerCount((long) customers.size());
            dto.setTotalNotes(openCount + inProgressCount + resolvedCount);
            dto.setOpenCount(openCount);
            dto.setInProgressCount(inProgressCount);
            dto.setResolvedCount(resolvedCount);
            dto.setPriority(computePriority(customers.size(), openCount));
            result.add(dto);
        }

        result.sort(Comparator.comparingLong(CompanySummaryResponse::getCustomerCount)
                .reversed()
                .thenComparing(CompanySummaryResponse::getName));

        return result;
    }

    // ─── GET COMPANY DETAIL ───────────────────────────────────────────────────────
    public CompanyDetailResponse getCompanyDetail(String companyName) {

        List<Customer> customers = customerRepository
                .findByCompanyIgnoreCase(companyName.trim());

        if (customers.isEmpty()) {
            throw new ResourceNotFoundException("Company not found: " + companyName);
        }

        List<Long> ids  = customers.stream().map(Customer::getId).collect(Collectors.toList());
        List<Note> notes = noteRepository.findByCustomer_IdIn(ids);

        long openCount       = notes.stream().filter(n -> "OPEN".equalsIgnoreCase(n.getStatus())).count();
        long inProgressCount = notes.stream().filter(n -> "IN_PROGRESS".equalsIgnoreCase(n.getStatus())).count();
        long resolvedCount   = notes.stream().filter(n -> "RESOLVED".equalsIgnoreCase(n.getStatus())).count();

        CompanyDetailResponse dto = new CompanyDetailResponse();
        dto.setName(companyName.trim());
        dto.setCustomers(customers);
        dto.setNotes(notes);
        dto.setCustomerCount((long) customers.size());
        dto.setTotalNotes((long) notes.size());
        dto.setOpenCount(openCount);
        dto.setInProgressCount(inProgressCount);
        dto.setResolvedCount(resolvedCount);
        dto.setPriority(computePriority(customers.size(), openCount));

        return dto;
    }

    // ─── GET CUSTOMERS BY COMPANY ─────────────────────────────────────────────────
    public List<Customer> getCustomersByCompany(String companyName) {
        return customerRepository.findByCompanyIgnoreCase(companyName.trim());
    }

    // ─── GET NOTES BY COMPANY ─────────────────────────────────────────────────────
    public List<Note> getNotesByCompany(String companyName) {
        List<Customer> customers = customerRepository.findByCompanyIgnoreCase(companyName.trim());
        if (customers.isEmpty()) return Collections.emptyList();
        List<Long> ids = customers.stream().map(Customer::getId).collect(Collectors.toList());
        return noteRepository.findByCustomer_IdIn(ids);
    }

    // ─── NOTE COUNTS BY COMPANY ───────────────────────────────────────────────────
    public Map<String, Long> getNoteCountsByCompany(String companyName) {
        List<Customer> customers = customerRepository.findByCompanyIgnoreCase(companyName.trim());
        List<Long> ids = customers.stream().map(Customer::getId).collect(Collectors.toList());

        long open       = ids.isEmpty() ? 0 : noteRepository.countByCustomer_IdInAndStatus(ids, "OPEN");
        long inProgress = ids.isEmpty() ? 0 : noteRepository.countByCustomer_IdInAndStatus(ids, "IN_PROGRESS");
        long resolved   = ids.isEmpty() ? 0 : noteRepository.countByCustomer_IdInAndStatus(ids, "RESOLVED");

        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("open",       open);
        counts.put("inProgress", inProgress);
        counts.put("resolved",   resolved);
        counts.put("total",      open + inProgress + resolved);
        return counts;
    }

    // ─── PRIORITY HELPER ─────────────────────────────────────────────────────────
    private String computePriority(long customerCount, long openIssues) {
        if (openIssues >= 3 || customerCount >= 10) return "HIGH";
        if (openIssues >= 1 || customerCount >= 4)  return "MEDIUM";
        return "LOW";
    }
}