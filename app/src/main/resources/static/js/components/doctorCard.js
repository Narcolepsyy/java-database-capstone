/*
Import the overlay function for booking appointments from loggedPatient.js

  Import the deleteDoctor API function to remove doctors (admin role) from doctorServices.js

  Import function to fetch patient details (used during booking) from patientServices.js

  Function to create and return a DOM element for a single doctor card
    Create the main container for the doctor card
    Retrieve the current user role from localStorage
    Create a div to hold doctor information
    Create and set the doctor’s name
    Create and set the doctor's specialization
    Create and set the doctor's email
    Create and list available appointment times
    Append all info elements to the doctor info container
    Create a container for card action buttons
    === ADMIN ROLE ACTIONS ===
      Create a delete button
      Add click handler for delete button
     Get the admin token from localStorage
        Call API to delete the doctor
        Show result and remove card if successful
      Add delete button to actions container
   
    === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
      Create a book now button
      Alert patient to log in before booking
      Add button to actions container
  
    === LOGGED-IN PATIENT ROLE ACTIONS === 
      Create a book now button
      Handle booking logic for logged-in patient   
        Redirect if token not available
        Fetch patient data with token
        Show booking overlay UI with doctor and patient info
      Add button to actions container
   
  Append doctor info and action buttons to the car
  Return the complete doctor card element
*/

import {deleteDoctor} from "../services/doctorServices.js";
import {getPatientData} from "../services/patientServices.js";
import {showBookingOverlay} from "../loggedPatient";

export function createDoctorCard(doctor) {
    const card = document.createElement("div");
    card.classList.add("doctor-card");

    //fetch user role
    const role = localStorage.getItem("userRole");
    //create info section

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("doctor-info");

    const name = document.createElement("h3");
    name.textContent = doctor.name;

    const specialization = document.createElement("p");
    specialization.textContent = `Specialty: ${doctor.specialty}`;

    const email =document.createElement("p");
    email.textContent = `Email: ${doctor.email}`;

    const availability = document.createElement("p");
    availability.textContent = `Availability: ${doctor.availableTimes.join(",")}`;

    infoDiv.appendChild(name);
    infoDiv.appendChild(specialization);
    infoDiv.appendChild(email);
    infoDiv.appendChild(availability);

    // Card actions
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("card-actions");

    if (role === "admin") {
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Delete";
        removeBtn.addEventListener("click", async () => {
            const confirmDelete = confirm(`Are you sure want to delete Dr ${doctor.name}?`);
            if (!confirmDelete) return;
            const token = localStorage.getItem("token");
            if (!token) {
                    alert("Admin token not found. Please login again!");
                    return;
            }
            const {success, message} = await deleteDoctor(doctor.id, token);

            if (success) {
                alert(message || "Doctor deleted successfully");
                card.remove();
            }
            else {
                alert(message || "Failed to delete doctor");
            }
        });
        actionsDiv.appendChild(removeBtn);
    }
    else if (role === "patient") {
        const bookNow = document.createElement("button");
        bookNow.textContent = "Book now!";
        bookNow.classList.add("btn", "btn-primary");

        bookNow.addEventListener("click", () => {
            alert("Please login to book an appointment");
        });
        actionsDiv.appendChild(bookNow);
    }
    else if (role === "loggedPatient") {
        const bookNow = document.createElement("button");
        bookNow.textContent = "Book now!";
        bookNow.classList.add("btn", "btn-primary");
        bookNow.addEventListener("click", async (e)=> {
            try {
                const token = localStorage.getItem("token");
                const patientData = await getPatientData(token);
                showBookingOverlay(e, doctor, patientData);
            } catch (err) {
                alert("Failed to fetch patient data. Please try again!");
                console.error(err);
            }
        });
        actionsDiv.appendChild(bookNow);
    }
    // final assembly
    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);

    return card;
}

