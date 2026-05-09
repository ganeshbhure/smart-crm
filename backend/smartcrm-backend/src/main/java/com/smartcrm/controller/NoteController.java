package com.smartcrm.controller;

import com.smartcrm.entity.Note;
import com.smartcrm.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    // ✅ ADD NOTE (BY CUSTOMER)
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Note> addNote(
            @PathVariable Long customerId,
            @RequestBody Note note
    ) {
        return ResponseEntity.ok(noteService.addNote(customerId, note));
    }

    // ✅ GET NOTES (BY CUSTOMER)
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Note>> getNotesByCustomer(
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(noteService.getNotesByCustomer(customerId));
    }

    // ✅ UPDATE NOTE STATUS
    @PutMapping("/{noteId}")
    public ResponseEntity<Note> updateStatus(
            @PathVariable Long noteId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(noteService.updateStatus(noteId, status));
    }

    // ✅ DELETE NOTE
    @DeleteMapping("/{noteId}")
    public ResponseEntity<String> deleteNote(@PathVariable Long noteId) {
        noteService.deleteNote(noteId);
        return ResponseEntity.ok("Note deleted");
    }
    @GetMapping("/count/open")
public long getOpenNotes() {
    return noteService.countOpenNotes();
}
}