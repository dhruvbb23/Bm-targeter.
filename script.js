const monthEl = document.getElementById("month");
const yearEl = document.getElementById("year");
const tbody = document.getElementById("tbody");
const targetInput = document.getElementById("targetInput");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const modal = document.getElementById("completeModal");
const finalScore = document.getElementById("finalScore");
const sound = document.getElementById("sound");
const graph = document.getElementById("graph");
const ctx = graph.getContext("2d");

const KEY = "BM_TRACKER_ADV";

let data=[];
let counter=0;
let target=50;
let history={};

const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
months.forEach((m,i)=>monthEl.innerHTML+=`<option value="${i}">${m}</option>`);
for(let y=2024;y<=2040;y++) yearEl.innerHTML+=`<option>${y}</option>`;

function generate(){
  const days = new Date(yearEl.value,Number(monthEl.value)+1,0).getDate();
  tbody.innerHTML="";
  data = Array(days).fill().map(()=>({done:false,num:0}));

  for(let d=1; d<=days; d++){
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${d}</td><td>${new Date(yearEl.value,monthEl.value,d).toLocaleDateString("en",{weekday:"short"})}</td><td></td>`;
    tr.onclick=()=>toggle(d-1);
    tbody.appendChild(tr);
  }
  render();
}

function toggle(i){
  if(!data[i].done){
    counter++;
    data[i]={done:true,num:counter};
  }else{
    data[i]={done:false,num:0};
    counter--;
    reNumber();
  }
  save();
  render();
}

function reNumber(){
  let n=1;
  data.forEach(x=>{ if(x.done) x.num=n++; });
}

function render(){
  [...tbody.rows].forEach((r,i)=>{
    r.className = data[i].done ? "completed":"";
    r.cells[2].innerHTML = data[i].done ? "✔ "+data[i].num : "";
  });

  progressFill.style.width=Math.min((counter/target)*100,100)+"%";
  progressText.innerHTML=`${counter} / ${target} Days`;

  if(counter>=target){
    finalScore.innerText = counter;
    modal.style.display="flex";
    sound.play();
    navigator.vibrate?.([300,150,300]);

    const key = `${yearEl.value}-${monthEl.value}`;
    history[key]=counter;
    drawGraph();
  }
}

function drawGraph(){
  ctx.clearRect(0,0,graph.width,graph.height);
  const keys = Object.keys(history);
  if(keys.length===0) return;

  const max = Math.max(...Object.values(history));
  const w = graph.width / keys.length;

  keys.forEach((k,i)=>{
    const h = (history[k]/max)*200;
    ctx.fillStyle="#22c55e";
    ctx.fillRect(i*w+10,210-h,w-20,h);
    ctx.fillStyle="white";
    ctx.fillText(history[k],i*w+15,200-h);
  });
}

function save(){
  localStorage.setItem(KEY,JSON.stringify({
    counter,target,month:monthEl.value,year:yearEl.value,history
  }));
}

function restore(){
  const s = JSON.parse(localStorage.getItem(KEY));
  if(s){
    counter=s.counter;
    target=s.target;
    history=s.history||{};
    monthEl.value=s.month;
    yearEl.value=s.year;
    targetInput.value=target;
  }
  generate();
  drawGraph();
}

function closeModal(){
  modal.style.display="none";
}

document.getElementById("resetAll").onclick=()=>{
  if(confirm("Reset all?")){
    localStorage.removeItem(KEY);
    counter=0;
    history={};
    generate();
    drawGraph();
  }
};

monthEl.onchange=yearEl.onchange=generate;

targetInput.onchange=()=>{
  target=Number(targetInput.value);
  save();
  render();
};

restore();