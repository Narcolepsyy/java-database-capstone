// Import required services
import { getDoctorAppointments, updateDoctorAvailability } from './services/doctorServices.js';

// Current doctor ID (will be retrieved from localStorage)
let currentDoctorId = null;
let currentDate = new Date();
let currentView = 'month';
let doctorAppointments = [];
let doctorAvailability = [];

// DOM elements
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthYearElement = document.getElementById('currentMonthYear');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const viewDayButton = document.getElementById('viewDay');
const viewWeekButton = document.getElementById('viewWeek');
const viewMonthButton = document.getElementById('viewMonth');
const appointmentModal = document.getElementById('appointmentModal');
const closeModalButton = document.getElementById('closeModal');
const appointmentDetails = document.getElementById('appointmentDetails');
const addAvailabilityButton = document.getElementById('addAvailability');
const availabilityModal = document.getElementById('availabilityModal');
const closeAvailabilityModalButton = document.getElementById('closeAvailabilityModal');
const availabilityForm = document.getElementById('availabilityForm');
const availabilityDateInput = document.getElementById('availabilityDate');

// Initialize the calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get current doctor ID from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentDoctorId = payload.id;

      // Fetch appointments and availability
      fetchDoctorData();
    } catch (error) {
      console.error('Failed to parse token:', error);
      alert('Authentication error. Please login again.');
    }
  } else {
    alert('Please login to view your calendar.');
    window.location.href = '/pages/login.html';
  }

  // Set up event listeners
  setupEventListeners();

  // Initialize calendar view
  renderCalendar();
});

// Set up event listeners
function setupEventListeners() {
  // Month navigation
  prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // View type buttons
  viewDayButton.addEventListener('click', () => {
    setActiveView('day');
  });

  viewWeekButton.addEventListener('click', () => {
    setActiveView('week');
  });

  viewMonthButton.addEventListener('click', () => {
    setActiveView('month');
  });

  // Modal close buttons
  closeModalButton.addEventListener('click', () => {
    appointmentModal.style.display = 'none';
  });

  closeAvailabilityModalButton.addEventListener('click', () => {
    availabilityModal.style.display = 'none';
  });

  // Add availability button
  addAvailabilityButton.addEventListener('click', () => {
    const today = new Date();
    availabilityDateInput.min = today.toISOString().split('T')[0];
    availabilityDateInput.value = today.toISOString().split('T')[0];
    availabilityModal.style.display = 'block';
  });

  // Availability form submission
  availabilityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveAvailability();
  });

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === appointmentModal) {
      appointmentModal.style.display = 'none';
    }
    if (e.target === availabilityModal) {
      availabilityModal.style.display = 'none';
    }
  });
}

// Set active view and render calendar
function setActiveView(view) {
  currentView = view;

  // Update active button styling
  viewDayButton.classList.remove('active');
  viewWeekButton.classList.remove('active');
  viewMonthButton.classList.remove('active');

  if (view === 'day') {
    viewDayButton.classList.add('active');
  } else if (view === 'week') {
    viewWeekButton.classList.add('active');
  } else {
    viewMonthButton.classList.add('active');
  }

  renderCalendar();
}

// Fetch doctor appointments and availability
async function fetchDoctorData() {
  try {
    // Get doctor appointments
    const response = await getDoctorAppointments(currentDoctorId);
    doctorAppointments = response.appointments || [];

    // Get doctor availability
    // For now, we'll create some sample availability data
    // In a real app, this would be fetched from the server
    doctorAvailability = generateSampleAvailability();

    renderCalendar();
  } catch (error) {
    console.error('Error fetching doctor data:', error);
    alert('Failed to load your appointments. Please try again later.');
  }
}

// Generate sample availability data for demonstration
function generateSampleAvailability() {
  const availability = [];
  const today = new Date();

  // Generate availability for the next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Add morning hours
    availability.push({
      date: formatDate(date),
      time: '09:00',
      status: 'available'
    });

    availability.push({
      date: formatDate(date),
      time: '10:00',
      status: 'available'
    });

    // Add afternoon hours
    availability.push({
      date: formatDate(date),
      time: '13:00',
      status: 'available'
    });

    availability.push({
      date: formatDate(date),
      time: '14:00',
      status: 'available'
    });
  }

  return availability;
}

// Format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Render the calendar based on the current view
function renderCalendar() {
  if (currentView === 'month') {
    renderMonthView();
  } else if (currentView === 'week') {
    renderWeekView();
  } else {
    renderDayView();
  }

  // Update month/year display
  updateCurrentMonthYearDisplay();
}

// Update the month/year display
function updateCurrentMonthYearDisplay() {
  const options = { month: 'long', year: 'numeric' };
  currentMonthYearElement.textContent = currentDate.toLocaleDateString(undefined, options);
}

