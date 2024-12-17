import { singleTimerMode, selectedColor } from './script.js';

const SVG_SIZE = 100;
const STROKE_WIDTH = 4;
const PROGRESS_RADIUS = (SVG_SIZE / 2) - (STROKE_WIDTH / 2);
const svgNamespace = "http://www.w3.org/2000/svg";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

let isSelectMode = false;

export function setSelectMode(enabled) {
  isSelectMode = enabled;
  document.querySelectorAll('.timer').forEach(timer => {
    if (!enabled) {
      timer.classList.remove('selected');
      timer.dataset.selected = "false";
    }
  });
}

export function deleteSelectedTimers() {
  document.querySelectorAll('.timer[data-selected="true"]').forEach(timer => {
    gsap.to(timer, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      onComplete: () => timer.remove()
    });
  });
}

export function createTimer(container, duration = 10, color = selectedColor, header = "") {
  const timerElement = document.createElement("div");
  const grayColor = "#cbd5e1";
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  timerElement.className = "timer bg-white shadow-2xl rounded-full flex items-center justify-center relative overflow-visible timer-inactive my-4";
  timerElement.style.padding = `${STROKE_WIDTH * 2}px`;
  timerElement.dataset.id = Date.now();
  timerElement.dataset.duration = duration;
  timerElement.dataset.remaining = duration;
  timerElement.dataset.running = "false";
  timerElement.dataset.completed = "false";
  timerElement.dataset.color = color;
  timerElement.dataset.selected = "false";
  timerElement.dataset.createdAt = today.toISOString(); // Store as ISO string instead of timestamp

  const stateIconSvg = document.createElementNS(svgNamespace, "svg");
  stateIconSvg.classList.add("absolute", "inset-0", "w-full", "h-full", "pointer-events-none", "state-icon");
  stateIconSvg.setAttribute("viewBox", "0 0 100 100");

  const playPath = document.createElementNS(svgNamespace, "path");
  playPath.classList.add("play-icon", "hidden");
  playPath.setAttribute("d", "M35 25L75 50L35 75V25Z");
  playPath.setAttribute("fill", "currentColor");

  const pausePath = document.createElementNS(svgNamespace, "path");
  pausePath.classList.add("pause-icon");
  pausePath.setAttribute("d", "M35 25H45V75H35V25ZM65 25H55V75H65V25Z");
  pausePath.setAttribute("fill", "currentColor");

  stateIconSvg.appendChild(playPath);
  stateIconSvg.appendChild(pausePath);
  timerElement.appendChild(stateIconSvg);

  const svg = document.createElementNS(svgNamespace, "svg");
  svg.classList.add("absolute", "inset-0", "w-full", "h-full");
  svg.setAttribute("viewBox", "0 0 100 100");

  const progressCircle = document.createElementNS(svgNamespace, "circle");
  progressCircle.setAttribute("cx", SVG_SIZE/2);
  progressCircle.setAttribute("cy", SVG_SIZE/2);
  progressCircle.setAttribute("stroke", grayColor);
  progressCircle.setAttribute("stroke-width", STROKE_WIDTH);
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("r", PROGRESS_RADIUS);
  progressCircle.setAttribute("transform", `rotate(-90, ${SVG_SIZE/2}, ${SVG_SIZE/2})`);
  
  const circumference = 2 * Math.PI * PROGRESS_RADIUS;
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", circumference.toString());

  svg.appendChild(progressCircle);

  timerElement.appendChild(svg);
  
  const textWrapper = document.createElement("div");
  textWrapper.className = "flex flex-col items-center justify-center z-30 relative";
  
  if (header) {
    const headerText = document.createElement("div");
    headerText.className = "text-base font-medium text-white mb-1"; // Changed from text-gray-600
    headerText.textContent = header;
    textWrapper.appendChild(headerText);
  }
  
  const timerText = document.createElement("span");
  timerText.className = "text-2xl font-semibold flex items-center gap-2";
  timerText.innerHTML = `
    <span class="remaining text-white">${formatTime(duration)}</span>
    <span class="text-base text-white opacity-50">/</span>
    <span class="text-white opacity-75">${formatTime(duration)}</span>
  `;
  textWrapper.appendChild(timerText);
  
  timerElement.appendChild(textWrapper);

  timerElement.addEventListener("click", () => {
    timerElement.classList.add('timer-tap');
    setTimeout(() => timerElement.classList.remove('timer-tap'), 200);

    if (isSelectMode) {
      const isSelected = timerElement.dataset.selected === "true";
      timerElement.dataset.selected = !isSelected;
      timerElement.classList.toggle('selected', !isSelected);
    } else {
      toggleTimer(timerElement);
    }
  });

  container.appendChild(timerElement);

  gsap.fromTo(
    timerElement,
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
  );
}

