
function topicSafeFileName(text){return text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"certificate";}
function initSimpleChoiceGroups(){document.querySelectorAll("[data-choice-group]").forEach(group=>{const feedback=document.getElementById(group.dataset.feedback);const answer=group.dataset.answer;group.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",()=>{group.querySelectorAll("[data-choice]").forEach(b=>b.classList.remove("correct","incorrect"));const ok=btn.dataset.choice===answer;btn.classList.add(ok?"correct":"incorrect");if(feedback){feedback.className=`topic-feedback ${ok?"correct":"incorrect"}`;feedback.textContent=(ok?"Correct. ":"Not quite. ")+(btn.dataset.explain||group.dataset.explain||"");}}));});}

function initTopicInteractives(){
 const term=document.getElementById('pidTermCalc');if(term)term.addEventListener('click',()=>{const e=+document.getElementById('pidError').value,inte=+document.getElementById('pidIntegral').value,d=+document.getElementById('pidDerivative').value,kp=+document.getElementById('pidKP').value,ki=+document.getElementById('pidKI').value,kd=+document.getElementById('pidKD').value;const p=kp*e,i=ki*inte,dd=kd*d;document.getElementById('pidTermOut').innerHTML=`<h3>PID snapshot</h3><p>P=${p.toFixed(3)}, I=${i.toFixed(3)}, D=${dd.toFixed(3)}, total=${(p+i+dd).toFixed(3)}</p>`;});
 const combine=document.getElementById('pidCombine');if(combine)combine.addEventListener('click',()=>{const ff=+document.getElementById('pidFF').value,c=+document.getElementById('pidCorr').value,l=Math.abs(+document.getElementById('pidLimit').value);const raw=ff+c,clamped=Math.max(-l,Math.min(l,raw));document.getElementById('pidCombineOut').innerHTML=`<h3>Combined command</h3><p>Raw: ${raw.toFixed(2)} V; limited: <strong>${clamped.toFixed(2)} V</strong>${raw!==clamped?' (saturated)':''}</p>`;});
 const angle=document.getElementById('pidAngleCalc');if(angle)angle.addEventListener('click',()=>{const m=+document.getElementById('pidAngleMeas').value,s=+document.getElementById('pidAngleSet').value;const normal=s-m;let wrapped=((normal+180)%360+360)%360-180;document.getElementById('pidAngleOut').innerHTML=`<h3>Angular errors</h3><p>Ordinary subtraction: ${normal.toFixed(1)}°</p><p>Wrapped shortest error: <strong>${wrapped.toFixed(1)}°</strong></p>`;});
 const run=document.getElementById('pidSimRun');if(run)run.addEventListener('click',()=>{const kp=+document.getElementById('simKP').value,ki=+document.getElementById('simKI').value,kd=+document.getElementById('simKD').value,set=+document.getElementById('simSet').value,canvas=document.getElementById('pidCanvas'),ctx=canvas.getContext('2d');let y=0,inte=0,lastE=set,dt=.02;const pts=[];for(let n=0;n<250;n++){const e=set-y;inte+=e*dt;const der=(e-lastE)/dt;let u=kp*e+ki*inte+kd*der;u=Math.max(-5,Math.min(5,u));y+=dt*((u-y)/.25);pts.push(y);lastE=e;}ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#aaa';ctx.lineWidth=1;ctx.beginPath();const sy=canvas.height-(set+1)*canvas.height/3;ctx.moveTo(0,sy);ctx.lineTo(canvas.width,sy);ctx.stroke();ctx.strokeStyle='#980000';ctx.lineWidth=3;ctx.beginPath();pts.forEach((v,i)=>{const x=i/(pts.length-1)*canvas.width;const yy=canvas.height-(v+1)*canvas.height/3;if(i===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);});ctx.stroke();});
 const checks=[...document.querySelectorAll('#pidChecklist input')],bar=document.getElementById('pidChecklistBar'),out=document.getElementById('pidChecklistOut');checks.forEach(x=>x.addEventListener('change',()=>{const n=checks.filter(y=>y.checked).length;bar.style.width=`${n/checks.length*100}%`;out.textContent=`${n} of ${checks.length} checked.`;}));
}
const PidControlCorrectAnswers = {
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
const PidControlPassingScore=18;let PidControlQuizPassed=false;let PidControlParticipantName="";
function PidControlName(){const i=document.getElementById("participantName");return i?i.value.trim():"";}
function PidControlUpdateName(){PidControlParticipantName=PidControlName();const c=document.getElementById("certificateName");if(c)c.textContent=PidControlParticipantName||"Student Name";}
function PidControlEnableDownload(enabled){const b=document.getElementById("downloadCertificate");if(b)b.disabled=!enabled;}
async function PidControlDownload(){if(!PidControlQuizPassed){alert("Complete and pass the quiz before downloading the certificate.");return;}PidControlUpdateName();const cert=document.querySelector("#complete .certificate-card");if(!cert||!window.html2canvas||!window.jspdf){alert("Certificate/PDF tools could not load.");return;}const canvas=await html2canvas(cert,{scale:2,backgroundColor:"#fff",useCORS:true});const {jsPDF}=window.jspdf;const pdf=new jsPDF({orientation:"landscape",unit:"pt",format:"letter"});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),m=36;const r=Math.min((pw-2*m)/canvas.width,(ph-2*m)/canvas.height);const w=canvas.width*r,h=canvas.height*r;pdf.addImage(canvas.toDataURL("image/png"),"PNG",(pw-w)/2,(ph-h)/2,w,h);pdf.save(`${topicSafeFileName(PidControlName()||"student")}-pid-control-certificate.pdf`);}
function PidControlGrade(){let score=0,unanswered=0;for(const [name,correct] of Object.entries(PidControlCorrectAnswers)){const checked=document.querySelector(`input[name="${name}"]:checked`);if(!checked)unanswered++;else if(checked.value===correct)score++;}const result=document.getElementById("quizResult"),hint=document.getElementById("quizHint"),complete=document.getElementById("complete"),note=document.getElementById("completionNote");PidControlUpdateName();if(!PidControlName()){PidControlQuizPassed=false;complete.classList.add("locked");PidControlEnableDownload(false);result.textContent="Please enter your name before grading the quiz.";return;}if(unanswered){PidControlQuizPassed=false;complete.classList.add("locked");PidControlEnableDownload(false);result.textContent=`You still need to answer ${unanswered} question(s).`;return;}if(score>=18){PidControlQuizPassed=true;complete.classList.remove("locked");PidControlEnableDownload(true);result.textContent=`Passed: ${score}/20. Completion certificate unlocked.`;result.className="result success";hint.textContent="You passed. Continue to the certificate.";note.textContent=`Certificate earned by ${PidControlName()}. Quiz score: ${score}/20.`;}else{PidControlQuizPassed=false;complete.classList.add("locked");PidControlEnableDownload(false);result.textContent=`Not yet: ${score}/20. Review and try again.`;result.className="result";hint.textContent="You need at least 18/20 to unlock the certificate.";note.textContent="Complete after passing the required quiz.";}}
function PidControlReset(){Object.keys(PidControlCorrectAnswers).forEach(n=>document.querySelectorAll(`input[name="${n}"]`).forEach(i=>i.checked=false));PidControlQuizPassed=false;PidControlEnableDownload(false);const c=document.getElementById("complete");if(c)c.classList.add("locked");const r=document.getElementById("quizResult");if(r){r.textContent="Not submitted.";r.className="result";}}
function initializePidControl(){initSimpleChoiceGroups();if(typeof initTopicInteractives==="function")initTopicInteractives();const n=document.getElementById("participantName"),g=document.getElementById("gradeQuiz"),r=document.getElementById("resetQuiz"),d=document.getElementById("downloadCertificate");if(n)n.addEventListener("input",PidControlUpdateName);if(g)g.addEventListener("click",PidControlGrade);if(r)r.addEventListener("click",PidControlReset);if(d)d.addEventListener("click",PidControlDownload);PidControlEnableDownload(false);PidControlUpdateName();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializePidControl,{once:true});else initializePidControl();
