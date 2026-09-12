
function topicSafeFileName(text){return text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"certificate";}
function initSimpleChoiceGroups(){document.querySelectorAll("[data-choice-group]").forEach(group=>{const feedback=document.getElementById(group.dataset.feedback);const answer=group.dataset.answer;group.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",()=>{group.querySelectorAll("[data-choice]").forEach(b=>b.classList.remove("correct","incorrect"));const ok=btn.dataset.choice===answer;btn.classList.add(ok?"correct":"incorrect");if(feedback){feedback.className=`topic-feedback ${ok?"correct":"incorrect"}`;feedback.textContent=(ok?"Correct. ":"Not quite. ")+(btn.dataset.explain||group.dataset.explain||"");}}));});}

function initTopicInteractives(){
 const c=document.getElementById('linCalc');if(c)c.addEventListener('click',()=>{const d=+document.getElementById('linDia').value,rpm=+document.getElementById('linRpm').value,t=+document.getElementById('linTorque').value,eff=+document.getElementById('linEff').value/100;const mDia=d*.0254,r=mDia/2;const speed=Math.PI*mDia*rpm/60,force=t/r*eff;document.getElementById('linOut').innerHTML=`<h3>Idealized drive output</h3><p>Linear speed: <strong>${speed.toFixed(2)} m/s</strong></p><p>Estimated force after ${Math.round(eff*100)}% efficiency: <strong>${force.toFixed(0)} N</strong></p><p>Add margin for acceleration, friction, misalignment, and battery sag.</p>`;});
 const p=document.getElementById('linProfileCalc');if(p)p.addEventListener('click',()=>{const d=+document.getElementById('linDistance').value,v=+document.getElementById('linMaxV').value,a=+document.getElementById('linMaxA').value;const dAccel=v*v/a;let time,type;if(d>=dAccel){time=2*v/a+(d-dAccel)/v;type='trapezoidal';}else{time=2*Math.sqrt(d/a);type='triangular (never reaches max velocity)';}document.getElementById('linProfileOut').innerHTML=`<h3>Ideal profile</h3><p>Type: <strong>${type}</strong></p><p>Minimum ideal time: <strong>${time.toFixed(2)} s</strong></p><p>Real mechanisms may need lower constraints due to current, stability, structure, and game-piece handling.</p>`;});
 const checks=[...document.querySelectorAll('#linChecklist input')],bar=document.getElementById('linChecklistBar'),out=document.getElementById('linChecklistOut');checks.forEach(x=>x.addEventListener('change',()=>{const n=checks.filter(y=>y.checked).length;bar.style.width=`${n/checks.length*100}%`;out.textContent=`${n} of ${checks.length} checked.`;}));
}
const LinearMotionElevatorsCorrectAnswers = {
  "q1": "a",
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
const LinearMotionElevatorsPassingScore=18;let LinearMotionElevatorsQuizPassed=false;let LinearMotionElevatorsParticipantName="";
function LinearMotionElevatorsName(){const i=document.getElementById("participantName");return i?i.value.trim():"";}
function LinearMotionElevatorsUpdateName(){LinearMotionElevatorsParticipantName=LinearMotionElevatorsName();const c=document.getElementById("certificateName");if(c)c.textContent=LinearMotionElevatorsParticipantName||"Student Name";}
function LinearMotionElevatorsEnableDownload(enabled){const b=document.getElementById("downloadCertificate");if(b)b.disabled=!enabled;}
async function LinearMotionElevatorsDownload(){if(!LinearMotionElevatorsQuizPassed){alert("Complete and pass the quiz before downloading the certificate.");return;}LinearMotionElevatorsUpdateName();const cert=document.querySelector("#complete .certificate-card");if(!cert||!window.html2canvas||!window.jspdf){alert("Certificate/PDF tools could not load.");return;}const canvas=await html2canvas(cert,{scale:2,backgroundColor:"#fff",useCORS:true});const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:"landscape",unit:"pt",format:"letter"});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),m=36;const r=Math.min((pw-2*m)/canvas.width,(ph-2*m)/canvas.height);const w=canvas.width*r,h=canvas.height*r;pdf.addImage(canvas.toDataURL("image/png"),"PNG",(pw-w)/2,(ph-h)/2,w,h);pdf.save(`${topicSafeFileName(LinearMotionElevatorsName()||"student")}-linear-motion-elevators-certificate.pdf`);}
function LinearMotionElevatorsGrade(){let score=0,unanswered=0;for(const [name,correct] of Object.entries(LinearMotionElevatorsCorrectAnswers)){const checked=document.querySelector(`input[name="${name}"]:checked`);if(!checked)unanswered++;else if(checked.value===correct)score++;}const result=document.getElementById("quizResult"),hint=document.getElementById("quizHint"),complete=document.getElementById("complete"),note=document.getElementById("completionNote");LinearMotionElevatorsUpdateName();if(!LinearMotionElevatorsName()){LinearMotionElevatorsQuizPassed=false;complete.classList.add("locked");LinearMotionElevatorsEnableDownload(false);result.textContent="Please enter your name before grading the quiz.";return;}if(unanswered){LinearMotionElevatorsQuizPassed=false;complete.classList.add("locked");LinearMotionElevatorsEnableDownload(false);result.textContent=`You still need to answer ${unanswered} question(s).`;return;}if(score>=18){LinearMotionElevatorsQuizPassed=true;complete.classList.remove("locked");LinearMotionElevatorsEnableDownload(true);result.textContent=`Passed: ${score}/20. Completion certificate unlocked.`;result.className="result success";hint.textContent="You passed. Continue to the certificate.";note.textContent=`Certificate earned by ${LinearMotionElevatorsName()}. Quiz score: ${score}/20.`;}else{LinearMotionElevatorsQuizPassed=false;complete.classList.add("locked");LinearMotionElevatorsEnableDownload(false);result.textContent=`Not yet: ${score}/20. Review and try again.`;result.className="result";hint.textContent="You need at least 18/20 to unlock the certificate.";note.textContent="Complete after passing the required quiz.";}}
function LinearMotionElevatorsReset(){Object.keys(LinearMotionElevatorsCorrectAnswers).forEach(n=>document.querySelectorAll(`input[name="${n}"]`).forEach(i=>i.checked=false));LinearMotionElevatorsQuizPassed=false;LinearMotionElevatorsEnableDownload(false);const c=document.getElementById("complete");if(c)c.classList.add("locked");const r=document.getElementById("quizResult");if(r){r.textContent="Not submitted.";r.className="result";}}
function initializeLinearMotionElevators(){initSimpleChoiceGroups();if(typeof initTopicInteractives==="function")initTopicInteractives();const n=document.getElementById("participantName"),g=document.getElementById("gradeQuiz"),r=document.getElementById("resetQuiz"),d=document.getElementById("downloadCertificate");if(n)n.addEventListener("input",LinearMotionElevatorsUpdateName);if(g)g.addEventListener("click",LinearMotionElevatorsGrade);if(r)r.addEventListener("click",LinearMotionElevatorsReset);if(d)d.addEventListener("click",LinearMotionElevatorsDownload);LinearMotionElevatorsEnableDownload(false);LinearMotionElevatorsUpdateName();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializeLinearMotionElevators,{once:true});else initializeLinearMotionElevators();
