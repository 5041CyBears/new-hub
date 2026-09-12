/* ============================================================================
   5041 Submitted Awards Training Module
   Interactive activities, quiz grading, and certificate behavior.
   ============================================================================ */

/* =========================================================
   Interactive 1 — Award Explorer
   ========================================================= */

const submittedAwardInfo = {
  impact: {
    title: "FIRST Impact Award",
    facts: [
      ["Recognizes", "A team and its sustained, measurable impact"],
      ["2027 deadline", "February 11, 2027 at 3:00 PM ET"],
      ["Submitter", "Student Award Submitter or Lead Coach 1 / 2"],
    ],
    bullets: [
      "2027 uses three equally weighted essay questions with up to 4,000 characters each.",
      "Executive summary questions were removed for 2027.",
      "The optional video and optional documentation form remain available.",
      "Interview: 12 minutes total, with up to 7 minutes for presentation/setup and the remaining time for judge Q&A.",
      "Judges place special emphasis on the last three years and measurable impact.",
    ],
    advice:
      "Build the submission around your strongest evidence, not around a list of everything the team has ever done.",
  },

  leadership: {
    title: "FIRST Leadership Award",
    facts: [
      ["Recognizes", "An individual student leader"],
      ["2027 deadline", "February 4, 2027 at 3:00 PM ET"],
      ["Eligibility", "Up to two active 10th- or 11th-grade team members"],
    ],
    bullets: [
      "Focus on the nominee's individual leadership, FIRST values, STEM experience, team contribution, and impact on others.",
      "The nomination is submitted by Lead Coach 1 / 2 or an eligible adult FIRST Leadership Award Submitter.",
      "The student should read the submitted nomination before the event and be ready to validate its examples.",
      "Interview preparation should be conversational and centered on the student's own actions and reflection.",
    ],
    advice:
      "Write about what this student personally caused, improved, taught, organized, or changed — not just what the team accomplished while they were present.",
  },

  woodie: {
    title: "Woodie Flowers Award",
    facts: [
      ["Recognizes", "A mentor who inspires through communication"],
      ["2027 deadline", "February 4, 2027 at 3:00 PM ET"],
      ["Essay", "Maximum 3,000 characters"],
    ],
    bullets: [
      "Students choose the mentor and write the nomination in their own words.",
      "The essay should show how the mentor motivates, teaches, communicates engineering, and develops student problem solvers.",
      "A strong essay uses specific moments and student outcomes instead of a mentor résumé.",
      "A designated student award submitter completes the nomination.",
    ],
    advice:
      "Use one or two vivid examples that demonstrate how the mentor communicates, then explain how students changed because of that communication.",
  },

  digital: {
    title: "Digital Animation Award",
    facts: [
      ["Recognizes", "Student storytelling through digital animation"],
      ["2027 deadline", "Coming soon on the official FRC Awards page"],
      ["Submitter", "Any adult mentor"],
    ],
    bullets: [
      "This award uses a separate global submission schedule from the three major Dashboard-based submitted awards covered in depth here.",
      "Check the current Digital Animation Award page before beginning production because the theme, technical rules, and deadline may change by season.",
      "Treat copyright, file format, credits, and export testing as part of the project — not as last-minute cleanup.",
    ],
    advice:
      "Start with the current prompt and judging criteria, storyboard before animating, and reserve time for export and upload troubleshooting.",
  },
};

function renderAwardExplorer(key) {
  const output = document.getElementById("submittedAwardOutput");
  const info = submittedAwardInfo[key];

  if (!output || !info) return;

  const facts = info.facts
    .map(
      ([label, value]) => `
        <div class="award-fact">
          <strong>${label}</strong>
          <span>${value}</span>
        </div>
      `,
    )
    .join("");

  output.innerHTML = `
    <h3>${info.title}</h3>
    <div class="award-facts">${facts}</div>
    <ul>${info.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
    <p><strong>Practical advice:</strong> ${info.advice}</p>
  `;
}

document.querySelectorAll(".submitted-award-chips .award-chip").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".submitted-award-chips .award-chip")
      .forEach((item) => item.classList.remove("active"));

    button.classList.add("active");
    renderAwardExplorer(button.dataset.award);
  });
});

/* =========================================================
   Interactive 2 — Impact Essay Planner
   ========================================================= */

