/* =========================================================
   5041 FRC Software & Programming Tools Module
   Interactives, quiz grading, and certificate generation.
   ========================================================= */

/* =========================================================
   Interactive 1 — Tool Role Matcher
   ========================================================= */

const fswRoleScenarios = {
  deploy: {
    prompt: "You changed Java robot code and need to build it and send it to Systemcore. Which tool is your starting point?",
    answer: "vscode",
    feedback: "Use WPILib VS Code. The WPILib extension and GradleRIO handle the normal build/deploy workflow from your robot project.",
  },
  enable: {
    prompt: "The robot is connected and code is running. You need to enable Teleoperated mode and verify the controller assignments.",
    answer: "ds",
    feedback: "Use the FIRST Driver Station. Robot mode, enable/disable state, controller assignments, communications, and match operation live here.",
  },
  spark: {
    prompt: "A SPARK Flex needs a firmware update, a new CAN ID, and a quick telemetry check.",
    answer: "rev",
    feedback: "Use REV Hardware Client 2 for current REV ION device discovery, firmware, configuration, backup/restore, and telemetry tasks.",
  },
  talon: {
    prompt: "A Talon FX needs a CAN ID change and firmware verification before code testing.",
    answer: "ctre",
    feedback: "Use Phoenix Tuner X. It is CTRE's device-management application for Phoenix hardware.",
  },
  logs: {
    prompt: "The robot worked in one match and oscillated in the next. You want to compare logged signals, pose, controller input, and Driver Station data over time.",
    answer: "advantage",
    feedback: "AdvantageScope is the strongest starting point for detailed log review, graphs, field visualization, joystick views, and DS/robot log analysis.",
  },
  update: {
    prompt: "You have the correct .llupdate file and need to update the 2027 robot controller OS.",
    answer: "systemcore",
    feedback: "Use the Systemcore web dashboard for the normal 2027 update workflow. The old roboRIO Imaging Tool is not the normal Systemcore imaging method.",
  },
};

let fswCurrentRoleScenario = "deploy";

function initRoleMatcher() {
  const tabs = [...document.querySelectorAll(".fsw-scenario-tab[data-scenario]")];
  const choices = [...document.querySelectorAll(".fsw-choice-button[data-tool]")];
  const prompt = document.getElementById("fswRolePrompt");
  const feedback = document.getElementById("fswRoleFeedback");

  if (!tabs.length || !choices.length || !prompt || !feedback) return;

  function renderScenario() {
    const scenario = fswRoleScenarios[fswCurrentRoleScenario];
    prompt.textContent = scenario.prompt;
    feedback.className = "fsw-feedback";
    feedback.textContent = "Select a tool to see the reasoning.";
    choices.forEach((button) => button.classList.remove("correct", "incorrect", "selected"));
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.scenario === fswCurrentRoleScenario));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      fswCurrentRoleScenario = tab.dataset.scenario;
      renderScenario();
    });
  });

  choices.forEach((button) => {
    button.addEventListener("click", () => {
      const scenario = fswRoleScenarios[fswCurrentRoleScenario];
      const correct = button.dataset.tool === scenario.answer;
      choices.forEach((item) => item.classList.remove("correct", "incorrect", "selected"));
      button.classList.add(correct ? "correct" : "incorrect");
      feedback.className = `fsw-feedback ${correct ? "correct" : "incorrect"}`;
      feedback.textContent = correct
        ? `Correct. ${scenario.feedback}`
        : `Not the best first tool. ${scenario.feedback}`;
    });
  });

  renderScenario();
}

/* =========================================================
   Interactive 2 — VS Code Command Coach
   ========================================================= */

