package com.smartcrm.service;

import com.smartcrm.dto.ContactRequest;
import com.smartcrm.dto.ContactResponse;
import com.smartcrm.entity.Contact;
import com.smartcrm.entity.Customer;
import com.smartcrm.exception.ResourceNotFoundException;
import com.smartcrm.repository.ContactRepository;
import com.smartcrm.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ContactService {
    private final CustomerRepository customerRepository;
    private final ContactRepository contactRepository;

    public ContactService(CustomerRepository customerRepository, ContactRepository contactRepository) {
        this.customerRepository = customerRepository;
        this.contactRepository = contactRepository;
    }

    public ContactResponse createContact(ContactRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with the id:" + request.getCustomerId()));

        Contact contact = new Contact();
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());

        // Automatically derive company from the associated Customer.
        // If the Customer entity has a getCompany() method, use it; otherwise
        // fall back to the customer's name so the badge is always populated.
        // Adjust the getter below to match your actual Customer field name.
        String derivedCompany = (customer.getCompany() != null && !customer.getCompany().isBlank())
                ? customer.getCompany()
                : customer.getName();
        contact.setCompany(derivedCompany);

        contact.setCustomer(customer);
        Contact savedContact = contactRepository.save(contact);
        return convertToResponse(savedContact);
    }

    public List<ContactResponse> getContactsByCustomer(Long customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with the id:" + customerId));

        List<ContactResponse> responseList = new ArrayList<>();
        List<Contact> contacts = contactRepository.findByCustomerId(customerId);

        for (Contact contact : contacts) {
            responseList.add(convertToResponse(contact));
        }

        return responseList;
    }

    private ContactResponse convertToResponse(Contact contact) {
        ContactResponse response = new ContactResponse();
        response.setCustomerId(contact.getCustomer().getId());
        response.setId(contact.getId());
        response.setName(contact.getName());
        response.setEmail(contact.getEmail());
        response.setPhone(contact.getPhone());
        response.setCompany(contact.getCompany());
        return response;
    }
}