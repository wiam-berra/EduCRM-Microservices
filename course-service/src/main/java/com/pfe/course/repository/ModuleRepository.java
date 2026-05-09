package com.pfe.course.repository;

import com.pfe.course.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    boolean existsByName(String name);
}
