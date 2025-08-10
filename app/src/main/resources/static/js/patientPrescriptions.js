import { getPatientPrescriptions } from "./services/prescriptionServices.js";
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
      ${prescription.doctorNotes ? `
        <div class="detail-row notes">
          <span class="label">Doctor's Notes:</span>
          <span class="value">${prescription.doctorNotes}</span>
        </div>
      ` : ''}
    </div>
  `;

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