const impactPromptCoaching = {
  mission: {
    title: "Spread the FIRST mission",
    coaching:
      "Focus on how your team reaches people beyond its existing members. Strong examples include starting or growing FIRST pathways, demonstrations that create follow-up engagement, local volunteerism, or sustained partnerships that introduce new audiences to FIRST.",
  },
  community: {
    title: "Impact the FIRST community",
    coaching:
      "Focus on how other FIRST teams, volunteers, events, or shared programs are stronger because of your team's work. Mentoring, event support, workshops, published resources, and sustained team support are useful only when you can explain the result.",
  },
  future: {
    title: "Inspire the STEM future + sustainability",
    coaching:
      "Connect student growth and future STEM opportunities to the systems that keep your team and programs alive: training, recruiting, mentor development, funding, curriculum, advocacy, partnerships, documentation, and succession planning.",
  },
};

const plannerFields = [
  document.getElementById("plannerClaim"),
  document.getElementById("plannerEvidence"),
  document.getElementById("plannerResult"),
].filter(Boolean);

function updatePromptCoach() {
  const select = document.getElementById("impactPromptSelect");
  const coach = document.getElementById("promptCoach");

  if (!select || !coach) return;

  const info = impactPromptCoaching[select.value];
  coach.innerHTML = `<h3>${info.title}</h3><p>${info.coaching}</p>`;
}

function getPlannerText() {
  return plannerFields.map((field) => field.value.trim()).filter(Boolean).join(" ");
}

function updatePlannerCharacterCount() {
  const count = document.getElementById("plannerCharacterCount");
  if (!count) return;

  const total = getPlannerText().length;
  count.textContent = `${total.toLocaleString()} characters in this practice paragraph`;

  count.style.color = total > 2400 ? "#b00020" : "";
}

function buildImpactParagraph() {
  const output = document.getElementById("impactParagraphOutput");
  const claim = document.getElementById("plannerClaim")?.value.trim() || "";
  const evidence = document.getElementById("plannerEvidence")?.value.trim() || "";
  const result = document.getElementById("plannerResult")?.value.trim() || "";

  if (!output) return;

  if (!claim || !evidence || !result) {
    output.textContent =
      "Complete all three boxes. A useful Impact paragraph needs an action, evidence, and a result.";
    return;
  }

  output.innerHTML = `
    <h3>Practice paragraph</h3>
    <p>${claim} ${evidence} ${result}</p>
  `;
}

document.getElementById("impactPromptSelect")?.addEventListener("change", updatePromptCoach);
plannerFields.forEach((field) => field.addEventListener("input", updatePlannerCharacterCount));
document.getElementById("buildImpactParagraph")?.addEventListener("click", buildImpactParagraph);

/* =========================================================
   Interactive 3 — Evidence Sort
   ========================================================= */

let draggedEvidenceChip = null;
const evidenceBank = document.querySelector(".awards-sort-bank");
const evidenceZones = document.querySelectorAll(".awards-sort-zone");

function enableEvidenceDrop(area) {
  area.addEventListener("dragover", (event) => {
    event.preventDefault();
    area.classList.add("drag-over");
  });

  area.addEventListener("dragleave", () => {
    area.classList.remove("drag-over");
  });

  area.addEventListener("drop", (event) => {
    event.preventDefault();
    area.classList.remove("drag-over");

    if (!draggedEvidenceChip) return;

    draggedEvidenceChip.classList.remove("correct", "incorrect");

    if (area.classList.contains("awards-sort-bank")) {
      area.appendChild(draggedEvidenceChip);
    } else {
      area.querySelector(".awards-sort-list")?.appendChild(draggedEvidenceChip);
    }
  });
}

document.querySelectorAll(".awards-sort-chip").forEach((chip) => {
  chip.addEventListener("dragstart", () => {
    draggedEvidenceChip = chip;
    chip.classList.add("dragging");
  });

  chip.addEventListener("dragend", () => {
    chip.classList.remove("dragging");
    draggedEvidenceChip = null;
  });
});

if (evidenceBank) enableEvidenceDrop(evidenceBank);
evidenceZones.forEach(enableEvidenceDrop);

