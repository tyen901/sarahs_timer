import { singleTimerMode, selectedColor } from './script.js';

const SVG_SIZE = 100;
const STROKE_WIDTH = 4;
const INNER_RADIUS = (SVG_SIZE / 2) - (STROKE_WIDTH * 2);
const PROGRESS_RADIUS = (SVG_SIZE / 2) - (STROKE_WIDTH / 2); // Larger radius for progress ring
const svgNamespace = "http://www.w3.org/2000/svg";

// Add this helper function near the top with other constants
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Add at top with other imports
let isSelectMode = false;

// Add after other constants
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
  const grayColor = "#cbd5e1";  // Add this at the top
  
  timerElement.className = "timer bg-white shadow-2xl rounded-full flex items-center justify-center relative overflow-visible timer-inactive my-4";
  timerElement.style.borderWidth = `${STROKE_WIDTH}px`;
  timerElement.style.borderStyle = "solid";
  timerElement.style.borderColor = grayColor;
  timerElement.style.padding = `${STROKE_WIDTH * 2}px`; // Add padding to shrink inner content
  timerElement.dataset.id = Date.now();
  timerElement.dataset.duration = duration;
  timerElement.dataset.remaining = duration;
  timerElement.dataset.running = "false";
  // Add completed state to initial data attributes
  timerElement.dataset.completed = "false";
  timerElement.dataset.color = color; // Add color to dataset
  timerElement.dataset.selected = "false";  // Add selected state

  // Create SVG elements for the state icons (play/pause)
  const stateIconSvg = document.createElementNS(svgNamespace, "svg");
  stateIconSvg.classList.add("absolute", "inset-0", "w-full", "h-full", "pointer-events-none", "state-icon");
  stateIconSvg.setAttribute("viewBox", "0 0 100 100");

  // Create play icon path
  const playPath = document.createElementNS(svgNamespace, "path");
  playPath.classList.add("play-icon", "hidden");
  playPath.setAttribute("d", "M35 25L75 50L35 75V25Z");
  playPath.setAttribute("fill", "currentColor");

  // Create pause icon path
  const pausePath = document.createElementNS(svgNamespace, "path");
  pausePath.classList.add("pause-icon");
  pausePath.setAttribute("d", "M35 25H45V75H35V25ZM65 25H55V75H65V25Z");
  pausePath.setAttribute("fill", "currentColor");

  stateIconSvg.appendChild(playPath);
  stateIconSvg.appendChild(pausePath);
  timerElement.appendChild(stateIconSvg);

  // Create SVG elements for the progress ring
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.classList.add("absolute", "inset-0", "w-full", "h-full");
  svg.setAttribute("viewBox", "0 0 100 100");  // Add viewBox for consistent scaling

  const progressCircle = document.createElementNS(svgNamespace, "circle");
  progressCircle.setAttribute("cx", SVG_SIZE/2);
  progressCircle.setAttribute("cy", SVG_SIZE/2);
  progressCircle.setAttribute("stroke", grayColor); // Start with gray stroke
  progressCircle.setAttribute("stroke-width", STROKE_WIDTH);
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("r", PROGRESS_RADIUS);
  progressCircle.setAttribute("transform", `rotate(-90, ${SVG_SIZE/2}, ${SVG_SIZE/2})`);
  
  // Set initial stroke properties
  const circumference = 2 * Math.PI * PROGRESS_RADIUS;
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", circumference.toString()); // Start empty

  svg.appendChild(progressCircle);

  timerElement.appendChild(svg);
  
  // Create wrapper for text elements
  const textWrapper = document.createElement("div");
  textWrapper.className = "flex flex-col items-center justify-center z-30 relative";
  
  // Add header text if provided
  if (header) {
    const headerText = document.createElement("div");
    headerText.className = "text-sm font-medium text-gray-600 mb-1";
    headerText.textContent = header;
    textWrapper.appendChild(headerText);
  }
  
  // Add timer text
  const timerText = document.createElement("span");
  timerText.className = "text-lg font-semibold flex items-center gap-1";
  timerText.innerHTML = `
    <span class="remaining">${formatTime(duration)}</span>
    <span class="text-sm text-gray-400">/</span>
    <span class="text-gray-600">${formatTime(duration)}</span>
  `;
  textWrapper.appendChild(timerText);
  
  timerElement.appendChild(textWrapper);

  // Replace simple click handler with this version
  timerElement.addEventListener("click", () => {
    // Add tap animation
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

  // Animate the timer's entrance
  gsap.fromTo(
    timerElement,
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
  );

  // Remove this section as we're setting it above
  // const circumference = 2 * Math.PI * 45;
  // progressCircle.setAttribute("stroke-dasharray", circumference);
  // progressCircle.setAttribute("stroke-dashoffset", "0");
}

// Move updateIconState outside of createTimer
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
    // Reset the timer when clicking a completed timer
    timerElement.dataset.completed = "false";
    timerElement.dataset.remaining = timerElement.dataset.duration;
    timerElement.classList.remove('timer-completed');
    updateProgress(timerElement, 0);
    updateTime(timerElement, timerElement.dataset.duration);
    return;
  }
  
  // Remove pulse effect when clicked
  timerElement.classList.remove('timer-completed');
  
  if (singleTimerMode && !running) {
    // Stop all other timers first
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
  timerElement.classList.remove('timer-inactive'); // Remove inactive state
  timerElement.dataset.running = "true";
  const duration = parseFloat(timerElement.dataset.duration);
  const remaining = parseFloat(timerElement.dataset.remaining);
  const startTime = performance.now();
  const color = timerElement.dataset.color;
  timerElement.style.borderColor = color;
  const circle = timerElement.querySelector("circle");
  circle.setAttribute("stroke", color);  // This line was already correct

  // Add pulse animation
  timerElement.classList.add('timer-pulse');
  setTimeout(() => timerElement.classList.remove('timer-pulse'), 500);

  const interval = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000;
    const newRemaining = Math.max(remaining - elapsed, 0);
    timerElement.dataset.remaining = newRemaining;

    // Invert the progress calculation here
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
  updateIconState(timerElement, true); // Update to pass timerElement
}

function stopTimer(timerElement) {
  timerElement.dataset.running = "false";
  clearInterval(timerElement.dataset.intervalId);
  timerElement.classList.add('timer-inactive'); // Add inactive state
  const grayColor = "#cbd5e1";
  const circle = timerElement.querySelector("circle");
  circle.setAttribute("stroke", grayColor);  // This makes the progress ring match the border
  timerElement.style.borderColor = grayColor;

  // Add pulse animation
  timerElement.classList.add('timer-pulse');
  setTimeout(() => timerElement.classList.remove('timer-pulse'), 500);

  updateIconState(timerElement, false); // Update to pass timerElement
}

// Update timer state styles to use the timer's initial color
function updateProgress(timerElement, progress) {
  const circle = timerElement.querySelector("circle"); // Changed selector
  const circumference = 2 * Math.PI * PROGRESS_RADIUS;
  // Modify the dashOffset calculation to fill up
  const dashOffset = ((100 - progress) / 100) * circumference;
  circle.style.transition = 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease';
  circle.setAttribute("stroke-dasharray", circumference);
  circle.setAttribute("stroke-dashoffset", dashOffset);
}

function updateTime(timerElement, time) {
  timerElement.querySelector(".remaining").textContent = formatTime(time);
}
