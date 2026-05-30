package com.smartcrm.repository;

import com.smartcrm.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // ─── Existing queries ───────────────────────────────────────

    List<Note> findByCustomer_Id(Long customerId);

    long countByStatus(String status);

    // ─── Company-level queries ──────────────────────────────────

    /** All notes for a list of customer IDs */
    List<Note> findByCustomer_IdIn(List<Long> customerIds);

    /** Count notes by status for company customers */
    long countByCustomer_IdInAndStatus(List<Long> customerIds, String status);
}