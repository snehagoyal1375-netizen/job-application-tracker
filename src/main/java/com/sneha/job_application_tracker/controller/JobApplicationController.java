package com.sneha.job_application_tracker.controller;

import com.sneha.job_application_tracker.model.JobApplication;
import com.sneha.job_application_tracker.repository.JobApplicationRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class JobApplicationController {

    private final JobApplicationRepository repository;

    public JobApplicationController(
            JobApplicationRepository repository) {
        this.repository = repository;
    }

    // Add application
    @PostMapping
    public JobApplication createApplication(
            @RequestBody JobApplication application) {

        return repository.save(application);
    }

    // Get all applications
    @GetMapping
    public List<JobApplication> getAllApplications() {

        return repository.findAll();
    }

    // Get application by ID
    @GetMapping("/{id}")
    public JobApplication getApplicationById(
            @PathVariable Long id) {

        return repository.findById(id).orElse(null);
    }

    // Update application
    @PutMapping("/{id}")
    public JobApplication updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplication application) {

        JobApplication existingApplication =
                repository.findById(id).orElse(null);

        if (existingApplication == null) {
            return null;
        }

        existingApplication.setCompany(
                application.getCompany());

        existingApplication.setRole(
                application.getRole());

        existingApplication.setApplicationDate(
                application.getApplicationDate());

        existingApplication.setInterviewDate(
                application.getInterviewDate());

        existingApplication.setJobLink(
                application.getJobLink());

        existingApplication.setStatus(
                application.getStatus());

        existingApplication.setNotes(
                application.getNotes());

        return repository.save(existingApplication);
    }

    // Delete application
    @DeleteMapping("/{id}")
    public String deleteApplication(
            @PathVariable Long id) {

        repository.deleteById(id);

        return "Application deleted successfully";
    }
}