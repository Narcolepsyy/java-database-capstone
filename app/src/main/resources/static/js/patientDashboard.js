import { getDoctors } from './services/doctorServices.js';
import { openModal } from './components/modals.js';
import { createDoctorCard } from './components/doctorCard.js';
import { filterDoctors } from './services/doctorServices.js';//call the same function to avoid duplication coz the functionality was same
import { patientSignup , patientLogin} from './services/patientServices.js';
import { symptomAnalyzer } from './services/aiSymptomAnalyzer.js';
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

function addMessageElement(message, sender, timeString) {
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
  // Keep initial greeting if no history
  chatMessages.innerHTML = history.length ? '' : chatMessages.innerHTML;
  history.forEach(msg => addMessageElement(msg.text, msg.sender, msg.time));
}

function pushToHistory(sender, text, timeString) {
  const history = loadChatHistory();
  history.push({ sender, text, time: timeString });
  // limit history size
  if (history.length > 200) history.splice(0, history.length - 200);
  saveChatHistory(history);
}

// --- Existing code ---

document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("patientSignup");
  if (btn) {
    btn.addEventListener("click", () => openModal("patientSignup"));
  }
});

document.addEventListener("DOMContentLoaded", ()=> {
  const loginBtn = document.getElementById("patientLogin")
  if(loginBtn){
    loginBtn.addEventListener("click" , ()=> {
      openModal("patientLogin")
    })
  }
})

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
      let doctors = response.doctors;
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = "";

      if (doctors.length > 0) {
        // Sort by time if time filter is selected
        if (time) {
          doctors = sortDoctorsByTime(doctors, time);
        }

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

// New function to sort doctors by time (AM/PM)
function sortDoctorsByTime(doctors, timeFilter) {
  return doctors.sort((a, b) => {
    const aHasTimeSlots = hasTimeSlots(a.availableTimes, timeFilter);
    const bHasTimeSlots = hasTimeSlots(b.availableTimes, timeFilter);

    // Doctors with matching time slots come first
    if (aHasTimeSlots && !bHasTimeSlots) return -1;
    if (!aHasTimeSlots && bHasTimeSlots) return 1;

    // If both have matching time slots, sort by earliest time
    if (aHasTimeSlots && bHasTimeSlots) {
      const aEarliest = getEarliestTime(a.availableTimes, timeFilter);
      const bEarliest = getEarliestTime(b.availableTimes, timeFilter);
      return aEarliest - bEarliest;
    }

    return 0;
  });
}

// Helper function to check if doctor has time slots in the specified period (AM/PM)
function hasTimeSlots(availableTimes, timeFilter) {
  return availableTimes.some(time => {
    const hour = parseInt(time.split(':')[0]);
    if (timeFilter === 'AM') {
      return hour >= 0 && hour < 12;
    } else if (timeFilter === 'PM') {
      return hour >= 12 && hour < 24;
    }
    return false;
  });
}

// Helper function to get the earliest time in the specified period
function getEarliestTime(availableTimes, timeFilter) {
  const filteredTimes = availableTimes
    .filter(time => {
      const hour = parseInt(time.split(':')[0]);
      if (timeFilter === 'AM') {
        return hour >= 0 && hour < 12;
      } else if (timeFilter === 'PM') {
        return hour >= 12 && hour < 24;
      }
      return false;
    })
    .map(time => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute; // Convert to minutes for easy comparison
    });

  return Math.min(...filteredTimes);
}

export function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = ""; 

      doctors.forEach(doctor => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
      });
   
}

window.signupPatient = async function () {
  try {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    const data = { name, email, password, phone, address };
    const { success, message } = await patientSignup(data);
    if(success){
      alert(message);
      document.getElementById("modal").style.display = "none";
      window.location.reload();
    }
    else alert(message);
  } catch (error) {
    console.error("Signup failed:", error);
    alert("❌ An error occurred while signing up.");
  }
};

window.loginPatient = async function(){
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    const data = {
      email,
      password
    }
    console.log("loginPatient :: ", data)
    const response = await patientLogin(data);
    console.log("Status Code:", response.status);
    console.log("Response OK:", response.ok);
    if (response.ok) {
      const result = await response.json();
      console.log(result);
      selectRole('loggedPatient');
      localStorage.setItem('token', result.token )
      window.location.href = '/pages/loggedPatientDashboard.html';
    } else {
      alert('❌ Invalid credentials!');
    } 
  }
  catch(error) {
    alert("❌ Failed to Login : ",error);
    console.log("Error :: loginPatient :: " ,error)
  }


}

// AI Symptom Analyzer Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeSymptoms");
  const clearBtn = document.getElementById("clearRecommendations");
  const symptomInput = document.getElementById("symptomInput");

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", analyzePatientSymptoms);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearRecommendations);
  }

  if (symptomInput) {
    symptomInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        analyzePatientSymptoms();
      }
    });
  }
});

