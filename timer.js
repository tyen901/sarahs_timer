const SVG_SIZE = 100;
const STROKE_WIDTH = 4;
const RADIUS = (SVG_SIZE / 2) - (STROKE_WIDTH * 2); // Accounts for stroke width

export function createTimer(container, duration = 10) {
  const timerElement = document.createElement("div");
  timerElement.className =
    "timer w-32 h-32 bg-white shadow-xl rounded-full flex items-center justify-center relative overflow-hidden hover:scale-105 transition-transform";
  timerElement.dataset.id = Date.now();
  timerElement.dataset.duration = duration;
  timerElement.dataset.remaining = duration;
  timerElement.dataset.running = "false";

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
  progressCircle.setAttribute("stroke", "#3498db");
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
  timerElement.innerHTML += `<span class="text-lg font-semibold">${duration}s</span>`;

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
  if (running) {
    stopTimer(timerElement);
  } else {
    startTimer(timerElement);
  }
}

function startTimer(timerElement) {
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
    }
  }, 1000 / 60);

  timerElement.dataset.intervalId = interval;
}

function stopTimer(timerElement) {
  timerElement.dataset.running = "false";
  clearInterval(timerElement.dataset.intervalId);
}

function updateProgress(timerElement, progress) {
  const circle = timerElement.querySelector("circle:nth-child(2)");
  const circumference = 2 * Math.PI * RADIUS;
  // Modify the dashOffset calculation to fill up
  const dashOffset = ((100 - progress) / 100) * circumference;
  circle.style.transition = 'stroke-dashoffset 0.1s ease-out';
  circle.setAttribute("stroke-dasharray", circumference);
  circle.setAttribute("stroke-dashoffset", dashOffset);
}

function updateTime(timerElement, time) {
  const seconds = Math.floor(time);
  timerElement.querySelector("span").textContent = `${seconds}s`;
}
