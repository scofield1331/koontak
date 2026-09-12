export type Task = {
  name: string;
  id: string;
  folder: string;
  retailer: string;
  title: string;
  date: string;
  lastUpdate: string;
  status: string;
  staff: string;
};
export interface TaskElement extends HTMLDivElement {
  getTask: () => Task;
  update: () => void;
}
export function createTaskCard(task: Task) {
  var el = document.createElement("div") as TaskElement;
  el.className = `task-card ${task.status}`;
  //task-card Process AddToStock AddToShip AddToShop Ordered StandBy
  const dateEl = createDateElement(task);
  el.innerHTML += (/* HTML */ `
    <template id="date"></template>
    <div class="task-title">${task.folder}</div>
    <div class="task-title">${task.retailer}</div>
    <div class="task-title">${task.title}</div>
    <div class="task-title">${task.staff}</div>`);
  el.querySelector('#date')?.replaceWith(dateEl);
  el.getTask = () => task;
  el.update = () => { dateEl.innerHTML = task.lastUpdate};
  return el;
}

function createDateElement({ lastUpdate }: { lastUpdate: string }) {
  const e = document.createElement("div");
  e.className = "task-title";
  e.innerHTML = lastUpdate;
  return e;
}
