
function topicSafeFileName(text){return text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"certificate";}
function initSimpleChoiceGroups(){document.querySelectorAll("[data-choice-group]").forEach(group=>{const feedback=document.getElementById(group.dataset.feedback);const answer=group.dataset.answer;group.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",()=>{group.querySelectorAll("[data-choice]").forEach(b=>b.classList.remove("correct","incorrect"));const ok=btn.dataset.choice===answer;btn.classList.add(ok?"correct":"incorrect");if(feedback){feedback.className=`topic-feedback ${ok?"correct":"incorrect"}`;feedback.textContent=(ok?"Correct. ":"Not quite. ")+(btn.dataset.explain||group.dataset.explain||"");}}));});}

function initTopicInteractives(){
  const speedBtn=document.getElementById('flySpeedCalc');if(speedBtn)speedBtn.addEventListener('click',()=>{const d=+document.getElementById('flyDiameter').value,rpm=+document.getElementById('flyRpm').value,e=+document.getElementById('flyEff').value/100;const fps=Math.PI*d*rpm/60/12;document.getElementById('flySpeedOut').innerHTML=`<h3>Estimated speeds</h3><p>Wheel surface speed: <strong>${fps.toFixed(1)} ft/s</strong></p><p>Simple ${Math.round(e*100)}% transfer estimate: <strong>${(fps*e).toFixed(1)} ft/s</strong>. Treat this as a comparison tool, not a final projectile model.</p>`;});
  const compBtn=document.getElementById('flyCompressionCalc');if(compBtn)compBtn.addEventListener('click',()=>{const piece=+document.getElementById('flyPiece').value,gap=+document.getElementById('flyGap').value,v=+document.getElementById('flyVariation').value;const nominal=(piece-gap)/piece*100;const low=((piece-v)-gap)/(piece-v)*100;const high=((piece+v)-gap)/(piece+v)*100;document.getElementById('flyCompressionOut').innerHTML=`<h3>Compression range</h3><p>Nominal: <strong>${nominal.toFixed(1)}%</strong>; small piece: ${low.toFixed(1)}%; large piece: ${high.toFixed(1)}%.</p><p>${low<0?'Warning: the smallest piece may have no compression. ':''}Prototype and measure current, wear, and shot consistency before freezing geometry.</p>`;});
  const energyBtn=document.getElementById('flyEnergyCalc');if(energyBtn)energyBtn.addEventListener('click',()=>{const m=+document.getElementById('flyMass').value,r=+document.getElementById('flyRadius').value,rpm=+document.getElementById('flyEnergyRpm').value;const I=.5*m*r*r,w=rpm*2*Math.PI/60,E=.5*I*w*w;document.getElementById('flyEnergyOut').innerHTML=`<h3>Solid-disk approximation</h3><p>Moment of inertia: <strong>${I.toFixed(5)} kg·m²</strong></p><p>Stored rotational energy: <strong>${E.toFixed(1)} J</strong></p><p>Real assemblies differ; sum all rotating parts and verify safe retention.</p>`;});
  const checks=[...document.querySelectorAll('#flyChecklist input')],bar=document.getElementById('flyChecklistBar'),out=document.getElementById('flyChecklistOut');checks.forEach(c=>c.addEventListener('change',()=>{const n=checks.filter(x=>x.checked).length;bar.style.width=`${n/checks.length*100}%`;out.textContent=`${n} of ${checks.length} checked.${n===checks.length?' Design review complete—now verify it physically.':''}`;}));
}
const FlywheelShootersCorrectAnswers = {
  "q1": "b",
  "q2": "a",
  "q3": "a",
  "q4": "a",
  "q5": "a",
  "q6": "a",
  "q7": "a",
  "q8": "a",
  "q9": "a",
  "q10": "a",
  "q11": "a",
  "q12": "a",
  "q13": "a",
  "q14": "a",
  "q15": "a",
  "q16": "a",
  "q17": "a",
  "q18": "a",
  "q19": "a",
  "q20": "a"
};
const FlywheelShootersPassingScore=18;let FlywheelShootersQuizPassed=false;let FlywheelShootersParticipantName="";
function FlywheelShootersName(){const i=document.getElementById("participantName");return i?i.value.trim():"";}
function FlywheelShootersUpdateName(){FlywheelShootersParticipantName=FlywheelShootersName();const c=document.getElementById("certificateName");if(c)c.textContent=FlywheelShootersParticipantName||"Student Name";}
function FlywheelShootersEnableDownload(enabled){const b=document.getElementById("downloadCertificate");if(b)b.disabled=!enabled;}
async function FlywheelShootersDownload(){if(!FlywheelShootersQuizPassed){alert("Complete and pass the quiz before downloading the certificate.");return;}FlywheelShootersUpdateName();const cert=document.querySelector("#complete .certificate-card");if(!cert||!window.html2canvas||!window.jspdf){alert("Certificate/PDF tools could not load.");return;}const canvas=await html2canvas(cert,{scale:2,backgroundColor:"#fff",useCORS:true});const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:"landscape",unit:"pt",format:"letter"});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),m=36;const r=Math.min((pw-2*m)/canvas.width,(ph-2*m)/canvas.height);const w=canvas.width*r,h=canvas.height*r;pdf.addImage(canvas.toDataURL("image/png"),"PNG",(pw-w)/2,(ph-h)/2,w,h);pdf.save(`${topicSafeFileName(FlywheelShootersName()||"student")}-flywheel-shooters-certificate.pdf`);}
function FlywheelShootersGrade(){let score=0,unanswered=0;for(const [name,correct] of Object.entries(FlywheelShootersCorrectAnswers)){const checked=document.querySelector(`input[name="${name}"]:checked`);if(!checked)unanswered++;else if(checked.value===correct)score++;}const result=document.getElementById("quizResult"),hint=document.getElementById("quizHint"),complete=document.getElementById("complete"),note=document.getElementById("completionNote");FlywheelShootersUpdateName();if(!FlywheelShootersName()){FlywheelShootersQuizPassed=false;complete.classList.add("locked");FlywheelShootersEnableDownload(false);result.textContent="Please enter your name before grading the quiz.";return;}if(unanswered){FlywheelShootersQuizPassed=false;complete.classList.add("locked");FlywheelShootersEnableDownload(false);result.textContent=`You still need to answer ${unanswered} question(s).`;return;}if(score>=18){FlywheelShootersQuizPassed=true;complete.classList.remove("locked");FlywheelShootersEnableDownload(true);result.textContent=`Passed: ${score}/20. Completion certificate unlocked.`;result.className="result success";hint.textContent="You passed. Continue to the certificate.";note.textContent=`Certificate earned by ${FlywheelShootersName()}. Quiz score: ${score}/20.`;}else{FlywheelShootersQuizPassed=false;complete.classList.add("locked");FlywheelShootersEnableDownload(false);result.textContent=`Not yet: ${score}/20. Review and try again.`;result.className="result";hint.textContent="You need at least 18/20 to unlock the certificate.";note.textContent="Complete after passing the required quiz.";}}
function FlywheelShootersReset(){Object.keys(FlywheelShootersCorrectAnswers).forEach(n=>document.querySelectorAll(`input[name="${n}"]`).forEach(i=>i.checked=false));FlywheelShootersQuizPassed=false;FlywheelShootersEnableDownload(false);const c=document.getElementById("complete");if(c)c.classList.add("locked");const r=document.getElementById("quizResult");if(r){r.textContent="Not submitted.";r.className="result";}}
function initializeFlywheelShooters(){initSimpleChoiceGroups();if(typeof initTopicInteractives==="function")initTopicInteractives();const n=document.getElementById("participantName"),g=document.getElementById("gradeQuiz"),r=document.getElementById("resetQuiz"),d=document.getElementById("downloadCertificate");if(n)n.addEventListener("input",FlywheelShootersUpdateName);if(g)g.addEventListener("click",FlywheelShootersGrade);if(r)r.addEventListener("click",FlywheelShootersReset);if(d)d.addEventListener("click",FlywheelShootersDownload);FlywheelShootersEnableDownload(false);FlywheelShootersUpdateName();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializeFlywheelShooters,{once:true});else initializeFlywheelShooters();
