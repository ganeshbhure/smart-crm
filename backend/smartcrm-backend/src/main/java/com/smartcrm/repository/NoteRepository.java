package com.smartcrm.repository;

import com.smartcrm.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByCustomerId(Long customerId);
    long countByStatus(String status);
}