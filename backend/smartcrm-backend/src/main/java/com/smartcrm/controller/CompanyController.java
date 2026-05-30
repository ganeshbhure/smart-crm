package com.smartcrm.controller;

import com.smartcrm.dto.CompanyDetailResponse;
import com.smartcrm.dto.CompanySummaryResponse;
import com.smartcrm.entity.Customer;
import com.smartcrm.entity.Note;
import com.smartcrm.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /**
     * GET /api/companies
     * Returns all companies with summary stats (customer count, note counts, priority).
     */
    @GetMapping
    public ResponseEntity<List<CompanySummaryResponse>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    /**
     * GET /api/companies/count
     * Returns the total number of distinct normalized companies.
     * Uses the EXACT same groupByCompany() normalization as getAllCompanies(),
     * so this number always equals the number of cards rendered on the Companies
     * page and the company count shown in Analytics.
     *
     * IMPORTANT — declared BEFORE /{name} so Spring's path matcher resolves the
     * literal segment "count" here instead of treating it as a {name} variable
     * and routing the request to getCompanyDetail("count"), which would return
     * a wrong or error response.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getCompanyCount() {
        return ResponseEntity.ok(companyService.getCompanyCount());
    }

    /**
     * GET /api/companies/{name}
     * Returns full detail for a single company: customers, notes, all counts, priority.
     */
    @GetMapping("/{name}")
    public ResponseEntity<CompanyDetailResponse> getCompanyDetail(
            @PathVariable String name
    ) {
        return ResponseEntity.ok(companyService.getCompanyDetail(name));
    }

    /**
     * GET /api/companies/{name}/customers
     * Returns all customers belonging to the company.
     */
    @GetMapping("/{name}/customers")
    public ResponseEntity<List<Customer>> getCustomersByCompany(
            @PathVariable String name
    ) {
        return ResponseEntity.ok(companyService.getCustomersByCompany(name));
    }

    /**
     * GET /api/companies/{name}/notes
     * Returns all notes for customers of the company.
     */
    @GetMapping("/{name}/notes")
    public ResponseEntity<List<Note>> getNotesByCompany(
            @PathVariable String name
    ) {
        return ResponseEntity.ok(companyService.getNotesByCompany(name));
    }

    /**
     * GET /api/companies/{name}/notes/counts
     * Returns open / inProgress / resolved / total note counts for the company.
     */
    @GetMapping("/{name}/notes/counts")
    public ResponseEntity<Map<String, Long>> getNoteCountsByCompany(
            @PathVariable String name
    ) {
        return ResponseEntity.ok(companyService.getNoteCountsByCompany(name));
    }
}