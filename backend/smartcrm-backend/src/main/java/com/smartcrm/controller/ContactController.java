package com.smartcrm.controller;

import com.smartcrm.dto.ContactRequest;
import com.smartcrm.dto.ContactResponse;
import com.smartcrm.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ContactResponse createContact(@Valid @RequestBody ContactRequest request){
        return contactService.createContact(request);
    }

    @GetMapping("/customer/{customerId}")
    public List<ContactResponse> getContacts(@PathVariable Long customerId){
        return contactService.getContactsByCustomer(customerId);
    }
}