const fswVsCommands = {
  new: {
    command: "WPILib: Create a New Project",
    note: "Choose the language/template, project folder, and team number. Start from the correct 2027 project structure instead of copying an old project folder by hand.",
  },
  build: {
    command: "WPILib: Build Robot Code",
    note: "Build before deployment. Fix the first meaningful compiler/build error before chasing later cascade errors.",
  },
  deploy: {
    command: "WPILib: Deploy Robot Code",
    note: "The robot must be reachable and the team number/network configuration must be correct. A successful compile does not prove the robot is reachable.",
  },
  sim: {
    command: "WPILib: Simulate Robot Code",
    note: "Use WPILib's simulation command rather than the generic VS Code Run button. Vendor-library simulation support varies.",
  },
  vendor: {
    command: "WPILib Dependency Manager / Manage Vendor Libraries",
    note: "Install the vendor dependency into the robot project. Device configuration applications such as RHC2 or Tuner X are separate tools.",
  },
  upgrade: {
    command: "WPILib: Import a WPILib 2026 Project",
    note: "The 2027 control system has significant breaking changes. Use the importer and then review every generated change, dependency, and compile error.",
  },
};

function initVsCodeCoach() {
  const select = document.getElementById("fswVsTask");
  const button = document.getElementById("fswShowVsCommand");
  const output = document.getElementById("fswVsOutput");

  if (!select || !button || !output) return;

  button.addEventListener("click", () => {
    const item = fswVsCommands[select.value];
    output.className = "fsw-output good";
    output.innerHTML = `<h3>${item.command}</h3><p>${item.note}</p>`;
  });
}

/* =========================================================
   Interactive 3 — 2027 Transition Check
   ========================================================= */

const fswTransitionScenarios = [
  {
    prompt: "Update the operating system on a 2027 competition robot controller using a .llupdate file.",
    answer: "systemcore",
    feedback: "Systemcore workflow. Use the Systemcore update/web process described in current WPILib documentation.",
  },
  {
    prompt: "Re-image a 2025 practice robot that still uses a roboRIO 2.0.",
    answer: "legacy",
    feedback: "Legacy roboRIO workflow. The roboRIO Imaging Tool remains relevant to older practice robots.",
  },
  {
    prompt: "Select a 2027 OpMode directly from the new Driver Station.",
    answer: "systemcore",
    feedback: "Systemcore-era workflow. OpMode selection is one of the new 2027 Driver Station/WPILib features.",
  },
  {
    prompt: "Troubleshoot a 2024 robot using the NI Driver Station and roboRIO tools.",
    answer: "legacy",
    feedback: "Legacy workflow. Maintain older tools only where older robot hardware still requires them.",
  },
  {
    prompt: "Open robot.local and inspect/update the new controller through a browser.",
    answer: "systemcore",
    feedback: "Systemcore workflow. The new control system puts more configuration into local web interfaces.",
  },
];

let fswTransitionIndex = 0;

function initTransitionCheck() {
  const prompt = document.getElementById("fswTransitionPrompt");
  const legacy = document.getElementById("fswLegacyChoice");
  const systemcore = document.getElementById("fswSystemcoreChoice");
  const next = document.getElementById("fswNextTransition");
  const feedback = document.getElementById("fswTransitionFeedback");

  if (!prompt || !legacy || !systemcore || !next || !feedback) return;

  function render() {
    const scenario = fswTransitionScenarios[fswTransitionIndex];
    prompt.textContent = scenario.prompt;
    feedback.className = "fsw-feedback";
    feedback.textContent = "Choose which control-system generation owns this task.";
    [legacy, systemcore].forEach((button) => button.classList.remove("correct", "incorrect"));
  }

  function answer(choice, button) {
    const scenario = fswTransitionScenarios[fswTransitionIndex];
    const correct = choice === scenario.answer;
    [legacy, systemcore].forEach((item) => item.classList.remove("correct", "incorrect"));
    button.classList.add(correct ? "correct" : "incorrect");
    feedback.className = `fsw-feedback ${correct ? "correct" : "incorrect"}`;
    feedback.textContent = `${correct ? "Correct." : "Not quite."} ${scenario.feedback}`;
  }

  legacy.addEventListener("click", () => answer("legacy", legacy));
  systemcore.addEventListener("click", () => answer("systemcore", systemcore));
  next.addEventListener("click", () => {
    fswTransitionIndex = (fswTransitionIndex + 1) % fswTransitionScenarios.length;
    render();
  });

  render();
}

/* =========================================================
   Interactive 4 — Driver Station Triage
   ========================================================= */

