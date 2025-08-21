import { getDoctors } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';
import { filterDoctors } from './services/doctorServices.js';
import { bookAppointment } from './services/appointmentRecordService.js';
import { chatbotReceptionist } from './services/chatbotReceptionist.js';

// --- Chat persistence and UX helpers ---
const CHAT_HISTORY_KEY = 'vr_chat_history_v1';
const CHAT_UNREAD_KEY = 'vr_chat_unread_v1';
const CHAT_OPEN_KEY = 'vr_chat_open_v1';

function loadChatHistory() {
  try { return JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY)) || []; } catch { return []; }
}
function saveChatHistory(history) {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}
function getUnreadCount() {
  return parseInt(localStorage.getItem(CHAT_UNREAD_KEY) || '0', 10);
}
function setUnreadCount(n) {
  localStorage.setItem(CHAT_UNREAD_KEY, String(n));
  const badge = document.getElementById('chatNotification');
  if (badge) {
    if (n > 0) { badge.textContent = String(n); badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
  }
}
function isChatOpen() {
  return localStorage.getItem(CHAT_OPEN_KEY) === '1';
}
function setChatOpen(open) {
  localStorage.setItem(CHAT_OPEN_KEY, open ? '1' : '0');
}

function addMessageElementWithTime(message, sender, timeString) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `${sender}-message`;
  messageDiv.innerHTML = `
    <div class="message-content">${formatMessage(message)}</div>
    <div class="message-time">${timeString}</div>
  `;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderChatHistory() {
  const chatMessages = document.getElementById("chatMessages");
  const history = loadChatHistory();
  if (!chatMessages) return;
  if (history.length) chatMessages.innerHTML = '';
  history.forEach(msg => addMessageElementWithTime(msg.text, msg.sender, msg.time));
}

function pushToHistory(sender, text, timeString) {
  const history = loadChatHistory();
  history.push({ sender, text, time: timeString });
  if (history.length > 200) history.splice(0, history.length - 200);
  saveChatHistory(history);
}


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

  // Restore history and UI state
  renderChatHistory();
  setUnreadCount(getUnreadCount());
  if (isChatOpen()) toggleChatPopup(true);

  // Hide notification badge if zero unread after a short delay
  setTimeout(() => {
    if (chatNotification && getUnreadCount() === 0) {
      chatNotification.style.display = "none";
    }
  }, 3000);

  if (chatButton) {
    chatButton.addEventListener("click", () => {
      toggleChatPopup(true);
      setUnreadCount(0);
    });
    // Keyboard access: Enter/Space
    chatButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleChatPopup(true);
        setUnreadCount(0);
      }
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
    clearChatBtn.addEventListener("click", () => {
      clearChatHistory();
      saveChatHistory([]);
      setUnreadCount(0);
    });
  }

  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
    // Ctrl+Enter to send
    chatInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  // Global Escape to close when open
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatPopup && chatPopup.classList.contains('active')) {
      toggleChatPopup(false);
    }
  });

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

// Function to close the booking modal
function closeBookingModal() {
  const ripple = document.querySelector(".ripple-overlay");
  const modalApp = document.querySelector(".modalApp");
  const backdrop = document.querySelector(".modal-backdrop");

  if (modalApp) {
    modalApp.classList.remove("active");
    setTimeout(() => modalApp.remove(), 300);
  }

  if (ripple) {
    ripple.classList.remove("active");
    setTimeout(() => ripple.remove(), 300);
  }

  if (backdrop) {
    backdrop.classList.remove("active");
    setTimeout(() => backdrop.remove(), 300);
  }
  // Remove keydown listener
  window.removeEventListener('keydown', escCloseHandler);
}

function escCloseHandler(e) {
  if (e.key === 'Escape') {
    closeBookingModal();
  }
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

  // Add modal backdrop for better background coverage
  const backdrop = document.createElement("div");
  backdrop.classList.add("modal-backdrop");
  document.body.appendChild(backdrop);

  // Add click event to backdrop to close the modal
  backdrop.addEventListener("click", closeBookingModal);

  setTimeout(() => {
    ripple.classList.add("active");
    backdrop.classList.add("active");
  }, 50);

  const modalApp = document.createElement("div");
  modalApp.classList.add("modalApp");

  modalApp.innerHTML = `
    <div class="modal-header">
      <h2>Book Appointment</h2>
      <span class="close-modal">&times;</span>
    </div>
    <input class="input-field" type="text" value="${patient.name}" disabled />
    <input class="input-field" type="text" value="${doctor.name}" disabled />
    <input class="input-field" type="text" value="${doctor.specialty}" disabled/>
    <input class="input-field" type="email" value="${doctor.email}" disabled/>
    <input class="input-field" type="date" id="appointment-date" />
    <select class="input-field" id="appointment-time">
      <option value="">Select time</option>
      ${doctor.availableTimes.map(t => `<option value="${t}">${t}</option>`).join('')}
    </select>
    <div class="modal-buttons">
      <button class="cancel-booking">Cancel</button>
      <button class="confirm-booking">Confirm Booking</button>
    </div>
  `;

  document.body.appendChild(modalApp);

  // Add click event to close button
  const closeButton = modalApp.querySelector(".close-modal");
  closeButton.addEventListener("click", closeBookingModal);

  // Add click event to cancel button
  const cancelButton = modalApp.querySelector(".cancel-booking");
  cancelButton.addEventListener("click", closeBookingModal);

  // Prevent modal closure when clicking inside the modal
  modalApp.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Add Escape handler
  window.addEventListener('keydown', escCloseHandler);

  setTimeout(() => modalApp.classList.add("active"), 600);

  modalApp.querySelector(".confirm-booking").addEventListener("click", async () => {
    const date = modalApp.querySelector("#appointment-date").value;
    const time = modalApp.querySelector("#appointment-time").value;

    // Validate inputs
    if (!date || !time) {
      alert("Please select both date and time for your appointment.");
      return;
    }

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
      closeBookingModal();
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
    setChatOpen(true);
    // Focus on chat input
    setTimeout(() => {
      const chatInput = document.getElementById("chatInput");
      if (chatInput) chatInput.focus();
    }, 300);
  } else {
    chatPopup.classList.remove("active");
    setChatOpen(false);
  }
}

// Send chat message
async function sendChatMessage() {
  const chatInput = document.getElementById("chatInput");
  const message = chatInput.value.trim();

  if (!message) return;

  const sendBtn = document.getElementById("sendMessage");

  // Add user message to chat
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  addMessageToChat(message, 'user');
  pushToHistory('user', message, timeString);
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
    const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    pushToHistory('bot', response.message, botTime);

    // If there are recommended specialties, add suggestion buttons
    if (response.recommendedSpecialties.length > 0) {
      addSpecialtySuggestions(response.recommendedSpecialties);
    }

    // If minimized, bump unread
    const popup = document.getElementById('chatbotPopup');
    if (!popup.classList.contains('active')) {
      setUnreadCount(getUnreadCount() + 1);
    }

  } catch (error) {
    removeTypingIndicator();
    const fallback = "Sorry, I'm having trouble processing your request right now. Please try again.";
    addMessageToChat(fallback, 'bot');
    const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    pushToHistory('bot', fallback, errTime);
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
