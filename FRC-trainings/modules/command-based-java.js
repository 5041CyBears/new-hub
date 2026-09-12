
function topicSafeFileName(text){return text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"certificate";}
function initSimpleChoiceGroups(){document.querySelectorAll("[data-choice-group]").forEach(group=>{const feedback=document.getElementById(group.dataset.feedback);const answer=group.dataset.answer;group.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",()=>{group.querySelectorAll("[data-choice]").forEach(b=>b.classList.remove("correct","incorrect"));const ok=btn.dataset.choice===answer;btn.classList.add(ok?"correct":"incorrect");if(feedback){feedback.className=`topic-feedback ${ok?"correct":"incorrect"}`;feedback.textContent=(ok?"Correct. ":"Not quite. ")+(btn.dataset.explain||group.dataset.explain||"");}}));});}

function initTopicInteractives(){
 const order=['initialize','execute','finished','end'];let i=0;const out=document.getElementById('cmdLifeOut');document.querySelectorAll('#cmdLifeButtons [data-step]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.step===order[i]){b.classList.add('active');i++;out.textContent=i===order.length?'Correct lifecycle: initialize → repeated execute/check → finish → end(false).':`Correct. Next stage ${i+1} of ${order.length}.`;}else{out.textContent='Not that stage yet. Think about what happens when a command is first scheduled.';}}));const reset=document.getElementById('cmdLifeReset');if(reset)reset.addEventListener('click',()=>{i=0;document.querySelectorAll('#cmdLifeButtons [data-step]').forEach(b=>b.classList.remove('active'));out.textContent='Click the stages in order.';});
 const checks=[...document.querySelectorAll('#cmdChecklist input')],bar=document.getElementById('cmdChecklistBar'),co=document.getElementById('cmdChecklistOut');checks.forEach(x=>x.addEventListener('change',()=>{const n=checks.filter(y=>y.checked).length;bar.style.width=`${n/checks.length*100}%`;co.textContent=`${n} of ${checks.length} checked.`;}));
}
const CommandBasedJavaCorrectAnswers = {
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
const CommandBasedJavaPassingScore=18;let CommandBasedJavaQuizPassed=false;let CommandBasedJavaParticipantName="";
function CommandBasedJavaName(){const i=document.getElementById("participantName");return i?i.value.trim():"";}
function CommandBasedJavaUpdateName(){CommandBasedJavaParticipantName=CommandBasedJavaName();const c=document.getElementById("certificateName");if(c)c.textContent=CommandBasedJavaParticipantName||"Student Name";}
function CommandBasedJavaEnableDownload(enabled){const b=document.getElementById("downloadCertificate");if(b)b.disabled=!enabled;}
async function CommandBasedJavaDownload(){if(!CommandBasedJavaQuizPassed){alert("Complete and pass the quiz before downloading the certificate.");return;}CommandBasedJavaUpdateName();const cert=document.querySelector("#complete .certificate-card");if(!cert||!window.html2canvas||!window.jspdf){alert("Certificate/PDF tools could not load.");return;}const canvas=await html2canvas(cert,{scale:2,backgroundColor:"#fff",useCORS:true});const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:"landscape",unit:"pt",format:"letter"});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),m=36;const r=Math.min((pw-2*m)/canvas.width,(ph-2*m)/canvas.height);const w=canvas.width*r,h=canvas.height*r;pdf.addImage(canvas.toDataURL("image/png"),"PNG",(pw-w)/2,(ph-h)/2,w,h);pdf.save(`${topicSafeFileName(CommandBasedJavaName()||"student")}-command-based-java-certificate.pdf`);}
function CommandBasedJavaGrade(){let score=0,unanswered=0;for(const [name,correct] of Object.entries(CommandBasedJavaCorrectAnswers)){const checked=document.querySelector(`input[name="${name}"]:checked`);if(!checked)unanswered++;else if(checked.value===correct)score++;}const result=document.getElementById("quizResult"),hint=document.getElementById("quizHint"),complete=document.getElementById("complete"),note=document.getElementById("completionNote");CommandBasedJavaUpdateName();if(!CommandBasedJavaName()){CommandBasedJavaQuizPassed=false;complete.classList.add("locked");CommandBasedJavaEnableDownload(false);result.textContent="Please enter your name before grading the quiz.";return;}if(unanswered){CommandBasedJavaQuizPassed=false;complete.classList.add("locked");CommandBasedJavaEnableDownload(false);result.textContent=`You still need to answer ${unanswered} question(s).`;return;}if(score>=18){CommandBasedJavaQuizPassed=true;complete.classList.remove("locked");CommandBasedJavaEnableDownload(true);result.textContent=`Passed: ${score}/20. Completion certificate unlocked.`;result.className="result success";hint.textContent="You passed. Continue to the certificate.";note.textContent=`Certificate earned by ${CommandBasedJavaName()}. Quiz score: ${score}/20.`;}else{CommandBasedJavaQuizPassed=false;complete.classList.add("locked");CommandBasedJavaEnableDownload(false);result.textContent=`Not yet: ${score}/20. Review and try again.`;result.className="result";hint.textContent="You need at least 18/20 to unlock the certificate.";note.textContent="Complete after passing the required quiz.";}}
function CommandBasedJavaReset(){Object.keys(CommandBasedJavaCorrectAnswers).forEach(n=>document.querySelectorAll(`input[name="${n}"]`).forEach(i=>i.checked=false));CommandBasedJavaQuizPassed=false;CommandBasedJavaEnableDownload(false);const c=document.getElementById("complete");if(c)c.classList.add("locked");const r=document.getElementById("quizResult");if(r){r.textContent="Not submitted.";r.className="result";}}
function initializeCommandBasedJava(){initSimpleChoiceGroups();if(typeof initTopicInteractives==="function")initTopicInteractives();const n=document.getElementById("participantName"),g=document.getElementById("gradeQuiz"),r=document.getElementById("resetQuiz"),d=document.getElementById("downloadCertificate");if(n)n.addEventListener("input",CommandBasedJavaUpdateName);if(g)g.addEventListener("click",CommandBasedJavaGrade);if(r)r.addEventListener("click",CommandBasedJavaReset);if(d)d.addEventListener("click",CommandBasedJavaDownload);CommandBasedJavaEnableDownload(false);CommandBasedJavaUpdateName();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializeCommandBasedJava,{once:true});else initializeCommandBasedJava();
