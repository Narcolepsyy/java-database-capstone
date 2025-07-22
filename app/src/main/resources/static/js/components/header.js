// Import modal opener (make sure modals.js exports openModal)
import { openModal } from './modals.js';

// 1. Main function to render the header
export function renderHeader() {
    const headerDiv = document.getElementById("header");

    // 2. If on index/root page, reset role and show simple header
    if (window.location.pathname.endsWith("/") || window.location.pathname.endsWith("/index.html")) {
        localStorage.removeItem("userRole");
        headerDiv.innerHTML = `
      <header class="header">
        <div class="logo-section">
          <img src="/assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
          <span class="logo-title">Hospital CMS</span>
        </div>
      </header>`;
        return;
    }

    // 3. Get role and token from localStorage
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");

    // 4. Handle invalid or missing token
    if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
        localStorage.removeItem("userRole");
        alert("Session expired or invalid login. Please log in again.");
        window.location.href = "/";
        return;
    }

    // 5. Start building header HTML
    let headerContent = `
    <header class="header">
      <div class="logo-section">
        <img src="/assets/images/logo/logo.png" alt="Hospital CMS Logo" class="logo-img">
        <span class="logo-title">Hospital CMS</span>
      </div>
      <nav>`;

    // 6. Add role-specific buttons
    if (role === "admin") {
        headerContent += `
      <button id="addDocBtn" class="adminBtn" onclick="openModal('addDoctor')">Add Doctor</button>
      <a href="#" onclick="logout()">Logout</a>`;
    } else if (role === "doctor") {
        headerContent += `
      <button class="adminBtn" onclick="window.location.href='/templates/doctor/doctorDashboard.html'">Home</button>
      <a href="#" onclick="logout()">Logout</a>`;
    } else if (role === "patient") {
        headerContent += `
      <button id="patientLogin" class="adminBtn">Login</button>
      <button id="patientSignup" class="adminBtn">Sign Up</button>`;
    } else if (role === "loggedPatient") {
        headerContent += `
      <button id="home" class="adminBtn" onclick="window.location.href='/pages/loggedPatientDashboard.html'">Home</button>
      <button id="patientAppointments" class="adminBtn" onclick="window.location.href='/pages/patientAppointments.html'">Appointments</button>
      <a href="#" onclick="logoutPatient()">Logout</a>`;
    }

    // 7. Close nav & header tags
    headerContent += `</nav></header>`;

    // 8. Insert the header into DOM
    headerDiv.innerHTML = headerContent;

    // 9. Attach click listeners to login/signup if needed
    attachHeaderButtonListeners();
}

// Attach listeners to dynamically created DOM elements
function attachHeaderButtonListeners() {
    const patientLogin = document.getElementById("patientLogin");
    const patientSignup = document.getElementById("patientSignup");

    if (patientLogin) {
        patientLogin.addEventListener("click", () => openModal("patientLogin"));
    }

    if (patientSignup) {
        patientSignup.addEventListener("click", () => openModal("signupPatient"));
    }
}

// Admin or Doctor logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/";
}

// Patient logout
function logoutPatient() {
    localStorage.removeItem("token");
    localStorage.setItem("userRole", "patient");
    window.location.href = "/pages/patientDashboard.html";
}

// 10. Render on page load
document.addEventListener("DOMContentLoaded", renderHeader);
