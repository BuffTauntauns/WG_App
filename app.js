const API = "https://wg-proxy.onrender.com";

let data = null;

function getCurrentWeekNumber() {
  const now = new Date();

  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));

  return Math.ceil((days + start.getDay() + 1) / 7);
}

function getWeekDateRange() {
  const now = new Date();

  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = d =>
    `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")}.${d.getFullYear()}`;

  return `${format(monday)} - ${format(sunday)}`;
}

function rotateAssignmentsForWeek(weekNumber) {
  const tasks = ["Bad", "Saugen", "Küche"];
  const people = ["Jonathan", "Jakob", "Leon"];

  const offset = (weekNumber - 21) % people.length;

  return tasks.map((task, index) => ({
    person: people[(index + offset) % people.length],
    task,
    done: false,
  }));
}

async function ensureCorrectWeek() {
  const currentWeek = getCurrentWeekNumber();

  if (data.currentWeek.week !== currentWeek) {
    data.history.push(JSON.parse(JSON.stringify(data.currentWeek)));

    data.currentWeek = {
      week: currentWeek,
      assignments: rotateAssignmentsForWeek(currentWeek),
    };

    await saveData();
  }
}

async function loadData() {
  const res = await fetch(API + "/data");
  data = await res.json();

  await ensureCorrectWeek();

  render();
}

function render() {
  const currentWeekTitle = document.getElementById("currentWeekTitle");

  currentWeekTitle.textContent =
    `KW ${data.currentWeek.week} • ${getWeekDateRange()}`;

  const tasksContainer = document.getElementById("tasks");
  tasksContainer.innerHTML = "";

  data.currentWeek.assignments.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "task";

    div.innerHTML = `
      <div class="task-left">
        <span class="person">${item.person}</span>
        <span class="assignment">${item.task}</span>
      </div>

      <input type="checkbox" ${item.done ? "checked" : ""}>
    `;

    const checkbox = div.querySelector("input");

    checkbox.addEventListener("change", async () => {
      data.currentWeek.assignments[index].done = checkbox.checked;

      await saveData();
    });

    tasksContainer.appendChild(div);
  });

  const notes = document.getElementById("notes");
  notes.innerHTML = "";

  data.notes.forEach(note => {
    const li = document.createElement("li");
    li.textContent = note;
    notes.appendChild(li);
  });

  renderHistoryTable();
}

function renderHistoryTable() {
  const history = [...data.history, data.currentWeek];

  const historyContainer = document.getElementById("history");

  let html = `
    <table class="history-table">
      <thead>
        <tr>
          <th>KW</th>
          <th>Jakob</th>
          <th>Leon</th>
          <th>Jonathan</th>
        </tr>
      </thead>
      <tbody>
  `;

  history
    .slice()
    .reverse()
    .forEach(week => {
      html += `<tr>`;

      html += `<td>KW ${week.week}</td>`;

      ["Jakob", "Leon", "Jonathan"].forEach(person => {
        const assignment = week.assignments.find(
          a => a.person === person
        );

        html += `
          <td>
            ${assignment?.done ? "✅" : "❌"}
          </td>
        `;
      });

      html += `</tr>`;
    });

  html += `
      </tbody>
    </table>
  `;

  historyContainer.innerHTML = html;
}

async function saveData() {
  await fetch(API + "/data", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

loadData();