/* 5041 Belts, Pulleys, Chains, and Sprockets — native-scroll module behavior */
const beltCorrectAnswers = {
  q1: "b",
  q2: "a",
  q3: "b",
  q4: "c",
  q5: "b",
  q6: "a",
  q7: "a",
  q8: "a",
  q9: "a",
  q10: "a",
  q11: "a",
  q12: "a",
  q13: "a",
  q14: "b",
  q15: "a",
  q16: "a",
  q17: "a",
  q18: "a",
  q19: "a",
  q20: "a",
};

const passingScore = 18;
let quizPassed = false;
let participantName = "";

function getParticipantName() {
  const input = document.getElementById("participantName");
  return input ? input.value.trim() : "";
}

function updateCertificateName() {
  participantName = getParticipantName();
  const certificateName = document.getElementById("certificateName");
  if (certificateName) certificateName.textContent = participantName || "Student Name";
}

function getSafeFileName(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certificate"
  );
}

function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");
  if (button) button.disabled = !enabled;
}

async function downloadCertificatePdf() {
  if (!quizPassed) {
    alert("Complete and pass the quiz before downloading the certificate.");
    return;
  }

  updateCertificateName();
  const certificate = document.querySelector("#complete .certificate-card");
  if (!certificate) return;

  if (!window.html2canvas || !window.jspdf) {
    alert("PDF tools could not load. Check your internet connection and try again.");
    return;
  }

  const canvas = await html2canvas(certificate, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imageData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;
  const imageRatio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
  const imageWidth = canvas.width * imageRatio;
  const imageHeight = canvas.height * imageRatio;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);
  const name = getSafeFileName(getParticipantName() || "student");
  pdf.save(`${name}-belts-pulleys-chains-sprockets-certificate.pdf`);
}

