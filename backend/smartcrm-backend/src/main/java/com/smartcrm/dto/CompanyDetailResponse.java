package com.smartcrm.dto;

import com.smartcrm.entity.Customer;
import com.smartcrm.entity.Note;

import java.util.List;

public class CompanyDetailResponse {

    private String name;
    private String priority; // LOW | MEDIUM | HIGH

    private Long customerCount;
    private Long totalNotes;
    private Long openCount;
    private Long inProgressCount;
    private Long resolvedCount;

    private List<Customer> customers;
    private List<Note> notes;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getCustomerCount() { return customerCount; }
    public void setCustomerCount(Long customerCount) { this.customerCount = customerCount; }

    public Long getTotalNotes() { return totalNotes; }
    public void setTotalNotes(Long totalNotes) { this.totalNotes = totalNotes; }

    public Long getOpenCount() { return openCount; }
    public void setOpenCount(Long openCount) { this.openCount = openCount; }

    public Long getInProgressCount() { return inProgressCount; }
    public void setInProgressCount(Long inProgressCount) { this.inProgressCount = inProgressCount; }

    public Long getResolvedCount() { return resolvedCount; }
    public void setResolvedCount(Long resolvedCount) { this.resolvedCount = resolvedCount; }

    public List<Customer> getCustomers() { return customers; }
    public void setCustomers(List<Customer> customers) { this.customers = customers; }

    public List<Note> getNotes() { return notes; }
    public void setNotes(List<Note> notes) { this.notes = notes; }
}