function checkEvidenceSort() {
  let placed = 0;
  let correct = 0;

  evidenceZones.forEach((zone) => {
    const zoneAnswer = zone.dataset.zone;

    zone.querySelectorAll(".awards-sort-chip").forEach((chip) => {
      placed += 1;
      chip.classList.remove("correct", "incorrect");

      if (chip.dataset.answer === zoneAnswer) {
        correct += 1;
        chip.classList.add("correct");
      } else {
        chip.classList.add("incorrect");
      }
    });
  });

  const total = document.querySelectorAll(".awards-sort-chip").length;
  const feedback = document.getElementById("evidenceSortFeedback");

  if (!feedback) return;

  if (placed < total) {
    feedback.textContent = `Place all ${total} statements before checking. ${total - placed} still in the bank.`;
    return;
  }

  feedback.textContent = `${correct} of ${total} sorted correctly.`;
}

function resetEvidenceSort() {
  if (!evidenceBank) return;

  document.querySelectorAll(".awards-sort-chip").forEach((chip) => {
    chip.classList.remove("correct", "incorrect");
    evidenceBank.appendChild(chip);
  });

  const feedback = document.getElementById("evidenceSortFeedback");
  if (feedback) feedback.textContent = "";
}

document.getElementById("checkEvidenceSort")?.addEventListener("click", checkEvidenceSort);
document.getElementById("resetEvidenceSort")?.addEventListener("click", resetEvidenceSort);

/* =========================================================
   Interactive 4 — Presentation Time Budget
   ========================================================= */

const timeInputs = [...document.querySelectorAll(".time-input")];

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updatePresentationBudget() {
  const total = timeInputs.reduce((sum, input) => {
    const value = Number(input.value);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const totalOutput = document.getElementById("presentationTotal");
  const feedback = document.getElementById("presentationBudgetFeedback");

  if (totalOutput) totalOutput.textContent = formatSeconds(total);
  if (!feedback) return;

  if (total > 420) {
    feedback.textContent = `Over the official 7:00 presentation maximum by ${formatSeconds(total - 420)}. Cut content before practicing.`;
    feedback.style.color = "#b00020";
  } else if (total > 390) {
    feedback.textContent = `Fits officially, but only leaves ${formatSeconds(420 - total)} of presentation margin. Consider trimming for setup and recovery time.`;
    feedback.style.color = "#8a5a00";
  } else if (total >= 345) {
    feedback.textContent = `Good practice range. Planned presentation: ${formatSeconds(total)}, leaving ${formatSeconds(420 - total)} before the official maximum.`;
    feedback.style.color = "#2e7d32";
  } else {
    feedback.textContent = `Planned presentation is ${formatSeconds(total)}. That leaves substantial room; make sure you are not omitting your strongest evidence.`;
    feedback.style.color = "";
  }
}

timeInputs.forEach((input) => input.addEventListener("input", updatePresentationBudget));

/* =========================================================
   Interactive 5 — Impact Q&A Practice
   ========================================================= */

const impactQaQuestions = [
  "Which one of your programs would you keep if your team could only sustain one, and why?",
  "What is one Impact claim in your submission that judges could independently verify?",
  "How do you know your outreach changed something rather than simply reaching a large audience?",
  "Tell us about a program your team changed or stopped because the evidence showed it was not working.",
  "How do new students learn to lead the programs that graduating students currently run?",
  "What does your team do that another FRC team could realistically replicate?",
  "Which community partnership has produced the most meaningful long-term result?",
  "What is your strongest example of impacting another FIRST team rather than only your own team?",
  "How has participation on your team changed students' STEM pathways or confidence?",
  "What is your biggest sustainability risk right now, and what are you doing about it?",
  "How do you avoid double-counting participants across repeated outreach events?",
  "What accomplishment from the last 12–18 months best represents your current team?",
  "How do your fundraising and mentor-development systems support long-term impact?",
  "What claim in your submission are you most proud of, and what evidence supports it?",
  "How do you make sure your programs are student-led rather than mentor-dependent?",
];

let qaTimerInterval = null;
let qaSecondsRemaining = 60;
let previousQaIndex = -1;

function newQaQuestion() {
  const output = document.getElementById("qaQuestion");
  if (!output) return;

  let index = Math.floor(Math.random() * impactQaQuestions.length);

  if (impactQaQuestions.length > 1) {
    while (index === previousQaIndex) {
      index = Math.floor(Math.random() * impactQaQuestions.length);
    }
  }

  previousQaIndex = index;
  output.textContent = impactQaQuestions[index];
}

function updateQaTimerDisplay() {
  const timer = document.getElementById("qaTimer");
  if (!timer) return;

  timer.textContent = formatSeconds(qaSecondsRemaining);
  timer.classList.toggle("warning", qaSecondsRemaining <= 10);
}

function startQaTimer() {
  if (qaTimerInterval) clearInterval(qaTimerInterval);

  qaSecondsRemaining = 60;
  updateQaTimerDisplay();

  qaTimerInterval = setInterval(() => {
    qaSecondsRemaining -= 1;
    updateQaTimerDisplay();

    if (qaSecondsRemaining <= 0) {
      clearInterval(qaTimerInterval);
      qaTimerInterval = null;
    }
  }, 1000);
}

document.getElementById("newQaQuestion")?.addEventListener("click", newQaQuestion);
document.getElementById("startQaTimer")?.addEventListener("click", startQaTimer);

/* =========================================================
   Interactive 6 — Leadership Evidence Challenge
   ========================================================= */

function enableResponseChallenge(selector, feedbackId, successText, retryText) {
  const cards = [...document.querySelectorAll(selector)];
  const feedback = document.getElementById(feedbackId);

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((item) => item.classList.remove("correct", "incorrect"));

      const correct = card.dataset.correct === "true";
      card.classList.add(correct ? "correct" : "incorrect");

      if (feedback) {
        feedback.textContent = correct ? successText : retryText;
      }
    });
  });
}

