package com.project.back_end.repo;

import com.project.back_end.models.Appointment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

   // 1. Extend JpaRepository:
//    - The repository extends JpaRepository<Appointment, Long>, which gives it basic CRUD functionality.
//    - The methods such as save, delete, update, and find are inherited without the need for explicit implementation.
//    - JpaRepository also includes pagination and sorting features.

// Example: public interface AppointmentRepository extends JpaRepository<Appointment, Long> {}

// 2. Custom Query Methods:

//    - **findByDoctorIdAndAppointmentTimeBetween**:
//      - This method retrieves a list of appointments for a specific doctor within a given time range.
//      - The doctor’s available times are eagerly fetched to avoid lazy loading.
//      - Return type: List<Appointment>
//      - Parameters: Long doctorId, LocalDateTime start, LocalDateTime end
//      - It uses a LEFT JOIN to fetch the doctor’s available times along with the appointments.
@Query("SELECT a FROM Appointment  a LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH a.doctor.availableTimes WHERE a.doctor.id = ?1 AND a.appointmentTime BETWEEN ?2 AND ?3")
    List<Appointment> findByDoctorIdAndAppointmentTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);
//    - **findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween**:
//      - This method retrieves appointments for a specific doctor and patient name (ignoring case) within a given time range.
//      - It performs a LEFT JOIN to fetch both the doctor and patient details along with the appointment times.
//      - Return type: List<Appointment>
//      - Parameters: Long doctorId, String patientName, LocalDateTime start, LocalDateTime end
@Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH a.patient p WHERE a.doctor.id = ?1 AND LOWER(p.name) LIKE LOWER(CONCAT('%', ?2, '%')) AND a.appointmentTime BETWEEN ?3 AND ?4")
List<Appointment> findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(
        Long doctorId, String patientName, LocalDateTime start, LocalDateTime end);
//    - **deleteAllByDoctorId**:
//      - This method deletes all appointments associated with a particular doctor.
//      - It is marked as @Modifying and @Transactional, which makes it a modification query, ensuring that the operation is executed within a transaction.
//      - Return type: void
//      - Parameters: Long doctorId
@Modifying
    @Transactional
@Query("DELETE FROM Appointment a WHERE a.doctor.id = ?1")
    void deleteAllByDoctorId(Long doctorId);

//    - **findByPatientId**:
//      - This method retrieves all appointments for a specific patient.
//      - Return type: List<Appointment>
//      - Parameters: Long patientId
    @Query("SELECT a from Appointment a WHERE a.patient.id = ?1")
List <Appointment> findByPatientId(Long patientId);
//    - **findByPatient_IdAndStatusOrderByAppointmentTimeAsc**:
//      - This method retrieves all appointments for a specific patient with a given status, ordered by the appointment time.
//      - Return type: List<Appointment>
//      - Parameters: Long patientId, int status
@Query("SELECT a FROM Appointment a WHERE a.patient.id = ?1 AND a.status = ?2 ORDER BY a.appointmentTime ASC")
List <Appointment> findByPatient_IdAndStatusOrderByAppointmentTimeAsc(Long patientId, int status);
//    - **filterByDoctorNameAndPatientId**:
//      - This method retrieves appointments based on a doctor’s name (using a LIKE query) and the patient’s ID.
//      - Return type: List<Appointment>
//      - Parameters: String doctorName, Long patientId
@Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', ?1, '%')) AND a.patient.id = ?2")
List<Appointment> filterByDoctorNameAndPatientId(String doctorName, Long patientId);
//    - **filterByDoctorNameAndPatientIdAndStatus**:
//      - This method retrieves appointments based on a doctor’s name (using a LIKE query), patient’s ID, and a specific appointment status.
//      - Return type: List<Appointment>
//      - Parameters: String doctorName, Long patientId, int status
@Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', ?1, '%')) AND a.patient.id = ?2 AND a.status = ?3")
List<Appointment> filterByDoctorNameAndPatientIdAndStatus(String doctorName, Long patientId, int status);

//    - **updateStatus**:
//      - This method updates the status of a specific appointment based on its ID.
//      - Return type: void
//      - Parameters: int status, long id
@Modifying
@Transactional
@Query("UPDATE Appointment a SET a.status = ?1 WHERE a.id = ?2")
void updateStatus(int status, long id);



// 3. @Modifying and @Transactional annotations:
//    - The @Modifying annotation is used to indicate that the method performs a modification operation (like DELETE or UPDATE).
//    - The @Transactional annotation ensures that the modification is done within a transaction, meaning that if any exception occurs, the changes will be rolled back.

// 4. @Repository annotation:
//    - The @Repository annotation marks this interface as a Spring Data JPA repository.
//    - Spring Data JPA automatically implements this repository, providing the necessary CRUD functionality and custom queries defined in the interface.

}
