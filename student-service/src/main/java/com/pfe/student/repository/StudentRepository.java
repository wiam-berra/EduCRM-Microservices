package com.pfe.student.repository;

import com.pfe.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByUserId(Long userId);
    boolean existsByEmail(String email);
}