const fswDsScenarios = {
  comms: {
    prompt: "Driver Station cannot communicate with the robot at all. What should you investigate first?",
    choices: [
      ["network", "Power, Ethernet/Wi-Fi, team number, IP/robot reachability"],
      ["pid", "Retune the drivetrain PID"],
      ["auto", "Rewrite the autonomous routine"],
    ],
    answer: "network",
    feedback: "Start at the communications layer. Confirm power, physical connection, team number/network settings, and whether the robot controller can be reached before changing robot logic.",
  },
  code: {
    prompt: "Driver Station communications are good, but robot code is not shown as running. What should you do first?",
    choices: [
      ["console", "Check deployment/robot console output and whether the program crashed"],
      ["usb", "Move every joystick to a different USB port"],
      ["firmware", "Update all motor firmware immediately"],
    ],
    answer: "console",
    feedback: "Good communications with missing robot code points toward deploy/startup/crash problems. Read the console and verify the program was deployed successfully.",
  },
  controller: {
    prompt: "The robot drives, but the operator controls the wrong mechanism. What should you inspect first?",
    choices: [
      ["joystick", "Driver Station controller assignment/order and USB devices"],
      ["systemcore", "Re-image Systemcore"],
      ["radio", "Change the radio team number"],
    ],
    answer: "joystick",
    feedback: "Controller-order problems are common. Verify which physical controller is assigned to each DS slot before touching mechanism code.",
  },
  random: {
    prompt: "The robot occasionally disables during wireless practice. Which is a sensible early troubleshooting step?",
    choices: [
      ["environment", "Check radio placement, wireless environment, bandwidth, background laptop software, and DS logs"],
      ["rewrite", "Rewrite the entire command framework"],
      ["ignore", "Ignore it because intermittent problems do not happen at events"],
    ],
    answer: "environment",
    feedback: "Intermittent disables can come from wireless conditions, driver-station background software, bandwidth, or network problems. Use logs and controlled tests before blaming robot logic.",
  },
};

let fswCurrentDsScenario = "comms";

function initDsTriage() {
  const tabs = [...document.querySelectorAll("#fswDsTabs .fsw-scenario-tab[data-ds]")];
  const prompt = document.getElementById("fswDsPrompt");
  const choices = document.getElementById("fswDsChoices");
  const feedback = document.getElementById("fswDsFeedback");

  if (!tabs.length || !prompt || !choices || !feedback) return;

  function render() {
    const scenario = fswDsScenarios[fswCurrentDsScenario];
    prompt.textContent = scenario.prompt;
    choices.innerHTML = "";
    feedback.className = "fsw-feedback";
    feedback.textContent = "Choose the best first check.";

    scenario.choices.forEach(([value, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fsw-choice-button";
      button.textContent = label;
      button.dataset.answer = value;
      button.addEventListener("click", () => {
        [...choices.querySelectorAll("button")].forEach((item) => item.classList.remove("correct", "incorrect"));
        const correct = value === scenario.answer;
        button.classList.add(correct ? "correct" : "incorrect");
        feedback.className = `fsw-feedback ${correct ? "correct" : "incorrect"}`;
        feedback.textContent = `${correct ? "Correct." : "Not the best first check."} ${scenario.feedback}`;
      });
      choices.append(button);
    });

    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.ds === fswCurrentDsScenario));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      fswCurrentDsScenario = tab.dataset.ds;
      render();
    });
  });

  render();
}

/* =========================================================
   Interactive 5 — Dashboard Chooser
   ========================================================= */

const fswDashScenarios = [
  {
    prompt: "The drive team needs a clean match display with auto selection and two obvious mechanism-ready indicators.",
    answer: "elastic",
    feedback: "Elastic is designed as a modern competition driver dashboard. Keep the match view simple and action-oriented.",
  },
  {
    prompt: "During a test session, a programmer wants to inspect live NetworkTables values, plot signals, and view robot mechanisms.",
    answer: "glass",
    feedback: "Glass is a strong live programmer/debugging dashboard and integrates well with WPILib simulation and NetworkTables views.",
  },
  {
    prompt: "After a match, the team wants to replay WPILOG/DS logs, compare signals, inspect swerve vectors, and visualize robot pose.",
    answer: "advantage",
    feedback: "AdvantageScope is built for deep diagnostics, log review, visualization, and replay workflows.",
  },
  {
    prompt: "A programmer wants to compare joystick input against mechanism output from a previous match without reconnecting to the robot.",
    answer: "advantage",
    feedback: "AdvantageScope can open Driver Station and robot logs for post-match analysis without requiring a live robot connection.",
  },
];

