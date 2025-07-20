DELIMITER $$

CREATE PROCEDURE GetDailyAppointmentReportByDoctor(
    IN report_date DATE
)
BEGIN
SELECT
    d.name AS doctor_name,
    a.appointment_time,
    a.status,
    p.name as patient_name,
    p.phone as patient_phone
FROM
    appointment a
        JOIN
    doctor d ON a.doctor_id = d.id
        JOIN
    patient p ON a.patient_id = p.id
WHERE DATE(a.appointment_time) = report_date
ORDER BY
    d.name, a.appointment_time;
end $$

DELIMITER ;

CALL GetDailyAppointmentReportByDoctor('2025-04-15');