DELIMITER $$
CREATE PROCEDURE GetDoctorWithMostPatientsByMonth (
    IN input_month INT,
    IN input_year INT
)
BEGIN
SELECT
    doctor_id,
    COUNT(patient_id) AS patient_seen
FROM
    appointment
WHERE
    MONTH(appointment_time) = input_month
  AND YEAR(appointment_time) = input_year
GROUP BY
    doctor_id
ORDER BY patient_seen DESC
    LIMIT 1;
end $$ ;
DELIMITER ;

CALL GetDoctorWithMostPatientsByMonth(4, 2025);