package com.pfe.course.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    private Long professorId;

    private Integer credits;

    @Column(length = 20)
    private String semester;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id")
    private Module module;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