// Chatbot Event Listeners
document.addEventListener("DOMContentLoaded", () => {
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

  // Initialize - hide notification after a delay if zero
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
    chatButton.addEventListener("keydown", (e) => {
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
    // Ctrl+Enter to send as well
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
});

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

// Chatbot Functions
function toggleChatbot() {
  const container = document.getElementById("chatbotContainer");
  const toggleBtn = document.getElementById("toggleChatbot");

  if (container.style.display === "none") {
    container.style.display = "flex";
    toggleBtn.textContent = "Hide Chat";
    // Scroll to chatbot
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    container.style.display = "none";
    toggleBtn.textContent = "Start Chat";
  }
}

function minimizeChatbot() {
  const container = document.getElementById("chatbotContainer");
  const toggleBtn = document.getElementById("toggleChatbot");

  container.style.display = "none";
  toggleBtn.textContent = "Start Chat";
}

async function sendChatMessage() {
  const chatInput = document.getElementById("chatInput");
  const message = chatInput.value.trim();
  if (!message) return;
  const sendBtn = document.getElementById("sendMessage");

  // Add user message to chat
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  addMessageElement(message, 'user', timeString);
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
    const botText = response.message;
    const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addMessageElement(botText, 'bot', botTime);
    pushToHistory('bot', botText, botTime);

    // If chat is minimized/hidden, bump unread
    const popup = document.getElementById('chatbotPopup');
    if (!popup.classList.contains('active')) {
      setUnreadCount(getUnreadCount() + 1);
    }

    // If there are recommended specialties, add suggestion buttons
    if (response.recommendedSpecialties.length > 0) {
      addSpecialtySuggestions(response.recommendedSpecialties);
    }

  } catch (error) {
    removeTypingIndicator();
    const errText = "Sorry, I'm having trouble processing your request right now. Please try again.";
    const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addMessageElement(errText, 'bot', errTime);
    pushToHistory('bot', errText, errTime);
    console.error('Chatbot error:', error);
  } finally {
    sendBtn.disabled = false;
  }
}

function addMessageToChat(message, sender) {
  // Deprecated in favor of addMessageElement+pushToHistory, keep for backward compatibility if referenced.
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  addMessageElement(message, sender, timeString);
  pushToHistory(sender, message, timeString);
}

function formatMessage(message) {
  return message
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

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

function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) typingIndicator.remove();
}

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
  // Save suggestion block as a bot message snapshot
  pushToHistory('bot', suggestionsDiv.querySelector('.message-content').innerText, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
}

function clearChatHistory() {
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = `
    <div class="bot-message">
      <div class="message-content">
        Hello! 👋 I'm your virtual medical receptionist. I'm here to help you find the right doctor for your health concerns. How can I assist you today?
      </div>
      <div class="message-time">Just now</div>
    </div>
  `;
  chatbotReceptionist.clearConversation();
}

// AI Symptom Analysis Function
function analyzePatientSymptoms() {
  const symptomsText = document.getElementById("symptomInput").value.trim();

  if (!symptomsText) {
    alert("Please describe your symptoms to get recommendations.");
    return;
  }

  const analyzeBtn = document.getElementById("analyzeSymptoms");
  analyzeBtn.textContent = "Analyzing...";
  analyzeBtn.disabled = true;

  // Simulate AI processing delay for better UX
  setTimeout(() => {
    const recommendations = symptomAnalyzer.analyzeSymptoms(symptomsText);
    displayRecommendations(recommendations, symptomsText);

    analyzeBtn.textContent = "Get Doctor Recommendations";
    analyzeBtn.disabled = false;
  }, 1500);
}

// Display AI Recommendations
function displayRecommendations(recommendations, originalSymptoms) {
  const recommendationsDiv = document.getElementById("aiRecommendations");
  const recommendationsList = document.getElementById("recommendationsList");

  if (recommendations.length === 0) {
    recommendationsList.innerHTML = `
      <div class="no-recommendations">
        <p>🤔 No specific specialist recommendations found.</p>
        <p>Consider consulting a <strong>General Physician</strong> for initial evaluation.</p>
      </div>
    `;
  } else {
    recommendationsList.innerHTML = recommendations.map(rec => `
      <div class="recommendation-card" onclick="filterBySpecialty('${rec.specialty}')">
        <div class="recommendation-header">
          <h4>${rec.specialty}</h4>
          <span class="confidence-badge">${rec.confidence}% match</span>
        </div>
        <p class="recommendation-reason">${rec.reason}</p>
        <div class="recommendation-actions">
          <button class="view-doctors-btn" onclick="filterBySpecialty('${rec.specialty}')">
            View ${rec.specialty} Doctors
          </button>
        </div>
      </div>
    `).join('');
  }

  recommendationsDiv.style.display = 'block';
  recommendationsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Filter doctors by recommended specialty
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

// Clear AI recommendations
function clearRecommendations() {
  document.getElementById("aiRecommendations").style.display = 'none';
  document.getElementById("symptomInput").value = '';
  document.getElementById("recommendationsList").innerHTML = '';

  // Reset filters
  document.getElementById("searchBar").value = "";
  document.getElementById("filterTime").value = "";
  document.getElementById("filterSpecialty").value = "";

  // Reload all doctors
  loadDoctorCards();
}