function gradeQuiz() {
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");
  const totalQuestions = Object.keys(beltCorrectAnswers).length;
  if (!result || !hint || !complete || !note) return;

  participantName = getParticipantName();
  if (!participantName) {
    quizPassed = false;
    complete.classList.add("locked");
    setCertificateDownloadEnabled(false);
    result.textContent = "Please enter your name before grading the quiz.";
    result.className = "result";
    hint.textContent = "Scroll back to the name entry section, enter your name, then grade again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  let score = 0;
  const unanswered = [];

  Object.entries(beltCorrectAnswers).forEach(([question, answer]) => {
    const selected = document.querySelector(`input[name="${question}"]:checked`);
    if (!selected) {
      unanswered.push(question);
      return;
    }
    if (selected.value === answer) score++;
  });

  if (unanswered.length > 0) {
    quizPassed = false;
    complete.classList.add("locked");
    setCertificateDownloadEnabled(false);
    result.textContent = `Answer all questions before grading. Missing: ${unanswered.length}.`;
    result.className = "result";
    hint.textContent = `Passing score: ${passingScore}/${totalQuestions}.`;
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  if (score >= passingScore) {
    quizPassed = true;
    complete.classList.remove("locked");
    updateCertificateName();
    setCertificateDownloadEnabled(true);
    result.textContent = `Passed: ${score}/${totalQuestions}. Completion certificate unlocked.`;
    result.className = "result success";
    hint.textContent = "You passed. Scroll to the completion certificate.";
    note.textContent = `Certificate earned by ${participantName}. Quiz score: ${score}/${totalQuestions}.`;
  } else {
    quizPassed = false;
    complete.classList.add("locked");
    setCertificateDownloadEnabled(false);
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review the module and try again.`;
    result.className = "result warning";
    hint.textContent = `Passing score: ${passingScore}/${totalQuestions}.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

function resetQuiz() {
  document.querySelectorAll("input[type='radio']").forEach((input) => {
    input.checked = false;
  });

  quizPassed = false;
  setCertificateDownloadEnabled(false);
  const complete = document.getElementById("complete");
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const note = document.getElementById("completionNote");
  if (complete) complete.classList.add("locked");
  if (result) {
    result.textContent = "Not submitted.";
    result.className = "result";
  }
  if (hint) hint.textContent = "After passing, scroll to the final completion certificate.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}

function initBeltSort() {
  document.querySelectorAll(".belt-sort-slide").forEach((slide) => {
    const bank = slide.querySelector(".belt-sort-bank");
    const chips = Array.from(slide.querySelectorAll(".belt-sort-chip"));
    const zones = Array.from(slide.querySelectorAll(".belt-sort-zone"));
    const checkButton = slide.querySelector(".check-belt-sort");
    const resetButton = slide.querySelector(".reset-belt-sort");
    const feedback = slide.querySelector(".belt-sort-feedback");
    let dragged = null;

    chips.forEach((chip, index) => {
      chip.dataset.originalIndex = index;
      chip.addEventListener("dragstart", () => {
        dragged = chip;
        chip.classList.add("dragging");
      });
      chip.addEventListener("dragend", () => {
        chip.classList.remove("dragging");
        dragged = null;
      });
    });

    [...zones, bank].forEach((area) => {
      area.addEventListener("dragover", (event) => event.preventDefault());
      area.addEventListener("drop", (event) => {
        event.preventDefault();
        if (!dragged) return;
        dragged.classList.remove("correct", "incorrect");
        if (area.classList.contains("belt-sort-zone")) {
          area.querySelector(".belt-sort-list").appendChild(dragged);
        } else {
          bank.appendChild(dragged);
        }
      });
    });

    if (checkButton) {
      checkButton.addEventListener("click", () => {
        let correct = 0;
        let placed = 0;
        chips.forEach((chip) => chip.classList.remove("correct", "incorrect"));
        zones.forEach((zone) => {
          const zoneName = zone.dataset.zone;
          zone.querySelectorAll(".belt-sort-chip").forEach((chip) => {
            placed++;
            if (chip.dataset.answer === zoneName) {
              chip.classList.add("correct");
              correct++;
            } else {
              chip.classList.add("incorrect");
            }
          });
        });
        if (!feedback) return;
        if (placed < chips.length) feedback.textContent = `Place all ${chips.length} cards before checking.`;
        else if (correct === chips.length) feedback.textContent = "Correct. Good system choices.";
        else feedback.textContent = `${correct}/${chips.length} correct. Move the red cards and try again.`;
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        chips
          .sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex))
          .forEach((chip) => {
            chip.classList.remove("correct", "incorrect", "dragging");
            bank.appendChild(chip);
          });
        if (feedback) feedback.textContent = "";
      });
    }
  });
}

function togglePrintedCheck(card) {
  card.classList.toggle("selected");
  card.setAttribute("aria-pressed", card.classList.contains("selected") ? "true" : "false");
  card.classList.remove("correct", "incorrect", "missed");
}

function checkPrintedChecks(button) {
  const slide = button.closest(".printed-pulley-check-slide");
  if (!slide) return;
  const cards = slide.querySelectorAll(".printed-check-card");
  const feedback = slide.querySelector(".printed-check-feedback");
  let correct = 0;
  cards.forEach((card) => {
    const shouldSelect = card.dataset.good === "true";
    const isSelected = card.classList.contains("selected");
    card.classList.remove("correct", "incorrect", "missed");
    if (shouldSelect && isSelected) {
      card.classList.add("correct");
      correct++;
    } else if (!shouldSelect && !isSelected) {
      card.classList.add("correct");
      correct++;
    } else if (shouldSelect && !isSelected) {
      card.classList.add("missed");
    } else {
      card.classList.add("incorrect");
    }
  });
  if (feedback) {
    feedback.textContent = correct === cards.length
      ? "Correct. These are solid printed-pulley checks."
      : `${correct}/${cards.length} correct. Green is correct, red should not be selected, and yellow is a missed good check.`;
  }
}

function resetPrintedChecks(button) {
  const slide = button.closest(".printed-pulley-check-slide");
  if (!slide) return;
  const cards = slide.querySelectorAll(".printed-check-card");
  const feedback = slide.querySelector(".printed-check-feedback");
  cards.forEach((card) => {
    card.classList.remove("selected", "correct", "incorrect", "missed");
    card.setAttribute("aria-pressed", "false");
  });
  if (feedback) feedback.textContent = "Select the good design checks.";
}

function calculateBeltRatio() {
  const driver = Number(document.getElementById("driverTeeth")?.value || 0);
  const driven = Number(document.getElementById("drivenTeeth")?.value || 0);
  const speed = Number(document.getElementById("inputSpeed")?.value || 0);
  const ratioEl = document.getElementById("calcRatio");
  const speedEl = document.getElementById("calcSpeed");
  const torqueEl = document.getElementById("calcTorque");
  if (!driver || !driven || !speed || driver <= 0 || driven <= 0 || speed <= 0) {
    if (ratioEl) ratioEl.textContent = "Enter positive numbers to calculate.";
    return;
  }
  const ratio = driven / driver;
  const outputSpeed = speed / ratio;
  if (ratioEl) ratioEl.textContent = `Ratio: ${ratio.toFixed(2)}:1 ${ratio >= 1 ? "reduction" : "speed increase"}`;
  if (speedEl) speedEl.textContent = `Output speed: about ${Math.round(outputSpeed)} RPM`;
  if (torqueEl) torqueEl.textContent = `Torque multiplier: about ${ratio.toFixed(2)}× before losses`;
}

function checkBeltScenarioAnswer(button) {
  const slide = button.closest(".scenario-slide");
  if (!slide) return;
  const buttons = slide.querySelectorAll(".scenario-options button");
  const feedback = slide.querySelector(".scenario-feedback");
  const correct = button.dataset.correct === "true";
  buttons.forEach((b) => b.classList.remove("correct", "incorrect"));
  button.classList.add(correct ? "correct" : "incorrect");
  if (feedback) {
    feedback.textContent = correct
      ? "Correct. Start by checking the mechanical causes of skipping."
      : "Not the best choice. Match pitch, control load, align parts, and tension the system before adding power.";
  }
}

window.togglePrintedCheck = togglePrintedCheck;
window.checkPrintedChecks = checkPrintedChecks;
window.resetPrintedChecks = resetPrintedChecks;
window.calculateBeltRatio = calculateBeltRatio;
window.checkBeltScenarioAnswer = checkBeltScenarioAnswer;

document.addEventListener("DOMContentLoaded", () => {
  const gradeButton = document.getElementById("gradeQuiz");
  const resetButton = document.getElementById("resetQuiz");
  const nameInput = document.getElementById("participantName");
  const downloadButton = document.getElementById("downloadCertificate");
  if (gradeButton) gradeButton.addEventListener("click", gradeQuiz);
  if (resetButton) resetButton.addEventListener("click", resetQuiz);
  if (nameInput) nameInput.addEventListener("input", updateCertificateName);
  if (downloadButton) {
    downloadButton.disabled = true;
    downloadButton.addEventListener("click", downloadCertificatePdf);
  }
  updateCertificateName();
  initBeltSort();
  calculateBeltRatio();
});

