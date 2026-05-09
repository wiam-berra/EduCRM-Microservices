package com.pfe.course.controller;

import com.pfe.course.entity.Course;
import com.pfe.course.entity.Module;
import com.pfe.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // ── Course Endpoints ──

    @PostMapping("/api/courses")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.createCourse(course));
    }

    @GetMapping("/api/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/api/courses/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PutMapping("/api/courses/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id,
                                               @RequestBody Course course) {
        return ResponseEntity.ok(courseService.updateCourse(id, course));
    }

    @DeleteMapping("/api/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/courses/professor/{profId}")
    public ResponseEntity<List<Course>> getCoursesByProfessor(@PathVariable Long profId) {
        return ResponseEntity.ok(courseService.getCoursesByProfessor(profId));
    }

    // ── Module Endpoints ──

    @PostMapping("/api/modules")
    public ResponseEntity<Module> createModule(@RequestBody Module module) {
        return ResponseEntity.ok(courseService.createModule(module));
    }

    @GetMapping("/api/modules")
    public ResponseEntity<List<Module>> getAllModules() {
        return ResponseEntity.ok(courseService.getAllModules());
    }

    @GetMapping("/api/modules/{id}")
    public ResponseEntity<Module> getModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getModuleById(id));
    }

    @DeleteMapping("/api/modules/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        courseService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }
}