function updateIconState(timerElement, running) {
  const playIcon = timerElement.querySelector('.play-icon');
  const pauseIcon = timerElement.querySelector('.pause-icon');
  if (running) {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
  } else {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
  }
}

export function toggleTimer(timerElement) {
  const running = timerElement.dataset.running === "true";
  const completed = timerElement.dataset.completed === "true";
  
  if (completed) {
    timerElement.dataset.completed = "false";
    timerElement.dataset.remaining = timerElement.dataset.duration;
    timerElement.classList.remove('timer-completed');
    updateProgress(timerElement, 0);
    updateTime(timerElement, timerElement.dataset.duration);
    return;
  }
  
  timerElement.classList.remove('timer-completed');
  
  if (singleTimerMode && !running) {
    const allTimers = document.querySelectorAll('.timer');
    allTimers.forEach(timer => {
      if (timer !== timerElement && timer.dataset.running === "true") {
        stopTimer(timer);
      }
    });
  }

  if (running) {
    stopTimer(timerElement);
  } else {
    startTimer(timerElement);
  }
}

function startTimer(timerElement) {
  timerElement.classList.remove('timer-completed');
  timerElement.classList.remove('timer-inactive');
  timerElement.dataset.running = "true";
  
  const duration = parseFloat(timerElement.dataset.duration);
  const remaining = parseFloat(timerElement.dataset.remaining);
  const endTime = Date.now() + (remaining * 1000);
  timerElement.dataset.endTime = endTime;
  
  const color = timerElement.dataset.color;
  timerElement.style.backgroundColor = color; // Add this line
  const circle = timerElement.querySelector("circle");
  circle.setAttribute("stroke", color);

  timerElement.classList.add('timer-pulse');
  setTimeout(() => timerElement.classList.remove('timer-pulse'), 500);

  const interval = setInterval(() => {
    const now = Date.now();
    const remainingMs = Math.max(0, endTime - now);
    const newRemaining = remainingMs / 1000;
    timerElement.dataset.remaining = newRemaining;

    const progress = ((duration - newRemaining) / duration) * 100;
    updateProgress(timerElement, progress);
    updateTime(timerElement, newRemaining);

    if (newRemaining <= 0) {
      clearInterval(interval);
      timerElement.dataset.running = "false";
      timerElement.dataset.completed = "true";
      timerElement.classList.add('timer-completed');
      gsap.to(timerElement, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    }
  }, 1000 / 60);

  timerElement.dataset.intervalId = interval;
  updateIconState(timerElement, true);
}

function stopTimer(timerElement) {
  timerElement.dataset.running = "false";
  clearInterval(timerElement.dataset.intervalId);
  timerElement.classList.add('timer-inactive');
  const grayColor = "#cbd5e1";
  timerElement.style.backgroundColor = "#f1f5f9"; // Reset background color
  const circle = timerElement.querySelector("circle");
  circle.setAttribute("stroke", grayColor);

  timerElement.classList.add('timer-pulse');
  setTimeout(() => timerElement.classList.remove('timer-pulse'), 500);

  updateIconState(timerElement, false);
}

function updateProgress(timerElement, progress) {
  const circle = timerElement.querySelector("circle");
  const circumference = 2 * Math.PI * PROGRESS_RADIUS;
  const dashOffset = ((100 - progress) / 100) * circumference;
  circle.style.transition = 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease';
  circle.setAttribute("stroke-dasharray", circumference);
  circle.setAttribute("stroke-dashoffset", dashOffset);
}

function updateTime(timerElement, time) {
  timerElement.querySelector(".remaining").textContent = formatTime(time);
}

// Add new function for timer cleanup
function cleanupOldTimers() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  document.querySelectorAll('.timer').forEach(timer => {
    const createdDate = new Date(timer.dataset.createdAt);
    if (createdDate < today) {
      timer.remove();
    }
  });
}

// Add visibility change detection
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    cleanupOldTimers();
  }
});

// Add wake detection using timestamp comparison
let lastActiveTime = Date.now();

setInterval(() => {
  const now = Date.now();
  const timeSinceLastActive = now - lastActiveTime;
  
  // If more than 1 second has passed between checks, device might have slept
  if (timeSinceLastActive > 1000) {
    cleanupOldTimers();
  }
  
  lastActiveTime = now;
}, 1000);

// Run cleanup on page load
cleanupOldTimers();
