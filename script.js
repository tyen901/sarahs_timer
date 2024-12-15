import { createTimer, toggleTimer } from './timer.js';

const timerContainer = document.getElementById("timer-container");
const addTimerButton = document.getElementById("add-timer");
const singleTimerToggle = document.getElementById("single-timer-mode");

// Add toggle state tracking
let singleTimerMode = false;

// Update toggle button handler
singleTimerToggle.addEventListener("click", () => {
  singleTimerMode = !singleTimerMode;
  singleTimerToggle.classList.toggle('active');
});

// Add color selection state
let selectedColor = "#3498db";

// Add color picker functionality
document.querySelectorAll('.color-option').forEach(button => {
  button.addEventListener('click', (e) => {
    document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    selectedColor = button.dataset.color;
  });
});

// Add timer on button click
const modal = document.getElementById("addTimerModal");
const addTimerForm = document.getElementById("addTimerForm");
const cancelTimer = document.getElementById("cancelTimer");

// Update add timer button to show modal instead of prompt
addTimerButton.addEventListener("click", () => {
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("show"), 0);
});

// Handle form submission
addTimerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const duration = parseInt(document.getElementById("timerDuration").value);
  const header = document.getElementById("timerHeader").value;
  
  if (!isNaN(duration) && duration > 0) {
    createTimer(timerContainer, duration, selectedColor, header);
    closeModal();
    addTimerForm.reset();
  }
});

// Close modal on cancel
cancelTimer.addEventListener("click", closeModal);

function closeModal() {
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

// Update color picker to work inside modal
document.querySelectorAll('.color-option').forEach(button => {
  button.addEventListener('click', (e) => {
    if (e.currentTarget.closest('.modal')) {
      document.querySelectorAll('.modal .color-option').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      selectedColor = button.dataset.color;
    }
  });
});

// Add preset button handlers
document.querySelectorAll('.preset-btn').forEach(button => {
  button.addEventListener('click', () => {
    const duration = parseInt(button.dataset.duration);
    document.getElementById('timerDuration').value = duration;
  });
});

// Create 3 test timers on page load
document.addEventListener('DOMContentLoaded', () => {
  const sampleTimers = [
    { duration: 10, header: "Coffee Break" },
    { duration: 15, header: "Meditation" },
    { duration: 5, header: "Quick Stretch" }
  ];
  
  sampleTimers.forEach(timer => {
    createTimer(timerContainer, timer.duration, selectedColor, timer.header);
  });
});

// Export the state for use in timer.js
export { singleTimerMode, selectedColor };