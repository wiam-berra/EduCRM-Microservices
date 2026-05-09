package com.pfe.student.service;

import com.pfe.student.entity.Grade;
import com.pfe.student.entity.Student;
import com.pfe.student.repository.GradeRepository;
import com.pfe.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final GradeRepository gradeRepository;

    // ── Student CRUD ──

    public Student createStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new RuntimeException("Student email already exists");
        }
        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    public Student updateStudent(Long id, Student updated) {
        Student student = getStudentById(id);
        if (updated.getFirstName() != null) student.setFirstName(updated.getFirstName());
        if (updated.getLastName() != null) student.setLastName(updated.getLastName());
        if (updated.getEmail() != null) student.setEmail(updated.getEmail());
        if (updated.getDateOfBirth() != null) student.setDateOfBirth(updated.getDateOfBirth());
        if (updated.getLevel() != null) student.setLevel(updated.getLevel());
        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    // ── Grades ──

    public Grade addGrade(Long studentId, Grade grade) {
        getStudentById(studentId); // Verify student exists
        grade.setStudentId(studentId);
        return gradeRepository.save(grade);
    }

    public List<Grade> getGradesByStudentId(Long studentId) {
        return gradeRepository.findByStudentId(studentId);
    }

    public Map<String, Object> getStudentAverage(Long studentId) {
        getStudentById(studentId);
        Double average = gradeRepository.getAverageByStudentId(studentId);
        Map<String, Object> result = new HashMap<>();
        result.put("studentId", studentId);
        result.put("average", average != null ? Math.round(average * 100.0) / 100.0 : 0.0);
        result.put("totalGrades", gradeRepository.findByStudentId(studentId).size());
        return result;
    }
}
