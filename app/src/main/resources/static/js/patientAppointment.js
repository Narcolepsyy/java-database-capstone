import { getPatientAppointments, getPatientData, filterAppointments, cancelAppointment } from "./services/patientServices.js";

const tableBody = document.getElementById("patientTableBody");
const token = localStorage.getItem("token");

let allAppointments = [];
let filteredAppointments = [];
let patientId = null; 

document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
  try {
    if (!token) throw new Error("No token found");

    const patient = await getPatientData(token);
    if (!patient) throw new Error("Failed to fetch patient details");

    patientId = Number(patient.id);

    const appointmentData = await getPatientAppointments(patientId, token ,"patient") || [];
    allAppointments = appointmentData.filter(app => app.patientId === patientId);

    renderAppointments(allAppointments);
  } catch (error) {
    console.error("Error loading appointments:", error);
    alert("❌ Failed to load your appointments.");
  }
}

function renderAppointments(appointments) {
  tableBody.innerHTML = "";

  const actionTh = document.querySelector("#patientTable thead tr th:last-child");
  if (actionTh) {
    actionTh.style.display = "table-cell"; // Always show "Actions" column
  }

  if (!appointments.length) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No Appointments Found</td></tr>`;
    return;
  }

  appointments.forEach(appointment => {
    const tr = document.createElement("tr");

    // Check if appointment is in the future
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTimeOnly}`);
    const now = new Date();
    const isFuture = appointmentDateTime > now;

    // Create action buttons based on appointment status and timing
    let actionButtons = "";
    if (appointment.status == 0 && isFuture) {
      // Future appointments can be edited and cancelled
      actionButtons = `
        <div class="action-buttons">
          <img src="../assets/images/edit/edit.png" alt="Edit" class="edit-btn" data-id="${appointment.id}" title="Edit Appointment">
          <button class="cancel-btn" data-id="${appointment.id}" title="Cancel Appointment">Cancel</button>
        </div>
      `;
    } else if (appointment.status == 0) {
      // Past appointments can only be viewed
      actionButtons = `<span class="past-appointment">Past</span>`;
    } else {
      actionButtons = "-";
    }

    tr.innerHTML = `
      <td>${appointment.patientName || "You"}</td>
      <td>${appointment.doctorName}</td>
      <td>${appointment.appointmentDate}</td>
      <td>${appointment.appointmentTimeOnly}</td>
      <td>${actionButtons}</td>
    `;

    // Add event listeners for buttons
    if (appointment.status == 0 && isFuture) {
      const editBtn = tr.querySelector(".edit-btn");
      const cancelBtn = tr.querySelector(".cancel-btn");

      editBtn?.addEventListener("click", () => redirectToUpdatePage(appointment));
      cancelBtn?.addEventListener("click", () => handleCancelAppointment(appointment.id));
    }

    tableBody.appendChild(tr);
  });
}

// Function to handle appointment cancellation
async function handleCancelAppointment(appointmentId) {
  // Show confirmation dialog
  const confirmed = confirm("Are you sure you want to cancel this appointment? This action cannot be undone.");

  if (!confirmed) return;

  try {
    // Show loading state
    const cancelBtn = document.querySelector(`[data-id="${appointmentId}"].cancel-btn`);
    if (cancelBtn) {
      cancelBtn.disabled = true;
      cancelBtn.textContent = "Canceling...";
    }

    // Call the cancel API
    const result = await cancelAppointment(appointmentId, token);

    if (result.success) {
      alert("✅ " + result.message);

      // Refresh the appointments list
      const appointmentData = await getPatientAppointments(patientId, token, "patient") || [];
      allAppointments = appointmentData.filter(app => app.patientId === patientId);
      renderAppointments(allAppointments);

    } else {
      alert("❌ " + result.message);

      // Re-enable the button if cancellation failed
      if (cancelBtn) {
        cancelBtn.disabled = false;
        cancelBtn.textContent = "Cancel";
      }
    }
  } catch (error) {
    console.error("Error canceling appointment:", error);
    alert("❌ An error occurred while canceling the appointment. Please try again.");

    // Re-enable the button
    const cancelBtn = document.querySelector(`[data-id="${appointmentId}"].cancel-btn`);
    if (cancelBtn) {
      cancelBtn.disabled = false;
      cancelBtn.textContent = "Cancel";
    }
  }
}

function redirectToUpdatePage(appointment) {
  // Prepare the query parameters
  const queryString = new URLSearchParams({
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName || "You",
    doctorName: appointment.doctorName,
    doctorId: appointment.doctorId,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTimeOnly,
  }).toString();

  // Redirect to the update page with the query string
  setTimeout(() => {
    window.location.href = `/pages/updateAppointment.html?${queryString}`;
  }, 100);
}


// Search and Filter Listeners
document.getElementById("searchBar").addEventListener("input", handleFilterChange);
document.getElementById("appointmentFilter").addEventListener("change", handleFilterChange);

async function handleFilterChange() {
  const searchBarValue = document.getElementById("searchBar").value.trim();
  const filterValue = document.getElementById("appointmentFilter").value;

  const name = searchBarValue || null;
  const condition = filterValue === "allAppointments"? null : filterValue || null;

  try {
    const response = await filterAppointments(condition, name, token);
    const appointments = response?.appointments || [];
    filteredAppointments = appointments.filter(app => app.patientId === patientId);

    renderAppointments(filteredAppointments);
  } catch (error) {
    console.error("Failed to filter appointments:", error);
    alert("❌ An error occurred while filtering appointments.");
  }
}