enableResponseChallenge(
  ".leadership-response",
  "leadershipResponseFeedback",
  "Correct. It identifies the student's action, leadership system, scale, and measurable result.",
  "Try again. Look for evidence that clearly shows what the individual student did and what changed because of it.",
);

/* =========================================================
   Interactive 7 — Woodie Flowers Specificity Challenge
   ========================================================= */

enableResponseChallenge(
  ".woodie-response",
  "woodieResponseFeedback",
  "Correct. The story demonstrates communication style, engineering teaching, student ownership, and a memorable moment.",
  "Try again. The strongest Woodie Flowers writing shows how communication changed student thinking or behavior, not just that a mentor is helpful.",
);

/* =========================================================
   Interactive 8 — Submission Readiness Checklist
   ========================================================= */

const checklistInputs = [...document.querySelectorAll("#submissionChecklist input[type='checkbox']")];

function updateChecklist() {
  const checked = checklistInputs.filter((input) => input.checked).length;
  const total = checklistInputs.length;
  const percent = total ? (checked / total) * 100 : 0;

  const fill = document.getElementById("checklistMeterFill");
  const status = document.getElementById("checklistStatus");

  if (fill) fill.style.width = `${percent}%`;

  if (status) {
    if (checked === total && total > 0) {
      status.textContent = `${checked} of ${total} ready. Now have someone outside the writing group verify the final submission.`;
      status.style.color = "#2e7d32";
    } else {
      status.textContent = `${checked} of ${total} ready.`;
      status.style.color = "";
    }
  }
}

checklistInputs.forEach((input) => input.addEventListener("change", updateChecklist));

/* =========================================================
   Quiz and certificate
   ========================================================= */

const submittedAwardsCorrectAnswers = {
  q1: "b",
  q2: "a",
  q3: "b",
  q4: "a",
  q5: "b",
  q6: "b",
  q7: "b",
  q8: "a",
  q9: "c",
  q10: "b",
  q11: "b",
  q12: "a",
  q13: "b",
  q14: "a",
  q15: "a",
  q16: "a",
  q17: "a",
  q18: "b",
  q19: "b",
  q20: "b",
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

  if (certificateName) {
    certificateName.textContent = participantName || "Student Name";
  }
}

function setCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");
  if (button) button.disabled = !enabled;
}

