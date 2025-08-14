import { getDoctors } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';
import { filterDoctors } from './services/doctorServices.js';
import { bookAppointment } from './services/appointmentRecordService.js';
import { chatbotReceptionist } from './services/chatbotReceptionist.js';


document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();
  initializeChatbot(); // Initialize the chatbot
});

// Initialize chatbot functionality
function initializeChatbot() {
  const chatButton = document.getElementById("chatButton");
  const chatPopup = document.getElementById("chatbotPopup");
  const chatNotification = document.getElementById("chatNotification");
  const minimizeBtn = document.getElementById("minimizeChatbot");
  const closeBtn = document.getElementById("closeChatbot");
  const sendBtn = document.getElementById("sendMessage");
  const clearChatBtn = document.getElementById("clearChat");
  const chatInput = document.getElementById("chatInput");

  // Initialize - hide notification after a delay
  setTimeout(() => {
    if (chatNotification) {
      chatNotification.style.display = "none";
    }
  }, 10000);

  if (chatButton) {
    chatButton.addEventListener("click", () => {
      toggleChatPopup(true);
      if (chatNotification) chatNotification.style.display = "none";
    });
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", () => {
      toggleChatPopup(false);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      toggleChatPopup(false);
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", sendChatMessage);
  }

  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", clearChatHistory);
  }

  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  // Add global function for specialty suggestions to work
  window.filterBySpecialty = filterBySpecialty;
}

function loadDoctorCards() {
  getDoctors()
    .then(doctors => {
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = ""; 

      doctors.forEach(doctor => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Failed to load doctors:", error);
    });
}

export function showBookingOverlay(e, doctor, patient) {
  const button = e.target;
  const rect = button.getBoundingClientRect();
  console.log(patient.name)
  console.log(patient)
  const ripple = document.createElement("div");
  ripple.classList.add("ripple-overlay");
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);

  setTimeout(() => ripple.classList.add("active"), 50);

  const modalApp = document.createElement("div");
  modalApp.classList.add("modalApp");

  modalApp.innerHTML = `
    <h2>Book Appointment</h2>
    <input class="input-field" type="text" value="${patient.name}" disabled />
    <input class="input-field" type="text" value="${doctor.name}" disabled />
    <input class="input-field" type="text" value="${doctor.specialty}" disabled/>
    <input class="input-field" type="email" value="${doctor.email}" disabled/>
    <input class="input-field" type="date" id="appointment-date" />
    <select class="input-field" id="appointment-time">
      <option value="">Select time</option>
      ${doctor.availableTimes.map(t => `<option value="${t}">${t}</option>`).join('')}
    </select>
    <button class="confirm-booking">Confirm Booking</button>
  `;

  document.body.appendChild(modalApp);

  setTimeout(() => modalApp.classList.add("active"), 600);

  modalApp.querySelector(".confirm-booking").addEventListener("click", async () => {
    const date = modalApp.querySelector("#appointment-date").value;
    const time = modalApp.querySelector("#appointment-time").value;
    const token = localStorage.getItem("token");
    const startTime = time.split('-')[0];
    const appointment = {
      doctor: { id: doctor.id },
      patient: { id: patient.id },
      appointmentTime: `${date}T${startTime}:00`,
      status: 0
    };
  

    const { success, message } = await bookAppointment(appointment, token);

    if (success) {
      alert("Appointment Booked successfully");
      ripple.remove();
      modalApp.remove();
    } else {
      alert("❌ Failed to book an appointment :: " + message);
    }
  });
}

  

// Filter Input
document.getElementById("searchBar").addEventListener("input", filterDoctorsOnChange);
document.getElementById("filterTime").addEventListener("change", filterDoctorsOnChange);
document.getElementById("filterSpecialty").addEventListener("change", filterDoctorsOnChange);



function filterDoctorsOnChange() {
  const searchBar = document.getElementById("searchBar").value.trim(); 
  const filterTime = document.getElementById("filterTime").value;  
  const filterSpecialty = document.getElementById("filterSpecialty").value;  

  
  const name = searchBar.length > 0 ? searchBar : null;  
  const time = filterTime.length > 0 ? filterTime : null;
  const specialty = filterSpecialty.length > 0 ? filterSpecialty : null;

  filterDoctors(name , time ,specialty)
    .then(response => {
      const doctors = response.doctors;
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = ""; 

      if (doctors.length > 0) {
        console.log(doctors);
        doctors.forEach(doctor => {
          const card = createDoctorCard(doctor);
          contentDiv.appendChild(card);
        });
      } else {
        contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
        console.log("Nothing");
      }
    })
    .catch(error => {
      console.error("Failed to filter doctors:", error);
      alert("❌ An error occurred while filtering doctors.");
    });
}

