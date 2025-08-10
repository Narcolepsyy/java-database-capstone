// AppointmentService.java
package com.project.back_end.services;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final com.project.back_end.services.Service service;
    private final TokenService tokenService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
            com.project.back_end.services.Service service, TokenService tokenService,
            PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.service = service;
        this.tokenService = tokenService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public int bookAppointment(Appointment appointment) {
        try {
            appointmentRepository.save(appointment);
            return 1;
        } catch (Exception e) {
            System.out.println("Error: " + e);
            return 0;
        }
    }

    public ResponseEntity<Map<String, String>> updateAppointment(Appointment appointment) {
        Map<String, String> response = new HashMap<>();

        Optional<Appointment> result = appointmentRepository.findById(appointment.getId());
        if (!result.isPresent()) {
            response.put("message", "No appointment available with id: " + appointment.getId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (result.get().getPatient().getId() != appointment.getPatient().getId()) {
            response.put("message", "Patient Id mismatch");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        int out = service.validateAppointment(appointment);
        if (out == 1) {
            try {
                appointmentRepository.save(appointment);
                response.put("message", "Appointment Updated Successfully");
                return ResponseEntity.status(HttpStatus.OK).body(response);

            } catch (Exception e) {
                System.out.println("Error: " + e);
                response.put("message", "Internal Server Error");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

        } else if (out == -1) {
            response.put("message", "Invalid doctor id");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.put("message", "Appointment already booked for given time or Doctor not available");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);

    }

    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(long id, String token) {
        Map<String, String> response = new HashMap<>();

        try {
            // First check if appointment exists
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
            if (appointmentOpt.isEmpty()) {
                response.put("message", "No appointment found with id: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Appointment appointment = appointmentOpt.get();

            // Extract and validate token
            if (token == null || token.trim().isEmpty()) {
                response.put("message", "Token is required");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String extractedEmail;
            try {
                extractedEmail = tokenService.extractEmail(token);
                if (extractedEmail == null || extractedEmail.trim().isEmpty()) {
                    response.put("message", "Invalid token - no email found");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            } catch (Exception e) {
                System.err.println("Token extraction error: " + e.getMessage());
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Find patient by email
            Patient patient = patientRepository.findByEmail(extractedEmail);
            if (patient == null) {
                response.put("message", "Patient not found for the provided token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Check if patient owns this appointment - Fix: Use .equals() for Long comparison
            if (!patient.getId().equals(appointment.getPatient().getId())) {
                response.put("message", "You are not authorized to cancel this appointment");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Check if appointment can be cancelled (optional business rule)
            if (appointment.getAppointmentTime().isBefore(LocalDateTime.now())) {
                response.put("message", "Cannot cancel past appointments");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Delete the appointment
            appointmentRepository.deleteById(id);

            response.put("message", "Appointment cancelled successfully");
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            System.err.println("Error canceling appointment: " + e.getMessage());
            e.printStackTrace();
            response.put("message", "Internal server error occurred while canceling appointment");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Transactional
    public Map<String, Object> getAppointment(String pname, LocalDate date, String token) {
        Map<String, Object> map = new HashMap<>();
        String extractedEmail = tokenService.extractEmail(token);
        Long doctorId = doctorRepository.findByEmail(extractedEmail).getId();

        // Use the provided date parameter, not today's date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Appointment> appointments;

        if (pname.equals("null")) {
            // Get appointments for the specific date only
            appointments = appointmentRepository
                    .findByDoctorIdAndAppointmentTimeBetween(doctorId, startOfDay, endOfDay);
        } else {
            // Filter by patient name for the specific date
            appointments = appointmentRepository
                    .findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(
                            doctorId, pname, startOfDay, endOfDay);
        }

        List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(app -> new AppointmentDTO(
                        app.getId(),
                        app.getDoctor().getId(),
                        app.getDoctor().getName(),
                        app.getPatient().getId(),
                        app.getPatient().getName(),
                        app.getPatient().getEmail(),
                        app.getPatient().getPhone(),
                        app.getPatient().getAddress(),
                        app.getAppointmentTime(),
                        app.getStatus()))
                .collect(Collectors.toList());

        map.put("appointments", appointmentDTOs);
        return map;
    }

    @Transactional
    public void changeStatus(long appointmentId)
    {
        appointmentRepository.updateStatus(1, appointmentId);
    }

    // New method for doctors to filter appointments by condition
    @Transactional
    public Map<String, Object> getDoctorAppointmentsByFilter(String condition, String patientName, String token) {
        Map<String, Object> map = new HashMap<>();

        try {
            String extractedEmail = tokenService.extractEmail(token);
            Long doctorId = doctorRepository.findByEmail(extractedEmail).getId();

            List<Appointment> appointments;

            if (condition == null || condition.equals("null")) {
                // Get all appointments for this doctor
                if (patientName == null || patientName.equals("null")) {
                    appointments = appointmentRepository.findByDoctorId(doctorId);
                } else {
                    appointments = appointmentRepository.findByDoctorIdAndPatient_NameContainingIgnoreCase(doctorId, patientName);
                }
            } else if (condition.equals("future")) {
                // Get future appointments only
                LocalDateTime now = LocalDateTime.now();
                if (patientName == null || patientName.equals("null")) {
                    appointments = appointmentRepository.findByDoctorIdAndAppointmentTimeAfter(doctorId, now);
                } else {
                    appointments = appointmentRepository.findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeAfter(doctorId, patientName, now);
                }
            } else {
                map.put("error", "Invalid filter condition");
                map.put("appointments", List.of());
                return map;
            }

            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(app -> new AppointmentDTO(
                            app.getId(),
                            app.getDoctor().getId(),
                            app.getDoctor().getName(),
                            app.getPatient().getId(),
                            app.getPatient().getName(),
                            app.getPatient().getEmail(),
                            app.getPatient().getPhone(),
                            app.getPatient().getAddress(),
                            app.getAppointmentTime(),
                            app.getStatus()))
                    .collect(Collectors.toList());

            map.put("appointments", appointmentDTOs);
            return map;

        } catch (Exception e) {
            System.err.println("Error filtering doctor appointments: " + e.getMessage());
            map.put("error", "Internal server error");
            map.put("appointments", List.of());
            return map;
        }
    }

}
