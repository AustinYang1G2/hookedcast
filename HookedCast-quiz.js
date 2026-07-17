/* ===========================================================
   QUIZ LOGIC
   Handles: selecting options, moving between steps, animating the
   bobber progress indicator, and handing off answers to the results
   page (via localStorage, since this is a static site with no server).
   =========================================================== */

const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const fillPath = document.getElementById("fill-path");
const bobber = document.getElementById("bobber");
const trackPath = document.getElementById("track-path");

let currentStep = 1;
const totalSteps = steps.length;
const answers = { species: null, location: null, budget: null };

const pathLength = trackPath.getTotalLength(); // 580, matches stroke-dasharray above

function updateProgress() {
  const fraction = (currentStep - 1) / (totalSteps - 1); // 0, 0.5, 1 for 3 steps
  const point = trackPath.getPointAtLength(pathLength * fraction);

  fillPath.style.strokeDashoffset = pathLength * (1 - fraction);
  bobber.setAttribute("cx", point.x);
  bobber.setAttribute("cy", point.y);
}

function showStep(stepNum) {
  steps.forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === stepNum);
  });
  backBtn.style.visibility = stepNum === 1 ? "hidden" : "visible";
  updateNextButton();
  updateProgress();
}

function updateNextButton() {
  const stepEl = document.querySelector(`.step[data-step="${currentStep}"]`);
  const field = stepEl.querySelector("[data-field]").dataset.field;
  nextBtn.disabled = !answers[field];
  nextBtn.textContent = currentStep === totalSteps ? "See My Setup →" : "Next →";
}

// Handle clicking an option button
document.querySelectorAll(".option-list").forEach((list) => {
  const field = list.dataset.field;
  list.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", () => {
      list.querySelectorAll(".option").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[field] = btn.dataset.value;
      updateNextButton();
    });
  });
});

nextBtn.addEventListener("click", () => {
  if (currentStep < totalSteps) {
    currentStep += 1;
    showStep(currentStep);
  } else {
    // Last step: save answers and go to the results page
    localStorage.setItem("castright-answers", JSON.stringify(answers));
    window.location.href = "results.html";
  }
});

backBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep -= 1;
    showStep(currentStep);
  }
});

showStep(currentStep);
