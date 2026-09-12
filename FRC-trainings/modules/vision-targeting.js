
function topicSafeFileName(text){return text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"certificate";}
function initSimpleChoiceGroups(){document.querySelectorAll("[data-choice-group]").forEach(group=>{const feedback=document.getElementById(group.dataset.feedback);const answer=group.dataset.answer;group.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",()=>{group.querySelectorAll("[data-choice]").forEach(b=>b.classList.remove("correct","incorrect"));const ok=btn.dataset.choice===answer;btn.classList.add(ok?"correct":"incorrect");if(feedback){feedback.className=`topic-feedback ${ok?"correct":"incorrect"}`;feedback.textContent=(ok?"Correct. ":"Not quite. ")+(btn.dataset.explain||group.dataset.explain||"");}}));});}

function initTopicInteractives(){
 const f=document.getElementById('visFovCalc');if(f)f.addEventListener('click',()=>{const fov=+document.getElementById('visFov').value,p=+document.getElementById('visPixels').value,o=+document.getElementById('visOffset').value;const dpp=fov/p;document.getElementById('visFovOut').innerHTML=`<h3>Simple FOV approximation</h3><p>${dpp.toFixed(4)}° per pixel; ${o} px ≈ <strong>${(o*dpp).toFixed(2)}°</strong>.</p>`;});
 const q=document.getElementById('visQuality');if(q)q.addEventListener('click',()=>{const tags=+document.getElementById('visTags').value,r=+document.getElementById('visRange').value,a=+document.getElementById('visAmb').value,s=+document.getElementById('visSpeed').value;let score=100;score-=Math.max(0,r-1.5)*12;score-=a*120;score-=Math.max(0,s-2)*8;if(tags>=2)score+=15;score=Math.max(0,Math.min(100,score));let label=score>75?'strong starting candidate':score>50?'use with moderate trust/filtering':'weak—investigate/reject or heavily down-weight';document.getElementById('visQualityOut').innerHTML=`<h3>Teaching heuristic: ${score.toFixed(0)}/100</h3><p>This looks like a <strong>${label}</strong>. This score is not a WPILib/PhotonVision algorithm; build your real acceptance/noise model from testing.</p>`;});
 const l=document.getElementById('visLatencyCalc');if(l)l.addEventListener('click',()=>{const v=+document.getElementById('visLatSpeed').value,t=+document.getElementById('visLatency').value/1000,w=+document.getElementById('visOmega').value;document.getElementById('visLatencyOut').innerHTML=`<h3>Motion during measurement age</h3><p>Translation: <strong>${(v*t*100).toFixed(1)} cm</strong></p><p>Rotation: <strong>${(w*t).toFixed(1)}°</strong></p>`;});
 const interp=document.getElementById('visInterp');if(interp)interp.addEventListener('click',()=>{const d1=+document.getElementById('visD1').value,r1=+document.getElementById('visR1').value,d2=+document.getElementById('visD2').value,r2=+document.getElementById('visR2').value,d=+document.getElementById('visD').value;const u=(d-d1)/(d2-d1),rpm=r1+u*(r2-r1);document.getElementById('visInterpOut').innerHTML=`<h3>Linear interpolation</h3><p>Estimated setpoint at ${d.toFixed(2)} m: <strong>${rpm.toFixed(0)} RPM</strong></p><p>${u<0||u>1?'Warning: this is extrapolation outside the measured range. ':''}Validate with real shots.</p>`;});
 const checks=[...document.querySelectorAll('#visChecklist input')],bar=document.getElementById('visChecklistBar'),out=document.getElementById('visChecklistOut');checks.forEach(x=>x.addEventListener('change',()=>{const n=checks.filter(y=>y.checked).length;bar.style.width=`${n/checks.length*100}%`;out.textContent=`${n} of ${checks.length} checked.`;}));
}
const VisionTargetingCorrectAnswers = {
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
const VisionTargetingPassingScore=18;let VisionTargetingQuizPassed=false;let VisionTargetingParticipantName="";
function VisionTargetingName(){const i=document.getElementById("participantName");return i?i.value.trim():"";}
function VisionTargetingUpdateName(){VisionTargetingParticipantName=VisionTargetingName();const c=document.getElementById("certificateName");if(c)c.textContent=VisionTargetingParticipantName||"Student Name";}
function VisionTargetingEnableDownload(enabled){const b=document.getElementById("downloadCertificate");if(b)b.disabled=!enabled;}
async function VisionTargetingDownload(){if(!VisionTargetingQuizPassed){alert("Complete and pass the quiz before downloading the certificate.");return;}VisionTargetingUpdateName();const cert=document.querySelector("#complete .certificate-card");if(!cert||!window.html2canvas||!window.jspdf){alert("Certificate/PDF tools could not load.");return;}const canvas=await html2canvas(cert,{scale:2,backgroundColor:"#fff",useCORS:true});const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:"landscape",unit:"pt",format:"letter"});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),m=36;const r=Math.min((pw-2*m)/canvas.width,(ph-2*m)/canvas.height);const w=canvas.width*r,h=canvas.height*r;pdf.addImage(canvas.toDataURL("image/png"),"PNG",(pw-w)/2,(ph-h)/2,w,h);pdf.save(`${topicSafeFileName(VisionTargetingName()||"student")}-vision-targeting-certificate.pdf`);}
function VisionTargetingGrade(){let score=0,unanswered=0;for(const [name,correct] of Object.entries(VisionTargetingCorrectAnswers)){const checked=document.querySelector(`input[name="${name}"]:checked`);if(!checked)unanswered++;else if(checked.value===correct)score++;}const result=document.getElementById("quizResult"),hint=document.getElementById("quizHint"),complete=document.getElementById("complete"),note=document.getElementById("completionNote");VisionTargetingUpdateName();if(!VisionTargetingName()){VisionTargetingQuizPassed=false;complete.classList.add("locked");VisionTargetingEnableDownload(false);result.textContent="Please enter your name before grading the quiz.";return;}if(unanswered){VisionTargetingQuizPassed=false;complete.classList.add("locked");VisionTargetingEnableDownload(false);result.textContent=`You still need to answer ${unanswered} question(s).`;return;}if(score>=18){VisionTargetingQuizPassed=true;complete.classList.remove("locked");VisionTargetingEnableDownload(true);result.textContent=`Passed: ${score}/20. Completion certificate unlocked.`;result.className="result success";hint.textContent="You passed. Continue to the certificate.";note.textContent=`Certificate earned by ${VisionTargetingName()}. Quiz score: ${score}/20.`;}else{VisionTargetingQuizPassed=false;complete.classList.add("locked");VisionTargetingEnableDownload(false);result.textContent=`Not yet: ${score}/20. Review and try again.`;result.className="result";hint.textContent="You need at least 18/20 to unlock the certificate.";note.textContent="Complete after passing the required quiz.";}}
function VisionTargetingReset(){Object.keys(VisionTargetingCorrectAnswers).forEach(n=>document.querySelectorAll(`input[name="${n}"]`).forEach(i=>i.checked=false));VisionTargetingQuizPassed=false;VisionTargetingEnableDownload(false);const c=document.getElementById("complete");if(c)c.classList.add("locked");const r=document.getElementById("quizResult");if(r){r.textContent="Not submitted.";r.className="result";}}
function initializeVisionTargeting(){initSimpleChoiceGroups();if(typeof initTopicInteractives==="function")initTopicInteractives();const n=document.getElementById("participantName"),g=document.getElementById("gradeQuiz"),r=document.getElementById("resetQuiz"),d=document.getElementById("downloadCertificate");if(n)n.addEventListener("input",VisionTargetingUpdateName);if(g)g.addEventListener("click",VisionTargetingGrade);if(r)r.addEventListener("click",VisionTargetingReset);if(d)d.addEventListener("click",VisionTargetingDownload);VisionTargetingEnableDownload(false);VisionTargetingUpdateName();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializeVisionTargeting,{once:true});else initializeVisionTargeting();