let fswDashIndex = 0;

function initDashboardChooser() {
  const prompt = document.getElementById("fswDashPrompt");
  const choices = [...document.querySelectorAll(".fsw-choice-button[data-dashboard]")];
  const next = document.getElementById("fswNextDash");
  const feedback = document.getElementById("fswDashFeedback");

  if (!prompt || !choices.length || !next || !feedback) return;

  function render() {
    const scenario = fswDashScenarios[fswDashIndex];
    prompt.textContent = scenario.prompt;
    feedback.className = "fsw-feedback";
    feedback.textContent = "Choose a dashboard.";
    choices.forEach((button) => button.classList.remove("correct", "incorrect"));
  }

  choices.forEach((button) => {
    button.addEventListener("click", () => {
      const scenario = fswDashScenarios[fswDashIndex];
      const correct = button.dataset.dashboard === scenario.answer;
      choices.forEach((item) => item.classList.remove("correct", "incorrect"));
      button.classList.add(correct ? "correct" : "incorrect");
      feedback.className = `fsw-feedback ${correct ? "correct" : "incorrect"}`;
      feedback.textContent = `${correct ? "Correct." : "A different tool fits better."} ${scenario.feedback}`;
    });
  });

  next.addEventListener("click", () => {
    fswDashIndex = (fswDashIndex + 1) % fswDashScenarios.length;
    render();
  });

  render();
}

/* =========================================================
   Interactive 6 — Vendor Tool Router
   ========================================================= */

const fswVendorRoutes = {
  sparkfw: {
    title: "REV Hardware Client 2",
    note: "Use RHC2 to discover the SPARK Flex, update firmware, inspect configuration, and test/monitor supported REV devices.",
  },
  talonid: {
    title: "Phoenix Tuner X",
    note: "Use Tuner X for CTRE device discovery, CAN IDs, firmware, configuration, and device management.",
  },
  revcode: {
    title: "REVLib vendor dependency in the robot project",
    note: "RHC2 configures hardware; REVLib is the code library your Java/C++/Python project uses to control the device.",
  },
  ctrecode: {
    title: "Phoenix 6 vendor dependency in the robot project",
    note: "Tuner X manages hardware; Phoenix 6 is the robot-code API used by the project.",
  },
  radio: {
    title: "VH-109 web configuration page",
    note: "Current WPILib guidance uses the radio web UI (normally radio.local while connected directly) for practice configuration.",
  },
  sysupdate: {
    title: "Systemcore Web Dashboard",
    note: "Use the Systemcore configure/update page with the correct .llupdate file. Follow current WPILib instructions for preseason hardware revisions.",
  },
};

function initVendorRouter() {
  const select = document.getElementById("fswVendorTask");
  const button = document.getElementById("fswRouteVendor");
  const output = document.getElementById("fswVendorOutput");

  if (!select || !button || !output) return;

  button.addEventListener("click", () => {
    const route = fswVendorRoutes[select.value];
    output.className = "fsw-output good";
    output.innerHTML = `<h3>${route.title}</h3><p>${route.note}</p>`;
  });
}

/* =========================================================
   Interactive 7 — Workflow Builder
   ========================================================= */

const fswWorkflowSteps = [
  ["install", "Install current WPILib / Driver Station tools"],
  ["controller", "Update and verify Systemcore"],
  ["vendor", "Update/configure required vendor devices"],
  ["project", "Create/import robot project and dependencies"],
  ["deploy", "Build and deploy known-good code"],
  ["operate", "Connect Driver Station and verify controllers"],
  ["observe", "Verify dashboard/logging and collect test data"],
];

const fswCorrectWorkflow = fswWorkflowSteps.map(([key]) => key);
let fswWorkflowSelection = [];

