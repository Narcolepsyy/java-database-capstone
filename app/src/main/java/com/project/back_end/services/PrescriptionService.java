package com.project.back_end.services;

import com.project.back_end.models.Prescription;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.PrescriptionRepository;
import com.project.back_end.repo.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PrescriptionService {
    
    private final PrescriptionRepository prescriptionRepository;
    private final TokenService tokenService;
    private final PatientRepository patientRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository, TokenService tokenService, PatientRepository patientRepository)
    {
        this.prescriptionRepository=prescriptionRepository;
        this.tokenService = tokenService;
        this.patientRepository = patientRepository;
    }

    public ResponseEntity<Map<String, String>> savePrescription(Prescription prescription)
    {
        Map<String, String> map=new HashMap<>();
        try{
            List<Prescription> result=prescriptionRepository.findByAppointmentId(prescription.getAppointmentId());
            if(result.isEmpty())
            {
                if (prescription.getCreatedDate() == null) {
                    prescription.setCreatedDate(LocalDate.now());
                }
                prescriptionRepository.save(prescription);
                map.put("message","Prescription saved");
                return ResponseEntity.status(HttpStatus.CREATED).body(map); 
            }
            map.put("message","prescription already exists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map); 
            
        }
        catch(Exception e)
        {
            System.out.println("Error: "+e);
            map.put("message","Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map); 
        }
    } 

    public ResponseEntity<Map<String, Object>> getPrescription(Long appointmentId)
    {
        Map<String, Object> map=new HashMap<>();

        try{
            
            map.put("prescription",prescriptionRepository.findByAppointmentId(appointmentId));
            return ResponseEntity.status(HttpStatus.OK).body(map); 
        }
        catch(Exception e)
        {
            System.out.println("Error: "+e);
            map.put("error","Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map); 
        }
    }

    // New method for patients to get their prescriptions by patient name
    public ResponseEntity<Map<String, Object>> getPatientPrescriptions(String patientName)
    {
        Map<String, Object> map = new HashMap<>();

        try {
            List<Prescription> prescriptions = prescriptionRepository.findByPatientName(patientName);
            map.put("prescriptions", prescriptions);
            map.put("count", prescriptions.size());
            return ResponseEntity.status(HttpStatus.OK).body(map);
        }
        catch(Exception e)
        {
            System.out.println("Error: " + e);
            map.put("error", "Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
        }
    }

    // New: allow patient to delete their own prescription
    public ResponseEntity<Map<String, String>> deletePrescription(String id, String token) {
        Map<String, String> map = new HashMap<>();
        try {
            Optional<Prescription> opt = prescriptionRepository.findById(id);
            if (opt.isEmpty()) {
                map.put("message", "Prescription not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(map);
            }
            Prescription prescription = opt.get();
            String email = tokenService.extractEmail(token);
            if (email == null || email.isEmpty()) {
                map.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(map);
            }
            Patient patient = patientRepository.findByEmail(email);
            if (patient == null) {
                map.put("message", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(map);
            }
            if (patient.getName() == null || !patient.getName().equalsIgnoreCase(prescription.getPatientName())) {
                map.put("message", "You are not authorized to delete this prescription");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(map);
            }
            prescriptionRepository.deleteById(id);
            map.put("message", "Prescription removed successfully");
            return ResponseEntity.status(HttpStatus.OK).body(map);
        } catch (Exception e) {
            System.out.println("Error: "+e);
            map.put("message", "Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
        }
    }
}
