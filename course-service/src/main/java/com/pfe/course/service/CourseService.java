package com.pfe.course.service;

import com.pfe.course.entity.Course;
import com.pfe.course.entity.Module;
import com.pfe.course.repository.CourseRepository;
import com.pfe.course.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;

    // ── Course CRUD ──

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
    }

    public Course updateCourse(Long id, Course updated) {
        Course course = getCourseById(id);
        if (updated.getName() != null) course.setName(updated.getName());
        if (updated.getDescription() != null) course.setDescription(updated.getDescription());
        if (updated.getProfessorId() != null) course.setProfessorId(updated.getProfessorId());
        if (updated.getCredits() != null) course.setCredits(updated.getCredits());
        if (updated.getSemester() != null) course.setSemester(updated.getSemester());
        if (updated.getModule() != null) course.setModule(updated.getModule());
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }

    public List<Course> getCoursesByProfessor(Long professorId) {
        return courseRepository.findByProfessorId(professorId);
    }

    // ── Module CRUD ──

    public Module createModule(Module module) {
        if (moduleRepository.existsByName(module.getName())) {
            throw new RuntimeException("Module name already exists");
        }
        return moduleRepository.save(module);
    }

    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    public Module getModuleById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + id));
    }

    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }
}
