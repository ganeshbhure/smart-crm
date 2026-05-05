package com.smartcrm.service;

import com.smartcrm.entity.Customer;
import com.smartcrm.entity.Note;
import com.smartcrm.exception.ResourceNotFoundException;
import com.smartcrm.repository.CustomerRepository;
import com.smartcrm.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final CustomerRepository customerRepository;

    public NoteService(NoteRepository noteRepository, CustomerRepository customerRepository) {
        this.noteRepository = noteRepository;
        this.customerRepository = customerRepository;
    }

    // ✅ ADD NOTE
    public Note addNote(Long customerId, Note note) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        note.setCustomer(customer);
        note.setCreatedAt(LocalDateTime.now()); // 🔥 IMPORTANT

        return noteRepository.save(note);
    }

    // ✅ GET NOTES BY CUSTOMER (ONLY ONE METHOD)
    public List<Note> getNotesByCustomer(Long customerId) {

        // optional check (safe)
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found");
        }

        return noteRepository.findByCustomerId(customerId);
    }

    // ✅ UPDATE STATUS
    public Note updateStatus(Long noteId, String status) {

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        // 🔥 BASIC VALIDATION
        if (!status.equalsIgnoreCase("OPEN") &&
                !status.equalsIgnoreCase("IN_PROGRESS") &&
                !status.equalsIgnoreCase("RESOLVED")) {
            throw new RuntimeException("Invalid status");
        }

        note.setStatus(status.toUpperCase());

        return noteRepository.save(note);
    }

    // ✅ DELETE NOTE
    public void deleteNote(Long noteId) {

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        noteRepository.delete(note);
    }
}