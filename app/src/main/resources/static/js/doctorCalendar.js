// Import required services
import { getDoctorAppointments, updateDoctorAvailability } from './services/doctorServices.js';

// Current view/date
let currentDate = new Date();
let currentView = 'month';
let doctorAppointments = [];
let doctorAvailability = [];

// DOM elements
const calendarGrid = document.getElementById('calendarGrid');
const calendarContainer = document.getElementById('calendarContainer');
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
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to view your calendar.');
    return;
  }

  // Fetch appointments and availability
  fetchDoctorData(token);

  // Set up event listeners
  setupEventListeners();

  // Initialize calendar view
  renderCalendar();
});

// Set up event listeners
function setupEventListeners() {
  // Month navigation
  prevMonthButton.addEventListener('click', () => {
    navigatePrevious();
  });

  nextMonthButton.addEventListener('click', () => {
    navigateNext();
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
    availabilityModal.style.display = 'flex';
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

  // Close modals on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      appointmentModal.style.display = 'none';
      availabilityModal.style.display = 'none';
    }
  });
}

// Navigation functions based on current view
function navigateNext() {
  switch (currentView) {
    case 'day':
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case 'week':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'month':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
  }
  renderCalendar();
}

function navigatePrevious() {
  switch (currentView) {
    case 'day':
      currentDate.setDate(currentDate.getDate() - 1);
      break;
    case 'week':
      currentDate.setDate(currentDate.getDate() - 7);
      break;
    case 'month':
      currentDate.setMonth(currentDate.getMonth() - 1);
      break;
  }
  renderCalendar();
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
async function fetchDoctorData(token) {
  try {
    // Get doctor appointments using token (doctor inferred on backend)
    const response = await getDoctorAppointments({ condition: null, patientName: null, token });
    doctorAppointments = response.appointments || [];

    // Generate sample availability for UI
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
  // Update container class for different view styles
  calendarContainer.className = 'calendar-container';

  if (currentView === 'month') {
    calendarContainer.classList.add('month-view');
    renderMonthView();
  } else if (currentView === 'week') {
    calendarContainer.classList.add('week-view');
    renderWeekView();
  } else {
    calendarContainer.classList.add('day-view');
    renderDayView();
  }

  // Update month/year display
  updateCurrentMonthYearDisplay();
}

// Update the month/year display
function updateCurrentMonthYearDisplay() {
  let options = {};

  if (currentView === 'day') {
    options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  } else if (currentView === 'week') {
    // For week view, show the date range
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startMonth = weekStart.toLocaleDateString(undefined, { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString(undefined, { month: 'short' });

    if (startMonth === endMonth) {
      currentMonthYearElement.textContent = `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    } else {
      currentMonthYearElement.textContent = `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    }
    return;
  } else {
    options = { month: 'long', year: 'numeric' };
  }

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
      availabilityModal.style.display = 'flex';
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
  let formattedDuration = '30 mins'; // Default duration

  if (appointment.date) {
    formattedDate = new Date(appointment.date).toLocaleDateString();
  }

  if (appointment.appointmentTime) {
    const timePart = appointment.appointmentTime.split('T')[1];
    if (timePart) {
      formattedTime = timePart.substring(0, 5);
    }
  }

  if (appointment.duration) {
    formattedDuration = `${appointment.duration} mins`;
  }

  // Build details HTML
  const html = `
    <div class="appointment-detail">
      <p><strong>Patient:</strong> ${appointment.patientName || 'Unknown'}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p><strong>Duration:</strong> ${formattedDuration}</p>
      <p><strong>Status:</strong> ${appointment.status || 'Scheduled'}</p>
      ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
    </div>
  `;

  appointmentDetails.innerHTML = html;
  appointmentModal.style.display = 'flex';
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
  calendarGrid.innerHTML = '';

  // First, determine the start of the week (Sunday) for the current date
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  // Create header row with time column and days of the week
  const headerRow = document.createElement('div');
  headerRow.className = 'calendar-header';

  // Add empty cell for time column
  const timeHeaderCell = document.createElement('div');
  headerRow.appendChild(timeHeaderCell);

  // Add day headers
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);

    const headerCell = document.createElement('div');
    headerCell.className = 'week-header-day';

    const dayName = dayDate.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNum = dayDate.getDate();
    headerCell.innerHTML = `${dayName}<br>${dayNum}`;

    // Highlight today
    if (
      dayDate.getDate() === new Date().getDate() &&
      dayDate.getMonth() === new Date().getMonth() &&
      dayDate.getFullYear() === new Date().getFullYear()
    ) {
      headerCell.classList.add('today');
    }

    headerRow.appendChild(headerCell);
  }

  calendarGrid.appendChild(headerRow);

  // Create time slots (from 8 AM to 5 PM)
  for (let hour = 8; hour < 18; hour++) {
    // Create row for this hour
    const timeRow = document.createElement('div');
    timeRow.className = 'week-row';

    // Add time label
    const timeLabel = document.createElement('div');
    timeLabel.className = 'time-label';
    timeLabel.textContent = hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    timeRow.appendChild(timeLabel);

    // Add day cells
    for (let day = 0; day < 7; day++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + day);

      const cellDate = formatDate(dayDate);
      const cellTime = `${String(hour).padStart(2, '0')}:00`;

      const dayCell = document.createElement('div');
      dayCell.className = 'week-day-cell';

      // Find appointments for this time slot
      const appointments = doctorAppointments.filter(apt => {
        if (!apt.appointmentTime) return false;

        const aptDate = apt.date || apt.appointmentTime.split('T')[0];
        const aptTime = apt.appointmentTime.split('T')[1]?.substring(0, 5);

        const aptHour = parseInt(aptTime?.split(':')[0], 10);
        return aptDate === cellDate && aptHour === hour;
      });

      // Add appointments to cell
      appointments.forEach(apt => {
        const appointmentEl = document.createElement('div');
        appointmentEl.className = 'appointment';

        let time = 'TBD';
        if (apt.appointmentTime) {
          const timePart = apt.appointmentTime.split('T')[1];
          if (timePart) {
            time = timePart.substring(0, 5);
          }
        }

        appointmentEl.textContent = `${time} - ${apt.patientName || 'Patient'}`;

        appointmentEl.addEventListener('click', (e) => {
          e.stopPropagation();
          showAppointmentDetails(apt);
        });

        dayCell.appendChild(appointmentEl);
      });

      // Check for availability
      const available = doctorAvailability.some(slot => {
        return slot.date === cellDate && slot.time === cellTime;
      });

      if (available && appointments.length === 0) {
        const availabilityEl = document.createElement('div');
        availabilityEl.className = 'available-slot';
        availabilityEl.textContent = 'Available';
        dayCell.appendChild(availabilityEl);
      }

      timeRow.appendChild(dayCell);
    }

    calendarGrid.appendChild(timeRow);
  }
}

// Render day view of the calendar
function renderDayView() {
  calendarGrid.innerHTML = '';

  // Format the date string for the selected day
  const dateString = formatDate(currentDate);

  // Create header row
  const headerRow = document.createElement('div');
  headerRow.className = 'calendar-header';

  // Add time column header
  const timeHeader = document.createElement('div');
  headerRow.appendChild(timeHeader);

  // Add day header
  const dayHeader = document.createElement('div');
  dayHeader.textContent = currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  headerRow.appendChild(dayHeader);

  calendarGrid.appendChild(headerRow);

  // Create time slots (from 8 AM to 5 PM)
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Create row for this time slot
      const timeRow = document.createElement('div');

      // Format time
      const formattedHour = hour > 12 ? hour - 12 : hour;
      const amPm = hour >= 12 ? 'PM' : 'AM';
      const timeString = `${formattedHour}:${minute === 0 ? '00' : minute} ${amPm}`;

      // Add time label
      const timeLabel = document.createElement('div');
      timeLabel.className = 'time-label';
      timeLabel.textContent = timeString;
      timeRow.appendChild(timeLabel);

      // Add appointment cell
      const appointmentCell = document.createElement('div');
      appointmentCell.className = 'calendar-cell';

      // Find appointments for this time
      const cellTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      const appointments = doctorAppointments.filter(apt => {
        if (!apt.appointmentTime) return false;

        const aptDate = apt.date || apt.appointmentTime.split('T')[0];
        const aptTime = apt.appointmentTime.split('T')[1]?.substring(0, 5);

        return aptDate === dateString && aptTime === cellTime;
      });

      // Add appointments to cell
      appointments.forEach(apt => {
        const appointmentEl = document.createElement('div');
        appointmentEl.className = 'day-appointment';

        appointmentEl.textContent = `${apt.patientName || 'Patient'} (${apt.duration || '30'} mins)`;

        appointmentEl.addEventListener('click', () => {
          showAppointmentDetails(apt);
        });

        appointmentCell.appendChild(appointmentEl);
      });

      // Check for availability
      const available = doctorAvailability.some(slot => {
        return slot.date === dateString && slot.time === cellTime;
      });

      if (available && appointments.length === 0) {
        const availabilityEl = document.createElement('div');
        availabilityEl.className = 'available-slot';
        availabilityEl.textContent = 'Available';
        appointmentCell.appendChild(availabilityEl);
      }

      timeRow.appendChild(appointmentCell);
      calendarGrid.appendChild(timeRow);
    }
  }
}
