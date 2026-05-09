package com.pfe.student.repository;

import com.pfe.student.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudentId(Long studentId);
    List<Grade> findByCourseId(Long courseId);

    @Query("SELECT AVG(g.value) FROM Grade g WHERE g.studentId = :studentId")
    Double getAverageByStudentId(Long studentId);
}
