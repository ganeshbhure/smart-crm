package com.smartcrm.service;

import com.smartcrm.dto.CustomerRequest;
import com.smartcrm.dto.CustomerResponse;
import com.smartcrm.entity.Customer;
import com.smartcrm.exception.ResourceNotFoundException;
import com.smartcrm.repository.CustomerRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // ✅ UPDATED: return Map (content + total)
    public Map<String, Object> getAllCustomers(int page, int size, String sortBy, String direction) {

        if (!direction.equalsIgnoreCase("asc") && !direction.equalsIgnoreCase("desc")) {
            direction = "asc";
        }

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Customer> pageData = customerRepository.findAll(pageable);

        List<CustomerResponse> responseList = new ArrayList<>();

        for (Customer customer : pageData.getContent()) {
            responseList.add(convertToResponse(customer));
        }

        // ✅ IMPORTANT: return total count also
        Map<String, Object> response = new HashMap<>();
        response.put("content", responseList);
        response.put("totalElements", pageData.getTotalElements());

        return response;
    }

    public CustomerResponse save(CustomerRequest request) {
        Customer customer = convertToEntity(request);
        return convertToResponse(customerRepository.save(customer));
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request){
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setCompany(request.getCompany());

        return convertToResponse(customerRepository.save(customer));
    }

    public long countCustomers() {
    return customerRepository.count();
}

    public void deleteCustomer(Long id){
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customerRepository.delete(customer);
    }

    public List<CustomerResponse> searchCustomers(String name){

        if (name == null || name.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<Customer> customers = customerRepository.findByNameContainingIgnoreCase(name.trim());

        List<CustomerResponse> responseList = new ArrayList<>();

        for(Customer customer : customers){
            responseList.add(convertToResponse(customer));
        }

        return responseList;
    }

    private Customer convertToEntity(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setCompany(request.getCompany());
        return customer;
    }

    private CustomerResponse convertToResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setName(customer.getName());
        response.setEmail(customer.getEmail());
        response.setPhone(customer.getPhone());
        response.setCompany(customer.getCompany());
        return response;
    }
}