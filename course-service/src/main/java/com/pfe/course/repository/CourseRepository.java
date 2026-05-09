package com.pfe.course.repository;

import com.pfe.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByProfessorId(Long professorId);
    List<Course> findByModuleId(Long moduleId);
}
