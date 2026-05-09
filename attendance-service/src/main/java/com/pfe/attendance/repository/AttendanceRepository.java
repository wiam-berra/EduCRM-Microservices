package com.pfe.attendance.repository;

import com.pfe.attendance.entity.Attendance;
import com.pfe.attendance.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByCourseId(Long courseId);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);
    long countByStudentId(Long studentId);
}