function gradeQuiz() {
  let score = 0;
  let unanswered = 0;

  for (const [name, correct] of Object.entries(submittedAwardsCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);

    if (!checked) unanswered += 1;
    else if (checked.value === correct) score += 1;
  }

  const totalQuestions = Object.keys(submittedAwardsCorrectAnswers).length;
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");

  if (!result || !hint || !complete || !note) return;

  updateCertificateName();
  participantName = getParticipantName();

  if (!participantName) {
    quizPassed = false;
    setCertificateDownloadEnabled(false);
    complete.classList.add("locked");
    result.textContent = "Please enter your name before grading the quiz.";
    result.className = "result";
    hint.textContent = "Go back to the name entry section, enter your name, then grade again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  if (unanswered > 0) {
    quizPassed = false;
    setCertificateDownloadEnabled(false);
    complete.classList.add("locked");
    result.textContent = `You still need to answer ${unanswered} question(s).`;
    result.className = "result";
    hint.textContent = "Answer every question, then grade the quiz again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  if (score >= passingScore) {
    quizPassed = true;
    setCertificateDownloadEnabled(true);
    complete.classList.remove("locked");
    result.textContent = `Passed: ${score}/${totalQuestions}. Completion certificate unlocked.`;
    result.className = "result success";
    hint.textContent = "You passed. Advance to the completion certificate.";
    note.textContent = `Certificate earned by ${participantName}. Quiz score: ${score}/${totalQuestions}.`;
  } else {
    quizPassed = false;
    setCertificateDownloadEnabled(false);
    complete.classList.add("locked");
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review and try again.`;
    result.className = "result";
    hint.textContent = `You need at least ${passingScore}/${totalQuestions} to unlock the completion certificate.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

function resetQuiz() {
  Object.keys(submittedAwardsCorrectAnswers).forEach((questionName) => {
    document.querySelectorAll(`input[name="${questionName}"]`).forEach((input) => {
      input.checked = false;
    });
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

  if (hint) hint.textContent = "After passing, advance to the final completion certificate.";
  if (note) note.textContent = "Complete after passing the required quiz.";
}

document.getElementById("gradeQuiz")?.addEventListener("click", gradeQuiz);
document.getElementById("resetQuiz")?.addEventListener("click", resetQuiz);

Reveal.on("slidechanged", (event) => {
  if (event.currentSlide && event.currentSlide.id === "complete" && !quizPassed) {
    const resultsSlide = document.getElementById("quiz-results");
    const resultsIndex = Reveal.getIndices(resultsSlide);

    setTimeout(() => {
      Reveal.slide(resultsIndex.h, resultsIndex.v || 0);

      const result = document.getElementById("quizResult");
      const hint = document.getElementById("quizHint");

      if (result) {
        result.textContent =
          "Complete and pass the quiz before opening the completion certificate.";
      }

      if (hint) {
        hint.textContent = `Passing score: ${passingScore}/${Object.keys(submittedAwardsCorrectAnswers).length}.`;
      }
    }, 0);
  }
});

/* =========================================================
   Certificate PDF export
   ========================================================= */

function getSafeFileName(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certificate"
  );
}

async function downloadCertificatePdf() {
  if (!quizPassed) {
    alert("Complete and pass the quiz before downloading the certificate.");
    return;
  }

  updateCertificateName();

  const certificate = document.querySelector("#complete .certificate-card");

  if (!certificate) {
    alert("Certificate could not be found.");
    return;
  }

  if (typeof html2canvas !== "function" || !window.jspdf?.jsPDF) {
    alert("Certificate libraries are still loading. Wait a moment and try again.");
    return;
  }

  const canvas = await html2canvas(certificate, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imageData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  const imageRatio = Math.min(
    availableWidth / canvas.width,
    availableHeight / canvas.height,
  );

  const imageWidth = canvas.width * imageRatio;
  const imageHeight = canvas.height * imageRatio;
  const x = (pageWidth - imageWidth) / 2;
  const y = (pageHeight - imageHeight) / 2;

  pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

  const name = getSafeFileName(getParticipantName() || "student");
  const moduleTitle =
    document.querySelector("#complete h3")?.textContent || "training-module";

  pdf.save(`${name}-${getSafeFileName(moduleTitle)}-certificate.pdf`);
}

/* =========================================================
   Initialize
   ========================================================= */

function initializeSubmittedAwardsModule() {
  renderAwardExplorer("impact");
  updatePromptCoach();
  updatePlannerCharacterCount();
  updatePresentationBudget();
  updateChecklist();
  updateCertificateName();
  setCertificateDownloadEnabled(false);

  document.getElementById("participantName")?.addEventListener("input", updateCertificateName);
  document.getElementById("downloadCertificate")?.addEventListener("click", downloadCertificatePdf);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSubmittedAwardsModule, { once: true });
} else {
  initializeSubmittedAwardsModule();
}
