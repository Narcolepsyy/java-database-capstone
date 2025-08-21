import { getPatientPrescriptions, deletePrescription } from "./services/prescriptionServices.js";
import { getPatientData } from "./services/patientServices.js";

const prescriptionsContainer = document.getElementById("prescriptionsContainer");
const noPrescriptionsDiv = document.getElementById("noPrescriptions");
const searchBar = document.getElementById("searchBar");
const token = localStorage.getItem("token");

let allPrescriptions = [];
let filteredPrescriptions = [];

document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
  try {
    if (!token) {
      throw new Error("No token found. Please log in again.");
    }

    // Get patient data to retrieve patient name
    const patient = await getPatientData(token);
    if (!patient) {
      throw new Error("Failed to fetch patient details");
    }

    // Fetch patient's prescriptions
    const prescriptionData = await getPatientPrescriptions(patient.name, token);
    allPrescriptions = prescriptionData.prescriptions || [];
    filteredPrescriptions = [...allPrescriptions];

    renderPrescriptions(filteredPrescriptions);
  } catch (error) {
    console.error("Error loading prescriptions:", error);
    showError("❌ Failed to load your prescriptions. Please try again later.");
  }
}

function renderPrescriptions(prescriptions) {
  prescriptionsContainer.innerHTML = "";
  noPrescriptionsDiv.style.display = "none";

  if (!prescriptions.length) {
    noPrescriptionsDiv.style.display = "block";
    return;
  }

  prescriptions.forEach(prescription => {
    const prescriptionCard = createPrescriptionCard(prescription);
    prescriptionsContainer.appendChild(prescriptionCard);
  });
}

function createPrescriptionCard(prescription) {
  const card = document.createElement("div");
  card.className = "prescription-card";

  const created = prescription.createdDate ? new Date(prescription.createdDate).toLocaleDateString() : "—";
  const ended = prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : "—";

  card.innerHTML = `
    <div class="prescription-header">
      <h3 class="medication-name">${prescription.medication}</h3>
      <span class="prescription-id">ID: ${prescription.id}</span>
    </div>
    <div class="prescription-details">
      <div class="detail-row">
        <span class="label">Dosage:</span>
        <span class="value">${prescription.dosage}</span>
      </div>
      <div class="detail-row">
        <span class="label">Patient:</span>
        <span class="value">${prescription.patientName}</span>
      </div>
      <div class="detail-row">
        <span class="label">Appointment ID:</span>
        <span class="value">${prescription.appointmentId}</span>
      </div>
      <div class="detail-row">
        <span class="label">Created Date:</span>
        <span class="value">${created}</span>
      </div>
      <div class="detail-row">
        <span class="label">End Date:</span>
        <span class="value">${ended}</span>
      </div>
      ${prescription.doctorNotes ? `
        <div class="detail-row notes">
          <span class="label">Doctor's Notes:</span>
          <span class="value">${prescription.doctorNotes}</span>
        </div>
      ` : ''}
      <div class="detail-row" style="justify-content:flex-end;border-bottom:none;">
        <button class="cancel-btn" data-prescription-id="${prescription.id}">Remove</button>
      </div>
    </div>
  `;

  // Wire delete
  const deleteBtn = card.querySelector('[data-prescription-id]');
  deleteBtn.addEventListener('click', async () => {
    const confirmed = confirm('Remove this prescription?');
    if (!confirmed) return;
    const { success, message } = await deletePrescription(prescription.id, token);
    if (success) {
      allPrescriptions = allPrescriptions.filter(p => p.id !== prescription.id);
      filteredPrescriptions = filteredPrescriptions.filter(p => p.id !== prescription.id);
      renderPrescriptions(filteredPrescriptions);
      alert('✅ Prescription removed');
    } else {
      alert('❌ ' + (message || 'Failed to remove prescription'));
    }
  });

  return card;
}

// Search functionality
searchBar.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredPrescriptions = [...allPrescriptions];
  } else {
    filteredPrescriptions = allPrescriptions.filter(prescription =>
      prescription.medication.toLowerCase().includes(searchTerm) ||
      prescription.dosage.toLowerCase().includes(searchTerm) ||
      (prescription.doctorNotes && prescription.doctorNotes.toLowerCase().includes(searchTerm))
    );
  }

  renderPrescriptions(filteredPrescriptions);
});

function showError(message) {
  prescriptionsContainer.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
    </div>
  `;
}
