package com.smartcrm.controller;

import com.smartcrm.dto.CustomerRequest;
import com.smartcrm.dto.CustomerResponse;
import com.smartcrm.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // ✅ UPDATED: return Map
    @GetMapping
    public Map<String, Object> getCustomers(
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ){
        if (page < 0) page = 0;
        if (size <= 0) size = 5;
        if (size > 50) size = 50;

        return customerService.getAllCustomers(page, size, sortBy, direction);
    }

    @PostMapping
    public CustomerResponse createCustomer(@Valid @RequestBody CustomerRequest request){
        return customerService.save(request);
    }

    @DeleteMapping("/{id}")
    public String deleteCustomer(@PathVariable Long id){
        customerService.deleteCustomer(id);
        return "Customer deleted successfully";
    }
    @GetMapping("/count")
public long getCustomerCount() {
    return customerService.countCustomers();
}

    @PutMapping("/{id}")
    public CustomerResponse updateCustomer(@PathVariable Long id , @Valid @RequestBody CustomerRequest request){
        return customerService.updateCustomer(id,request);
    }

    @GetMapping("/search")
    public List<CustomerResponse> searchCustomers(@RequestParam String name){
        return customerService.searchCustomers(name);
    }
}