function initWorkflowBuilder() {
  const choices = document.getElementById("fswWorkflowChoices");
  const sequence = document.getElementById("fswWorkflowSequence");
  const check = document.getElementById("fswCheckWorkflow");
  const reset = document.getElementById("fswResetWorkflow");
  const feedback = document.getElementById("fswWorkflowFeedback");

  if (!choices || !sequence || !check || !reset || !feedback) return;

  function renderChoices() {
    choices.innerHTML = "";

    // Intentionally display a shuffled but deterministic order.
    const displayOrder = [
      fswWorkflowSteps[3],
      fswWorkflowSteps[0],
      fswWorkflowSteps[5],
      fswWorkflowSteps[2],
      fswWorkflowSteps[6],
      fswWorkflowSteps[1],
      fswWorkflowSteps[4],
    ];

    displayOrder.forEach(([key, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fsw-choice-button";
      button.textContent = label;
      button.disabled = fswWorkflowSelection.includes(key);
      button.addEventListener("click", () => {
        if (!fswWorkflowSelection.includes(key)) {
          fswWorkflowSelection.push(key);
          renderChoices();
          renderSequence();
        }
      });
      choices.append(button);
    });
  }

  function renderSequence() {
    if (!fswWorkflowSelection.length) {
      sequence.textContent = "Your sequence will appear here.";
      return;
    }

    sequence.innerHTML = fswWorkflowSelection
      .map((key, index) => {
        const label = fswWorkflowSteps.find(([stepKey]) => stepKey === key)[1];
        return `<span class="fsw-workflow-chip">${index + 1}. ${label}</span>`;
      })
      .join(" ");
  }

  check.addEventListener("click", () => {
    if (fswWorkflowSelection.length !== fswCorrectWorkflow.length) {
      feedback.className = "fsw-feedback incorrect";
      feedback.textContent = `Choose all ${fswCorrectWorkflow.length} steps before checking the sequence.`;
      return;
    }

    const exact = fswWorkflowSelection.every((value, index) => value === fswCorrectWorkflow[index]);
    feedback.className = `fsw-feedback ${exact ? "correct" : "incorrect"}`;
    feedback.textContent = exact
      ? "Strong workflow. Prepare the software environment and controller first, configure hardware, build a season-correct project, deploy, operate through the Driver Station, then use dashboard/log data to validate the system."
      : "The order is not the recommended training sequence. Think from infrastructure → controller/hardware → project/deploy → operation → observation. Reset and try again.";
  });

  reset.addEventListener("click", () => {
    fswWorkflowSelection = [];
    feedback.className = "fsw-feedback";
    feedback.textContent = "";
    renderChoices();
    renderSequence();
  });

  renderChoices();
  renderSequence();
}

/* =========================================================
   Competition Kit Checklist
   ========================================================= */

function initKitChecklist() {
  const checks = [...document.querySelectorAll(".fsw-kit-check")];
  const status = document.getElementById("fswKitStatus");

  if (!checks.length || !status) return;

  function update() {
    const completed = checks.filter((checkbox) => checkbox.checked).length;
    status.textContent = `${completed} of ${checks.length} preparation items checked.`;
    status.style.borderLeftColor = completed === checks.length ? "#2e7d32" : "#777";
  }

  checks.forEach((checkbox) => checkbox.addEventListener("change", update));
  update();
}

/* =========================================================
   Quiz and Certificate
   ========================================================= */

const fswCorrectAnswers = {
  q1: "a",
  q2: "a",
  q3: "a",
  q4: "a",
  q5: "a",
  q6: "a",
  q7: "a",
  q8: "a",
  q9: "a",
  q10: "a",
  q11: "a",
  q12: "a",
  q13: "a",
  q14: "a",
  q15: "a",
  q16: "a",
  q17: "a",
  q18: "a",
  q19: "a",
  q20: "a",
};

const fswPassingScore = 18;
let fswQuizPassed = false;
let fswParticipantName = "";

function getFswParticipantName() {
  const input = document.getElementById("participantName");
  return input ? input.value.trim() : "";
}

function updateFswCertificateName() {
  fswParticipantName = getFswParticipantName();
  const certificateName = document.getElementById("certificateName");

  if (certificateName) {
    certificateName.textContent = fswParticipantName || "Student Name";
  }
}

function getFswSafeFileName(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certificate"
  );
}

