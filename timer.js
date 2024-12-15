import { singleTimerMode, selectedColor } from './script.js';

const SVG_SIZE = 100;
const STROKE_WIDTH = 4;
const RADIUS = (SVG_SIZE / 2) - (STROKE_WIDTH * 2); // Accounts for stroke width

// Add this helper function near the top with other constants
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function createTimer(container, duration = 10, color = selectedColor, header = "") {
  const timerElement = document.createElement("div");
  timerElement.className =
    "timer bg-white shadow-2xl rounded-full flex items-center justify-center relative overflow-hidden hover:scale-105 transition-transform";
  timerElement.dataset.id = Date.now();
  timerElement.dataset.duration = duration;
  timerElement.dataset.remaining = duration;
  timerElement.dataset.running = "false";
  // Add completed state to initial data attributes
  timerElement.dataset.completed = "false";

  // Add header if provided
  if (header) {
    const headerElement = document.createElement("div");
    headerElement.className = "absolute top-0 left-0 w-full text-center -mt-8 text-gray-700 font-medium";
    headerElement.textContent = header;
    timerElement.appendChild(headerElement);
  }

  // Create SVG elements for the progress ring
  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.classList.add("absolute", "inset-0", "w-full", "h-full");
  svg.setAttribute("viewBox", "0 0 100 100");  // Add viewBox for consistent scaling

  const backgroundCircle = document.createElementNS(svgNamespace, "circle");
  backgroundCircle.setAttribute("cx", SVG_SIZE/2);
  backgroundCircle.setAttribute("cy", SVG_SIZE/2);
  backgroundCircle.setAttribute("stroke", "#e6e6e6");
  backgroundCircle.setAttribute("stroke-width", STROKE_WIDTH);
  backgroundCircle.setAttribute("fill", "none");
  backgroundCircle.setAttribute("r", RADIUS);

  const progressCircle = document.createElementNS(svgNamespace, "circle");
  progressCircle.setAttribute("cx", SVG_SIZE/2);
  progressCircle.setAttribute("cy", SVG_SIZE/2);
  progressCircle.setAttribute("stroke", color);
  progressCircle.setAttribute("stroke-width", STROKE_WIDTH);
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("r", RADIUS);
  progressCircle.setAttribute("transform", `rotate(-90, ${SVG_SIZE/2}, ${SVG_SIZE/2})`);
  
  // Set initial stroke properties
  const circumference = 2 * Math.PI * RADIUS;
  progressCircle.setAttribute("stroke-dasharray", circumference);
  progressCircle.setAttribute("stroke-dashoffset", circumference.toString()); // Start empty

  svg.appendChild(backgroundCircle);
  svg.appendChild(progressCircle);

  timerElement.appendChild(svg);
  
  // Create wrapper for text elements
  const textWrapper = document.createElement("div");
  textWrapper.className = "flex flex-col items-center justify-center z-10";
  
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

  // Add click event to start/pause the timer
  timerElement.addEventListener("click", () => toggleTimer(timerElement));

  // Append to container
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
  timerElement.classList.remove('timer-completed'); // Remove pulse if restarting
  timerElement.dataset.running = "true";
  const duration = parseFloat(timerElement.dataset.duration);
  const remaining = parseFloat(timerElement.dataset.remaining);
  const startTime = performance.now();

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
}

function stopTimer(timerElement) {
  timerElement.dataset.running = "false";
  clearInterval(timerElement.dataset.intervalId);
}

// Update timer state styles to use the timer's initial color
function updateProgress(timerElement, progress) {
  const circle = timerElement.querySelector("circle:nth-child(2)");
  const circumference = 2 * Math.PI * RADIUS;
  // Modify the dashOffset calculation to fill up
  const dashOffset = ((100 - progress) / 100) * circumference;
  circle.style.transition = 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease';
  circle.setAttribute("stroke-dasharray", circumference);
  circle.setAttribute("stroke-dashoffset", dashOffset);
}

function updateTime(timerElement, time) {
  timerElement.querySelector(".remaining").textContent = formatTime(time);
}
