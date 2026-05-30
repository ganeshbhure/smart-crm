package com.smartcrm.dto;

public class CompanySummaryResponse {

    private String name;
    private Long customerCount;
    private Long totalNotes;
    private Long openCount;
    private Long inProgressCount;
    private Long resolvedCount;
    private String priority; // LOW | MEDIUM | HIGH

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}