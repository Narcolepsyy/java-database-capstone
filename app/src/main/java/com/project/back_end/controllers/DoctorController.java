package com.project.back_end.controllers;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Doctor;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.path}doctor")
public class DoctorController {

// 1. Set Up the Controller Class:
//    - Annotate the class with `@RestController` to define it as a REST controller that serves JSON responses.
//    - Use `@RequestMapping("${api.path}doctor")` to prefix all endpoints with a configurable API path followed by "doctor".
//    - This class manages doctor-related functionalities such as registration, login, updates, and availability.


// 2. Autowire Dependencies:
//    - Inject `DoctorService` for handling the core logic related to doctors (e.g., CRUD operations, authentication).
//    - Inject the shared `Service` class for general-purpose features like token validation and filtering.
final private DoctorService doctorService;
final private Service service;
@Autowired
public DoctorController(DoctorService doctorService, Service service) {
    this.doctorService = doctorService;
    this.service = service;
}

// 3. Define the `getDoctorAvailability` Method:
//    - Handles HTTP GET requests to check a specific doctor’s availability on a given date.
//    - Requires `user` type, `doctorId`, `date`, and `token` as path variables.
//    - First validates the token against the user type.
//    - If the token is invalid, returns an error response; otherwise, returns the availability status for the doctor.
@GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
public ResponseEntity<Map<String, Object>> getDoctorAvailability(
        @PathVariable String user,
        @PathVariable Long doctorId,
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @PathVariable String token) {

    Map<String, Object> map = new HashMap<>();
    ResponseEntity<Map<String, String>> tempMap = service.validateToken(token, user);

    // Use the working logic from your second version
    if (!tempMap.getBody().isEmpty()) {
        map.putAll(tempMap.getBody());
        return new ResponseEntity<>(map, tempMap.getStatusCode());
    }

    map.put("availability", doctorService.getDoctorAvailability(doctorId, date));
    return ResponseEntity.ok(map);
}

// 4. Define the `getDoctor` Method:
//    - Handles HTTP GET requests to retrieve a list of all doctors.
//    - Returns the list within a response map under the key `"doctors"` with HTTP 200 OK status.
@GetMapping
@Transactional(readOnly = true) // Add transaction to keep session open during serialization
public ResponseEntity<Map<String, Object>> getDoctor() {
    Map<String, Object> map = new HashMap<>();
    List<Doctor> doctors = doctorService.getDoctors();

    // Force initialization of the availableTimes collection for each doctor
    doctors.forEach(doctor -> {
        // Access the collection to initialize it
        if (doctor.getAvailableTimes() != null) {
            doctor.getAvailableTimes().size();
        }
    });

    map.put("doctors", doctors);
    return ResponseEntity.ok(map);
}

// 5. Define the `saveDoctor` Method:
//    - Handles HTTP POST requests to register a new doctor.
//    - Accepts a validated `Doctor` object in the request body and a token for authorization.
//    - Validates the token for the `"admin"` role before proceeding.
//    - If the doctor already exists, returns a conflict response; otherwise, adds the doctor and returns a success message.
@PostMapping("/{token}")
public ResponseEntity<Map<String, String>> saveDoctor(
        @RequestBody @Valid Doctor doctor,
        @PathVariable String token) {

    ResponseEntity<Map<String, String>> tempMap = service.validateToken(token, "admin");
    if (!tempMap.getBody().isEmpty()) {
        return tempMap;
    }

    int result = doctorService.saveDoctor(doctor);
    Map<String, String> response = new HashMap<>();

    if (result == 1) {
        response.put("message", "Doctor registered successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } else if (result == -1) {
        response.put("message", "Doctor already exists");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    } else {
        response.put("message", "Failed to register doctor");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

// 6. Define the `doctorLogin` Method:
//    - Handles HTTP POST requests for doctor login.
//    - Accepts a validated `Login` DTO containing credentials.
//    - Delegates authentication to the `DoctorService` and returns login status and token information.
@PostMapping("/login")
public ResponseEntity<Map<String, String>> doctorLogin(@RequestBody @Valid Login login) {
    return doctorService.validateDoctor(login);
}

// 7. Define the `updateDoctor` Method:
//    - Handles HTTP PUT requests to update an existing doctor's information.
//    - Accepts a validated `Doctor` object and a token for authorization.
//    - Token must belong to an `"admin"`.
//    - If the doctor exists, updates the record and returns success; otherwise, returns not found or error messages.
@PutMapping("/{token}")
public ResponseEntity<Map<String, String>> updateDoctor(
        @RequestBody @Valid Doctor doctor,
        @PathVariable String token) {

    ResponseEntity<Map<String, String>> tempMap = service.validateToken(token, "admin");
    if (!tempMap.getBody().isEmpty()) {
        return tempMap;
    }

    int result = doctorService.updateDoctor(doctor);
    Map<String, String> response = new HashMap<>();

    if (result == 1) {
        response.put("message", "Doctor updated successfully");
        return ResponseEntity.ok(response);
    } else if (result == 2) {
        response.put("message", "Doctor not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    } else {
        response.put("message", "Failed to update doctor");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

// 8. Define the `deleteDoctor` Method:
//    - Handles HTTP DELETE requests to remove a doctor by ID.
//    - Requires both doctor ID and an admin token as path variables.
//    - If the doctor exists, deletes the record and returns a success message; otherwise, responds with a not found or error message.
@DeleteMapping("/{id}/{token}")
public ResponseEntity<Map<String, String>> deleteDoctor(
        @PathVariable Long id,
        @PathVariable String token) {

    Map<String, String> response = new HashMap<>();
    ResponseEntity<Map<String, String>> tempMap = service.validateToken(token, "admin");

    if (!tempMap.getBody().isEmpty()) {
        return tempMap;
    }

    int result = doctorService.deleteDoctor(id);
    if (result == 1) {
        response.put("message", "Doctor deleted successfully with id: " + id);
        return ResponseEntity.ok(response); // 200 OK for successful deletion
    } else if (result == -1) {
        response.put("message", "Doctor not found with id: " + id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    response.put("message", "Some internal error occurred");
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
}

// 9. Define the `filter` Method:
//    - Handles HTTP GET requests to filter doctors based on name, time, and specialty.
//    - Accepts `name`, `time`, and `speciality` as path variables.
//    - Calls the shared `Service` to perform filtering logic and returns matching doctors in the response.
@GetMapping("/filter/{name}/{time}/{speciality}")
public ResponseEntity<Map<String, Object>> filter(@PathVariable String name, @PathVariable String time, @PathVariable String speciality)
{
    Map<String,Object> map=new HashMap<>();
    map=service.filterDoctor(name, speciality, time);
    return ResponseEntity.status(HttpStatus.OK).body(map);
}
}
