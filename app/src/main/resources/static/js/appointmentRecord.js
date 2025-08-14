import { getAppointments } from "./components/appointmentRow.js";
import { getAppointmentRecord } from "./services/appointmentRecordService.js";

const tableBody = document.getElementById("patientTableBody");
const filterSelect = document.getElementById("appointmentFilter");

async function loadAppointments(filter = "future") {
  const appointments = await getAppointmentRecord();

  if (!appointments || appointments.length === 0) {
    tableBody.innerHTML = `<tr><td class="noPatientRecord" colspan='5'>No appointments found.</td></tr>`;
    return;
  }

  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate date 3 months from now for limiting "upcoming" range
  const threeMonthsFromNow = new Date(today);
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  let filteredAppointments = appointments;

  if (filter === "future") {
    // Only show appointments between today and 3 months from now
    filteredAppointments = appointments.filter(app => {
      // Ensure we're working with a proper Date object
      let appointmentDate;
      try {
        // Handle different date formats from the API
        if (typeof app.date === 'string') {
          // If date is in ISO format or contains 'T', parse it directly
          if (app.date.includes('T')) {
            appointmentDate = new Date(app.date);
          } else if (app.date.includes('-')) {
            // Handle YYYY-MM-DD format
            const [year, month, day] = app.date.split('-');
            appointmentDate = new Date(year, month - 1, day); // month is 0-indexed
          } else {
            // Try regular parsing as fallback
            appointmentDate = new Date(app.date);
          }
        } else {
          // If it's already a Date object or timestamp
          appointmentDate = new Date(app.date);
        }

        // Reset time component for fair comparison
        appointmentDate.setHours(0, 0, 0, 0);

        // Check if date is within range (today to 3 months from now)
        return appointmentDate >= today && appointmentDate <= threeMonthsFromNow;
      } catch (e) {
        console.error("Error parsing date:", app.date, e);
        return false;
      }
    });
  } else if (filter === "past") {
    filteredAppointments = appointments.filter(app => {
      try {
        let appointmentDate;
        if (typeof app.date === 'string') {
          if (app.date.includes('T')) {
            appointmentDate = new Date(app.date);
          } else if (app.date.includes('-')) {
            const [year, month, day] = app.date.split('-');
            appointmentDate = new Date(year, month - 1, day);
          } else {
            appointmentDate = new Date(app.date);
          }
        } else {
          appointmentDate = new Date(app.date);
        }
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate < today;
      } catch (e) {
        console.error("Error parsing date:", app.date, e);
        return false;
      }
    });
  } else if (filter === "allAppointments") {
    // Keep all appointments
    filteredAppointments = appointments;
  }

  if (filteredAppointments.length === 0) {
    tableBody.innerHTML = `<tr><td class="noPatientRecord" colspan='5'>No ${filter === 'future' ? 'upcoming' : filter} appointments found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";
  filteredAppointments.forEach(appointment => {
    const row = getAppointments(appointment);
    tableBody.appendChild(row);
  });
}

// Handle filter change
filterSelect.addEventListener("change", (e) => {
  const selectedFilter = e.target.value;
  loadAppointments(selectedFilter);
});

// Load upcoming appointments by default
loadAppointments("future");