export function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = ""; 

      doctors.forEach(doctor => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
      });
   
}

// Virtual Receptionist Chatbot Functions
// Toggle chat popup visibility
function toggleChatPopup(show) {
  const chatPopup = document.getElementById("chatbotPopup");

  if (show) {
    chatPopup.classList.add("active");
    // Focus on chat input
    setTimeout(() => {
      const chatInput = document.getElementById("chatInput");
      if (chatInput) chatInput.focus();
    }, 300);
  } else {
    chatPopup.classList.remove("active");
  }
}

// Send chat message
async function sendChatMessage() {
  const chatInput = document.getElementById("chatInput");
  const message = chatInput.value.trim();

  if (!message) return;

  const sendBtn = document.getElementById("sendMessage");

  // Add user message to chat
  addMessageToChat(message, 'user');
  chatInput.value = '';

  // Disable send button and show typing indicator
  sendBtn.disabled = true;
  showTypingIndicator();

  try {
    // Get bot response
    const response = await chatbotReceptionist.sendMessage(message);

    // Remove typing indicator and add bot response
    removeTypingIndicator();
    addMessageToChat(response.message, 'bot');

    // If there are recommended specialties, add suggestion buttons
    if (response.recommendedSpecialties.length > 0) {
      addSpecialtySuggestions(response.recommendedSpecialties);
    }

  } catch (error) {
    removeTypingIndicator();
    addMessageToChat("Sorry, I'm having trouble processing your request right now. Please try again.", 'bot');
    console.error('Chatbot error:', error);
  } finally {
    sendBtn.disabled = false;
  }
}

// Add message to chat
function addMessageToChat(message, sender) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `${sender}-message`;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messageDiv.innerHTML = `
    <div class="message-content">${formatMessage(message)}</div>
    <div class="message-time">${timeString}</div>
  `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format message text
function formatMessage(message) {
  // Convert **text** to <strong>text</strong>
  return message
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// Show typing indicator
function showTypingIndicator() {
  const chatMessages = document.getElementById("chatMessages");
  const typingDiv = document.createElement("div");
  typingDiv.className = "bot-message typing-indicator-container";
  typingDiv.id = "typingIndicator";

  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Add specialty suggestions
function addSpecialtySuggestions(specialties) {
  const chatMessages = document.getElementById("chatMessages");
  const suggestionsDiv = document.createElement("div");
  suggestionsDiv.className = "bot-message";

  const suggestionsHtml = specialties.map(specialty => `
    <div class="specialty-suggestion" onclick="filterBySpecialty('${specialty}')">
      <strong>View ${specialty} Doctors</strong>
      <br><small>Click to see available ${specialty.toLowerCase()} doctors</small>
    </div>
  `).join('');

  suggestionsDiv.innerHTML = `
    <div class="message-content">
      Here are some quick actions:
      ${suggestionsHtml}
    </div>
    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;

  chatMessages.appendChild(suggestionsDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Clear chat history
function clearChatHistory() {
  const chatMessages = document.getElementById("chatMessages");

  // Clear all messages except the initial greeting
  chatMessages.innerHTML = `
    <div class="bot-message">
      <div class="message-content">
        Hello! 👋 I'm your virtual medical receptionist. I'm here to help you find the right doctor for your health concerns. How can I assist you today?
      </div>
      <div class="message-time">Just now</div>
    </div>
  `;

  // Clear chatbot conversation history
  chatbotReceptionist.clearConversation();
}

// Filter by specialty from chatbot recommendations
function filterBySpecialty(specialty) {
  // Update the specialty filter dropdown
  const specialtyFilter = document.getElementById("filterSpecialty");
  specialtyFilter.value = specialty;

  // Clear other filters for better focus
  document.getElementById("searchBar").value = "";
  document.getElementById("filterTime").value = "";

  // Trigger the filter change
  filterDoctorsOnChange();

  // Scroll to results
  document.getElementById("content").scrollIntoView({ behavior: 'smooth' });
}
