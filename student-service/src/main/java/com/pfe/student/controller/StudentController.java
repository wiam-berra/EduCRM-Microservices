package com.pfe.student.controller;

import com.pfe.student.entity.Grade;
import com.pfe.student.entity.Student;
import com.pfe.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        return ResponseEntity.ok(studentService.createStudent(student));
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id,
                                                 @RequestBody Student student) {
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/grades")
    public ResponseEntity<Grade> addGrade(@PathVariable Long id,
                                          @RequestBody Grade grade) {
        return ResponseEntity.ok(studentService.addGrade(id, grade));
    }

    @GetMapping("/{id}/grades")
    public ResponseEntity<List<Grade>> getStudentGrades(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getGradesByStudentId(id));
    }

    @GetMapping("/{id}/average")
    public ResponseEntity<Map<String, Object>> getStudentAverage(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentAverage(id));
    }
}
