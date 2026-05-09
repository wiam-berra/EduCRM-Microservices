package com.pfe.attendance.controller;

import com.pfe.attendance.entity.Attendance;
import com.pfe.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<Attendance> recordAttendance(@RequestBody Attendance attendance) {
        return ResponseEntity.ok(attendanceService.recordAttendance(attendance));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getByStudentId(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Attendance>> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(attendanceService.getByCourseId(courseId));
    }

    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<Map<String, Object>> getStudentStats(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentStats(studentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Long id,
                                                       @RequestBody Attendance attendance) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, attendance));
    }
}
