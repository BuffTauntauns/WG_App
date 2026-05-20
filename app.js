const API = "https://wg-proxy.onrender.com";

let data = null;

async function loadData() {
  const res = await fetch(API + "/data");
  data = await res.json();
  render();
}

function render() {
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

  const historyContainer = document.getElementById("history");
  historyContainer.innerHTML = "";

  data.history
    .slice()
    .reverse()
    .forEach(entry => {
      const weekDiv = document.createElement("div");
      weekDiv.className = "week-card";

      let assignmentsHtml = "";

      entry.assignments.forEach(a => {
        assignmentsHtml += `
          <div class="task">
            <span>${a.person} – ${a.task}</span>
            <span>${a.done ? "✅" : "❌"}</span>
          </div>
        `;
      });

      weekDiv.innerHTML = `
        <div class="week-title">KW ${entry.week}</div>
        ${assignmentsHtml}
      `;

      historyContainer.appendChild(weekDiv);
    });

  const notes = document.getElementById("notes");
  notes.innerHTML = "";

  data.notes.forEach(note => {
    const li = document.createElement("li");
    li.textContent = note;
    notes.appendChild(li);
  });
}

async function saveData() {
  await fetch(API + "/data", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  alert("Gespeichert");
}

loadData();