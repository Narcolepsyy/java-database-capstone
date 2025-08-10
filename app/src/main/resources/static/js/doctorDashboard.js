import { getAllAppointments, getAppointmentsByFilter } from "./services/appointmentRecordService.js";
import { createPatientRow } from "./components/patientRows.js";

const tableBody = document.getElementById("patientTableBody");
let selectedDate = new Date().toISOString().split('T')[0];
let token = localStorage.getItem("token");
let patientName = null;
let currentFilter = "today"; // Track current filter mode

document.getElementById("searchBar").addEventListener("input", (e) => {
  const value = e.target.value.trim();
  patientName = value.length > 0 ? value : "null";
  loadAppointments();
});

// Event Listener: Today's Appointments Button
document.getElementById("todayButton").addEventListener("click", () => {
  selectedDate = new Date().toISOString().split('T')[0];
  currentFilter = "today";
  document.getElementById("datePicker").value = selectedDate;
  document.getElementById("appointmentFilter").value = "today";
  loadAppointments();
});

// Event Listener: Appointment Filter Dropdown
document.getElementById("appointmentFilter").addEventListener("change", (e) => {
  currentFilter = e.target.value;

  if (currentFilter === "today") {
    selectedDate = new Date().toISOString().split('T')[0];
    document.getElementById("datePicker").value = selectedDate;
  }

  loadAppointments();
});

// Event Listener: Date Picker
document.getElementById("datePicker").addEventListener("change", (e) => {
  selectedDate = e.target.value;
  currentFilter = "today"; // When date is selected, switch to specific date mode
  document.getElementById("appointmentFilter").value = "today";
  loadAppointments();
});

async function loadAppointments() {
  try {
    let response;
    let appointments = [];

    if (currentFilter === "future" || currentFilter === "all") {
      // Use filter-based API for future and all appointments
      const filterCondition = currentFilter === "all" ? null : currentFilter;
      response = await getAppointmentsByFilter(filterCondition, patientName, token);
      appointments = response.appointments || [];
    } else {
      // Use date-specific API for today/specific date
      response = await getAllAppointments(selectedDate, patientName, token);
      appointments = response.appointments || [];
    }

    tableBody.innerHTML = "";

    if (appointments.length === 0) {
      const filterText = currentFilter === "future" ? "future appointments" :
                        currentFilter === "all" ? "appointments" :
                        "appointments for the selected date";
      tableBody.innerHTML = `<tr><td colspan="5">No ${filterText} found.</td></tr>`;
      return;
    }

    console.log(appointments);
    appointments.forEach(appointment => {
      const patient = {
        id: appointment.patientId,
        name: appointment.patientName,
        phone: appointment.patientPhone,
        email: appointment.patientEmail,
      };
      console.log(appointment.doctorId);
      const row = createPatientRow(patient, appointment.id, appointment.doctorId);
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading appointments:", error);
    tableBody.innerHTML = `<tr><td colspan="5">Error loading appointments. Try again later.</td></tr>`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderContent();
  loadAppointments();
});