function setFswCertificateDownloadEnabled(enabled) {
  const button = document.getElementById("downloadCertificate");
  if (button) button.disabled = !enabled;
}

async function downloadFswCertificatePdf() {
  if (!fswQuizPassed) {
    alert("Complete and pass the quiz before downloading the certificate.");
    return;
  }

  updateFswCertificateName();
  const certificate = document.querySelector("#complete .certificate-card");

  if (!certificate) {
    alert("Certificate could not be found.");
    return;
  }

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
  const name = getFswSafeFileName(getFswParticipantName() || "student");
  pdf.save(`${name}-frc-software-programming-tools-certificate.pdf`);
}

function gradeFswQuiz() {
  let score = 0;
  let unanswered = 0;

  for (const [name, correct] of Object.entries(fswCorrectAnswers)) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) unanswered += 1;
    else if (checked.value === correct) score += 1;
  }

  const totalQuestions = Object.keys(fswCorrectAnswers).length;
  const result = document.getElementById("quizResult");
  const hint = document.getElementById("quizHint");
  const complete = document.getElementById("complete");
  const note = document.getElementById("completionNote");

  if (!result || !hint || !complete || !note) return;

  updateFswCertificateName();
  fswParticipantName = getFswParticipantName();

  if (!fswParticipantName) {
    fswQuizPassed = false;
    complete.classList.add("locked");
    setFswCertificateDownloadEnabled(false);
    result.textContent = "Please enter your name before grading the quiz.";
    result.className = "result";
    hint.textContent = "Go back to the name entry section, enter your name, then grade again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  if (unanswered > 0) {
    fswQuizPassed = false;
    complete.classList.add("locked");
    setFswCertificateDownloadEnabled(false);
    result.textContent = `You still need to answer ${unanswered} question(s).`;
    result.className = "result";
    hint.textContent = "Answer every question, then grade the quiz again.";
    note.textContent = "Complete after passing the required quiz.";
    return;
  }

  if (score >= fswPassingScore) {
    fswQuizPassed = true;
    complete.classList.remove("locked");
    setFswCertificateDownloadEnabled(true);
    result.textContent = `Passed: ${score}/${totalQuestions}. Completion certificate unlocked.`;
    result.className = "result success";
    hint.textContent = "You passed. Advance to the completion certificate.";
    note.textContent = `Certificate earned by ${fswParticipantName}. Quiz score: ${score}/${totalQuestions}.`;
  } else {
    fswQuizPassed = false;
    complete.classList.add("locked");
    setFswCertificateDownloadEnabled(false);
    result.textContent = `Not yet: ${score}/${totalQuestions}. Review and try again.`;
    result.className = "result";
    hint.textContent = `You need at least ${fswPassingScore}/${totalQuestions} to unlock the completion certificate.`;
    note.textContent = "Complete after passing the required quiz.";
  }
}

function resetFswQuiz() {
  Object.keys(fswCorrectAnswers).forEach((questionName) => {
    document.querySelectorAll(`input[name="${questionName}"]`).forEach((input) => {
      input.checked = false;
    });
  });

  fswQuizPassed = false;
  setFswCertificateDownloadEnabled(false);

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

/* =========================================================
   Initialize
   ========================================================= */

function initializeFswModule() {
  initRoleMatcher();
  initVsCodeCoach();
  initTransitionCheck();
  initDsTriage();
  initDashboardChooser();
  initVendorRouter();
  initWorkflowBuilder();
  initKitChecklist();

  const participantInput = document.getElementById("participantName");
  const gradeButton = document.getElementById("gradeQuiz");
  const resetButton = document.getElementById("resetQuiz");
  const downloadButton = document.getElementById("downloadCertificate");

  if (participantInput) participantInput.addEventListener("input", updateFswCertificateName);
  if (gradeButton) gradeButton.addEventListener("click", gradeFswQuiz);
  if (resetButton) resetButton.addEventListener("click", resetFswQuiz);
  if (downloadButton) downloadButton.addEventListener("click", downloadFswCertificatePdf);

  setFswCertificateDownloadEnabled(false);
  updateFswCertificateName();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFswModule, { once: true });
} else {
  initializeFswModule();
}
