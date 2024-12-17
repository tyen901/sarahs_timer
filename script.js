import { createTimer, toggleTimer, setSelectMode, deleteSelectedTimers } from './timer.js';

const timerContainer = document.getElementById("timer-container");
const addTimerButton = document.getElementById("add-timer");
const singleTimerToggle = document.getElementById("single-timer-mode");

let singleTimerMode = false;

singleTimerToggle.addEventListener("click", () => {
  singleTimerMode = !singleTimerMode;
  singleTimerToggle.classList.toggle('active');
});

let selectedColor = "#3498db";

document.querySelectorAll('.color-option').forEach(button => {
  button.addEventListener('click', (e) => {
    document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    selectedColor = button.dataset.color;
  });
});

const modal = document.getElementById("addTimerModal");
const addTimerForm = document.getElementById("addTimerForm");
const cancelTimer = document.getElementById("cancelTimer");

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

cancelTimer.addEventListener("click", closeModal);

function closeModal() {
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

document.querySelectorAll('.color-option').forEach(button => {
  button.addEventListener('click', (e) => {
    if (e.currentTarget.closest('.modal')) {
      document.querySelectorAll('.modal .color-option').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      selectedColor = button.dataset.color;
    }
  });
});

document.querySelectorAll('.preset-btn').forEach(button => {
  button.addEventListener('click', () => {
    const duration = parseInt(button.dataset.duration);
    document.getElementById('timerDuration').value = duration;
  });
});

document.getElementById('select-mode-toggle').addEventListener('click', function() {
  const isActive = this.classList.toggle('active');
  this.classList.toggle('bg-blue-500', isActive);
  this.classList.toggle('text-white', isActive);
  
  const addButton = document.getElementById('add-timer');
  const syncButton = document.getElementById('single-timer-mode');
  const selectAllButton = document.getElementById('select-all');
  const deleteButton = document.getElementById('delete-selected');
  
  addButton.disabled = isActive;
  addButton.classList.toggle('pointer-events-none', isActive);
  syncButton.disabled = isActive;
  syncButton.classList.toggle('pointer-events-none', isActive);
  
  selectAllButton.classList.toggle('show', isActive);
  deleteButton.classList.toggle('show', isActive);
  
  document.body.classList.toggle('select-mode-active', isActive);
  setSelectMode(isActive);
});

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

    const selectModeToggle = document.getElementById('select-mode-toggle');
    selectModeToggle.classList.remove('active', 'bg-blue-500', 'text-white');
    document.body.classList.remove('select-mode-active');
    document.getElementById('delete-selected').classList.remove('show');
    document.getElementById('select-all').classList.remove('show');
    
    const addButton = document.getElementById('add-timer');
    const syncButton = document.getElementById('single-timer-mode');
    addButton.disabled = false;
    addButton.classList.remove('pointer-events-none');
    syncButton.disabled = false;
    syncButton.classList.remove('pointer-events-none');
    
    setSelectMode(false);
  }
});

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

export { singleTimerMode, selectedColor };