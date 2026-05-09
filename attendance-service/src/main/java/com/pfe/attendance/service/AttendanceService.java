package com.pfe.attendance.service;

import com.pfe.attendance.entity.Attendance;
import com.pfe.attendance.entity.AttendanceStatus;
import com.pfe.attendance.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public Attendance recordAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getByStudentId(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getByCourseId(Long courseId) {
        return attendanceRepository.findByCourseId(courseId);
    }

    public Attendance updateAttendance(Long id, Attendance updated) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found: " + id));
        if (updated.getStatus() != null) attendance.setStatus(updated.getStatus());
        if (updated.getJustification() != null) attendance.setJustification(updated.getJustification());
        return attendanceRepository.save(attendance);
    }

    public Map<String, Object> getStudentStats(Long studentId) {
        long total = attendanceRepository.countByStudentId(studentId);
        long absences = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);
        long lates = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);
        long presents = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);

        double absenceRate = total > 0 ? (double) absences / total * 100 : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("studentId", studentId);
        stats.put("totalSessions", total);
        stats.put("present", presents);
        stats.put("absent", absences);
        stats.put("late", lates);
        stats.put("absenceRate", Math.round(absenceRate * 100.0) / 100.0);
        return stats;
    }
}