// Render the month view of the calendar
function renderMonthView() {
  calendarGrid.innerHTML = '';

  // Get current year and month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get the first day of the month and the last day
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Calculate the day of the week for the first day (0 = Sunday)
  let firstDayOfWeek = firstDayOfMonth.getDay();

  // Calculate how many days from the previous month to show
  const daysFromPrevMonth = firstDayOfWeek;

  // Get the last day of the previous month
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

  // Calculate the starting day to render (from the previous month)
  let day = lastDayOfPrevMonth - daysFromPrevMonth + 1;
  let currentMonth = month - 1;
  let currentYear = year;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  // Total cells to render (6 weeks × 7 days)
  const totalDays = 42;

  // Today's date for highlighting
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  // Render calendar grid
  for (let i = 0; i < totalDays; i++) {
    // Create day cell
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';

    // Check if this is today
    if (day === todayDate && currentMonth === todayMonth && currentYear === todayYear) {
      dayElement.classList.add('today');
    }

    // Check if this is from another month
    if ((i < daysFromPrevMonth) || (i >= daysFromPrevMonth + lastDayOfMonth.getDate())) {
      dayElement.classList.add('other-month');
    }

    // Add day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    // Format date string for comparison
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Add appointments for this day
    addAppointmentsToDay(dayElement, dateString);

    // Add availability slots for this day
    addAvailabilityToDay(dayElement, dateString);

    // Add click event to set availability
    dayElement.addEventListener('click', () => {
      availabilityDateInput.value = dateString;
      availabilityModal.style.display = 'block';
    });

    // Add day element to grid
    calendarGrid.appendChild(dayElement);

    // Move to next day
    day++;

    // Check if we need to move to the next month
    const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    if (day > lastDayOfCurrentMonth) {
      day = 1;
      currentMonth++;

      // Check if we need to move to the next year
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }
  }
}

// Add appointments to a day cell
function addAppointmentsToDay(dayElement, dateString) {
  // Filter appointments for this day
  const dayAppointments = doctorAppointments.filter(appointment => {
    return appointment.date === dateString ||
           (appointment.appointmentTime && appointment.appointmentTime.startsWith(dateString));
  });

  // Add appointment elements
  dayAppointments.forEach(appointment => {
    const appointmentElement = document.createElement('div');
    appointmentElement.className = 'appointment';

    // Extract time from appointmentTime if available, otherwise use a default message
    let time = 'TBD';
    if (appointment.appointmentTime) {
      const timePart = appointment.appointmentTime.split('T')[1];
      if (timePart) {
        time = timePart.substring(0, 5);
      }
    }

    appointmentElement.textContent = `${time} - ${appointment.patientName || 'Patient'}`;

    // Add click event
    appointmentElement.addEventListener('click', (e) => {
      e.stopPropagation();
      showAppointmentDetails(appointment);
    });

    dayElement.appendChild(appointmentElement);
  });
}

// Add availability slots to a day cell
function addAvailabilityToDay(dayElement, dateString) {
  // Filter availability for this day
  const dayAvailability = doctorAvailability.filter(slot => slot.date === dateString);

  // Add availability elements
  dayAvailability.forEach(slot => {
    const slotElement = document.createElement('div');
    slotElement.className = 'available-slot';
    slotElement.textContent = `${slot.time} - Available`;

    // Add click event
    slotElement.addEventListener('click', (e) => {
      e.stopPropagation();
      // Could show a modal to edit/remove this availability
    });

    dayElement.appendChild(slotElement);
  });
}

// Show appointment details in modal
function showAppointmentDetails(appointment) {
  // Format date and time
  let formattedDate = 'Unknown Date';
  let formattedTime = 'Unknown Time';

  if (appointment.date) {
    formattedDate = new Date(appointment.date).toLocaleDateString();
  }

  if (appointment.appointmentTime) {
    const timePart = appointment.appointmentTime.split('T')[1];
    if (timePart) {
      formattedTime = timePart.substring(0, 5);
    }
  }

  // Build details HTML
  const html = `
    <div class="appointment-detail">
      <p><strong>Patient:</strong> ${appointment.patientName || 'Unknown'}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p><strong>Status:</strong> ${appointment.status || 'Scheduled'}</p>
      ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
    </div>
  `;

  appointmentDetails.innerHTML = html;
  appointmentModal.style.display = 'block';
}

// Save doctor availability
async function saveAvailability() {
  const date = availabilityDateInput.value;
  const selectedTimes = [];

  // Get all checked time slots
  document.querySelectorAll('.time-slot input[type="checkbox"]:checked').forEach(checkbox => {
    selectedTimes.push(checkbox.value);
  });

  if (selectedTimes.length === 0) {
    alert('Please select at least one time slot');
    return;
  }

  try {
    // Update doctor availability
    // In a real app, this would call the backend API
    // For now, we'll just update the local data

    // Remove existing availability for this date
    doctorAvailability = doctorAvailability.filter(slot => slot.date !== date);

    // Add new availability slots
    selectedTimes.forEach(time => {
      doctorAvailability.push({
        date: date,
        time: time,
        status: 'available'
      });
    });

    // Close modal and re-render calendar
    availabilityModal.style.display = 'none';
    renderCalendar();

    // Clear checkboxes
    document.querySelectorAll('.time-slot input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    alert('Availability updated successfully');
  } catch (error) {
    console.error('Error saving availability:', error);
    alert('Failed to update availability. Please try again.');
  }
}

// Render week view of the calendar
function renderWeekView() {
  // For now, just show the month view
  // In a real app, this would show a week view with hours
  renderMonthView();
}

// Render day view of the calendar
function renderDayView() {
  // For now, just show the month view
  // In a real app, this would show a single day with hours
  renderMonthView();
}
