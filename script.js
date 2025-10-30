// References
const taskDesc = document.getElementById('task-desc');
const taskDate = document.getElementById('task-date');
const taskTime = document.getElementById('task-time');
const taskPriority = document.getElementById('task-priority');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const searchTask = document.getElementById('search-task');
const dashboard = document.getElementById('dashboard');
const quoteBox = document.getElementById('quote-box');
const toggleThemeBtn = document.getElementById('toggle-theme');
const calendar = document.getElementById('calendar');
const statsChart = document.getElementById('statsChart').getContext('2d');

// Tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
tasks = tasks.filter(t => t && t.id && t.description);

// Default date/time
function setDefaultDateTime() {
  const now = new Date();
  taskDate.value = now.toISOString().split('T')[0];
  taskTime.value = now.toTimeString().slice(0,5);
}
setDefaultDateTime();

// Quotes
const quotes = [
  "Believe you can and you're halfway there. 🌟",
  "Small steps every day lead to big results. 🚀",
  "Focus on progress, not perfection. ✨",
  "Your future is created by what you do today. 🌌",
  "Keep going, you are doing amazing. 💫",
  "Mistakes are proof you are trying. 🌙"
];
function showQuote(){
  const quote = quotes[Math.floor(Math.random()*quotes.length)];
  quoteBox.textContent = quote;
}
showQuote();

// Save tasks
function saveTasks(){ localStorage.setItem('tasks', JSON.stringify(tasks)); }

// Render tasks
function renderTasks(filter=''){
  taskList.innerHTML = '';
  tasks.filter(t => (t.description || "").toLowerCase().includes(filter.toLowerCase()))
       .sort((a,b)=>a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
       .forEach(task=>{
    const div = document.createElement('div');
    div.className = `task ${task.priority} ${task.completed?'completed':''}`;
    div.dataset.id = task.id;
    div.draggable = true;
    div.innerHTML = `
      <span>${task.date} ${task.time} - ${task.description}</span>
      <span>
        <button class="complete-btn">✔</button>
        <button class="delete-btn">✖</button>
      </span>`;
    // Drag & Drop
    div.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', task.id); });
    div.querySelector('.complete-btn').addEventListener('click', ()=>toggleComplete(task.id));
    div.querySelector('.delete-btn').addEventListener('click', ()=>deleteTask(task.id));
    taskList.appendChild(div);
  });
  renderCalendar();
  renderDashboard();
  renderChart();
}

// Add task
function addTask(){
  const desc = taskDesc.value.trim();
  const date = taskDate.value;
  const time = taskTime.value;
  const priority = taskPriority.value;

  if(!desc || !date || !time){
    alert("Please enter description, date, and time!");
    return;
  }

  tasks.push({
    id: Date.now(),
    description: desc,
    date: date,
    time: time,
    priority: priority,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskDesc.value='';
  setDefaultDateTime();
}

// Toggle complete
function toggleComplete(id){
  tasks = tasks.map(t => t.id===id ? {...t, completed:!t.completed} : t);
  saveTasks(); renderTasks(searchTask.value);
}

// Delete task
function deleteTask(id){
  if(confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter(t => t.id!==id);
    saveTasks(); renderTasks(searchTask.value);
  }
}

// Search tasks
searchTask.addEventListener('input', ()=>renderTasks(searchTask.value));

// Theme toggle
toggleThemeBtn.addEventListener('click', ()=>document.body.classList.toggle('dark'));

// Dashboard statistics
function renderDashboard(){
  const total = tasks.length;
  const completed = tasks.filter(t=>t.completed).length;
  const days = {};
  tasks.forEach(t=>{
    if(!days[t.date]) days[t.date]=[];
    days[t.date].push(t);
  });
  let avgCompletion = 0;
  const dayCount = Object.keys(days).length || 1;
  Object.values(days).forEach(dayTasks=>{
    const completedInDay = dayTasks.filter(t=>t.completed).length;
    avgCompletion += (completedInDay / dayTasks.length)*100;
  });
  avgCompletion = Math.round(avgCompletion/dayCount);

  dashboard.innerHTML = `
    Total Tasks: ${total} | Completed: ${completed} (${total?Math.round(completed/total*100):0}%)<br>
    Avg Completion per Day: ${avgCompletion}%
  `;
}

// Calendar View
function renderCalendar(){
  calendar.innerHTML = '';
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
  for(let d=start; d<=end; d.setDate(d.getDate()+1)){
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.dataset.date = d.toISOString().split('T')[0];
    dayDiv.textContent = d.getDate();

    dayDiv.addEventListener('dragover', e=> e.preventDefault());
    dayDiv.addEventListener('drop', e=>{
      const taskId = parseInt(e.dataTransfer.getData('text/plain'));
      tasks = tasks.map(t=> t.id===taskId ? {...t, date: dayDiv.dataset.date} : t);
      saveTasks(); renderTasks();
    });

    tasks.filter(t=>t.date===dayDiv.dataset.date).forEach(t=>{
      const tspan = document.createElement('span');
      tspan.className = 'task-item';
      tspan.textContent = `${t.time} ${t.description}`;
      dayDiv.appendChild(tspan);
    });

    calendar.appendChild(dayDiv);
  }
}

// Chart
let chartInstance;
function renderChart(){
  const labels = [...new Set(tasks.map(t=>t.date))].sort();
  const completedCounts = labels.map(d=>tasks.filter(t=>t.date===d && t.completed).length);
  const totalCounts = labels.map(d=>tasks.filter(t=>t.date===d).length);
  if(chartInstance) chartInstance.destroy();
  chartInstance = new Chart(statsChart,{
    type:'bar',
    data:{
      labels: labels,
      datasets:[
        {label:'Completed Tasks', data: completedCounts, backgroundColor:'#4caf50'},
        {label:'Total Tasks', data: totalCounts, backgroundColor:'#ff9800'}
      ]
    },
    options:{responsive:true, plugins:{legend:{position:'top'}}}
  });
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskDesc.addEventListener('keypress', e => { if(e.key==='Enter') addTask(); });

// Initialize
renderTasks();

// Galaxy floating icons
const icons = ['🪐','🌕','🚀','✨','🌟','🌌','🌠'];
for(let i=0;i<10;i++){
  const span = document.createElement('span');
  span.className = 'floating-icon';
  span.style.left = Math.random()*90+'%';
  span.style.top = Math.random()*90+'%';
  span.style.fontSize = (20+Math.random()*30)+'px';
  span.textContent = icons[Math.floor(Math.random()*icons.length)];
  document.body.appendChild(span);
  span.style.animationDuration = (10+Math.random()*20)+'s';
}







