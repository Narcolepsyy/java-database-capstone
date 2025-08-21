import { savePrescription, getPrescription } from "./services/prescriptionServices.js";

document.addEventListener('DOMContentLoaded', async () => {
  const savePrescriptionBtn = document.getElementById("savePrescription");
  const patientNameInput = document.getElementById("patientName");
  const medicinesInput = document.getElementById("medicines");
  const dosageInput = document.getElementById("dosage");
  const notesInput = document.getElementById("notes");
  const createdDateInput = document.getElementById("createdDate");
  const endDateInput = document.getElementById("endDate");
  const heading = document.getElementById("heading")


  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get("appointmentId");
  const mode = urlParams.get("mode");
  const token = localStorage.getItem("token");
  const patientName= urlParams.get("patientName")

  if (heading) {
    // Check if the mode is "view"
    if (mode === "view") {
      // Change the text to "View Prescription for [Patient Name]"
      heading.innerHTML = `View <span>Prescription</span>`;
    } else {
      // Otherwise, set it as "Add Prescription for [Patient Name]"
      heading.innerHTML = `Add <span>Prescription</span>`;
    }
  }

  // Default createdDate to today when adding
  if (createdDateInput && !mode) {
    createdDateInput.value = new Date().toISOString().split('T')[0];
  }

  // Pre-fill patient name
  if (patientNameInput && patientName) {
    patientNameInput.value = patientName;
  }

  // Fetch and pre-fill existing prescription if it exists
  if (appointmentId && token) {
    try {
      const response = await getPrescription(appointmentId, token);
      console.log("getPrescription :: ", response);

      // Now, check if the prescription exists in the response and access it from the array
      if (response.prescription && response.prescription.length > 0) {
        const existingPrescription = response.prescription[0]; // Access first prescription object
        patientNameInput.value = existingPrescription.patientName || patientName || "";
        medicinesInput.value = existingPrescription.medication || "";
        dosageInput.value = existingPrescription.dosage || "";
        notesInput.value = existingPrescription.doctorNotes || "";
        if (existingPrescription.createdDate) {
          createdDateInput.value = existingPrescription.createdDate;
        }
        if (existingPrescription.endDate) {
          endDateInput.value = existingPrescription.endDate;
        }
      }
      
    } catch (error) {
      console.warn("No existing prescription found or failed to load:", error);
    }
  }
  if (mode === 'view') {
    // Make fields read-only
    patientNameInput.disabled = true;
    medicinesInput.disabled = true;
    dosageInput.disabled = true;
    notesInput.disabled = true;
    if (createdDateInput) createdDateInput.disabled = true;
    if (endDateInput) endDateInput.disabled = true;
    savePrescriptionBtn.style.display = "none";  // Hide the save button
  }
  // Save prescription on button click
  savePrescriptionBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const prescription = {
      patientName: patientNameInput.value,
      medication: medicinesInput.value,
      dosage: dosageInput.value,
      doctorNotes: notesInput.value,
      appointmentId,
      createdDate: createdDateInput.value || null,
      endDate: endDateInput.value || null
    };

    const { success, message } = await savePrescription(prescription, token);

    if (success) {
      alert("✅ Prescription saved successfully.");
      selectRole('doctor');
    } else {
      alert("❌ Failed to save prescription. " + message);
    }
  });
});
