import { createTimer, toggleTimer, setSelectMode, deleteSelectedTimers } from './timer.js';

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

// Add event handlers for the new buttons
document.getElementById('select-mode-toggle').addEventListener('click', function() {
  const isActive = this.classList.toggle('active');
  this.classList.toggle('bg-blue-500', isActive);
  this.classList.toggle('text-white', isActive);
  
  // Toggle button states
  const addButton = document.getElementById('add-timer');
  const syncButton = document.getElementById('single-timer-mode');
  const selectAllButton = document.getElementById('select-all');
  const deleteButton = document.getElementById('delete-selected');
  
  // Disable/enable main buttons
  addButton.disabled = isActive;
  addButton.classList.toggle('pointer-events-none', isActive);
  syncButton.disabled = isActive;
  syncButton.classList.toggle('pointer-events-none', isActive);
  
  // Show/hide selection mode buttons
  selectAllButton.classList.toggle('show', isActive);
  deleteButton.classList.toggle('show', isActive);
  
  document.body.classList.toggle('select-mode-active', isActive);
  setSelectMode(isActive);
});

// Add select all button handler
document.getElementById('select-all').addEventListener('click', () => {
  const allTimers = document.querySelectorAll('.timer');
  const allSelected = Array.from(allTimers).every(timer => timer.dataset.selected === "true");
  
  allTimers.forEach(timer => {
    timer.dataset.selected = (!allSelected).toString();
    timer.classList.toggle('selected', !allSelected);
  });
});

document.getElementById('delete-selected').addEventListener('click', () => {
  if (confirm('Are you sure you want to delete the selected timers?')) {
    deleteSelectedTimers();
    // Exit select mode and reset button states
    const selectModeToggle = document.getElementById('select-mode-toggle');
    selectModeToggle.classList.remove('active', 'bg-blue-500', 'text-white');
    document.body.classList.remove('select-mode-active');
    document.getElementById('delete-selected').classList.remove('show');
    
    // Re-enable buttons
    const addButton = document.getElementById('add-timer');
    const syncButton = document.getElementById('single-timer-mode');
    addButton.disabled = false;
    addButton.classList.remove('pointer-events-none');
    syncButton.disabled = false;
    syncButton.classList.remove('pointer-events-none');
    
    setSelectMode(false);
  }
});

// Add test button handler
document.getElementById('test-mode').addEventListener('click', () => {
  const randomTimers = [
    { 
      duration: Math.floor(Math.random() * 3600) + 60,
      header: "Test Timer " + Math.floor(Math.random() * 100),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    },
    { 
      duration: Math.floor(Math.random() * 3600) + 60,
      header: "Test Timer " + Math.floor(Math.random() * 100),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    },
    { 
      duration: Math.floor(Math.random() * 3600) + 60,
      header: "Test Timer " + Math.floor(Math.random() * 100),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }
  ];
  
  randomTimers.forEach(timer => {
    createTimer(timerContainer, timer.duration, timer.color, timer.header);
  });
});

// Export the state for use in timer.js
export { singleTimerMode, selectedColor };