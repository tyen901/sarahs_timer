import { createTimer, toggleTimer } from './timer.js';

const timerContainer = document.getElementById("timer-container");
const addTimerButton = document.getElementById("add-timer");

// Add timer on button click
addTimerButton.addEventListener("click", () => {
  const duration = parseInt(prompt("Enter duration (seconds):", "10"));
  if (!isNaN(duration) && duration > 0) {
    createTimer(timerContainer, duration);
  }
});

// Create 3 test timers on page load
document.addEventListener('DOMContentLoaded', () => {
  for (let i = 0; i < 3; i++) {
    createTimer(timerContainer);
  }
});