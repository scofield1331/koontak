import Sortable, { SortableEvent } from "sortablejs";
import { createTaskCard, Task, TaskElement } from "./task";
type Column = {
  key: string;
  label: string;
};
type Row = {
  key: string;
  start: string;
  end: string;
  label: string;
};
interface GridElement extends HTMLTableElement {
  getRow: (rowId: string) => RowElement | undefined;
  distributeTask: (task: Task[]) => void;
}
interface RowElement extends HTMLTableRowElement {
  getCell: (cellId: string) => HTMLTableCellElement | undefined;
}
interface CellElement extends HTMLTableCellElement {
  getRowId: () => string;
  getColId: () => string;
}
type HandleTaskMove = (cell: CellElement, taskEl: TaskElement) => void;
type GridState = {
  rows: Record<string, RowElement>;
};
type RowState = {
  cells: Record<string, HTMLTableCellElement>;
};
export function createScheduleGrid(columns: Column[], rows: Row[]) {
  const state: GridState = {
    rows: {},
  };
  const table = document.createElement("table") as GridElement;
  table.className = "schedule";
  table.innerHTML = /* HTML */ `
    <thead>
      <tr>
        <th class="time-col">Time</th>
        ${columns
          .map(
            (column) =>
              /* HTML */ `<th>
                <span class="day-name">${column.label}</span
                ><span class="day-date">${column.key}</span>
              </th>`,
          )
          .join("")}
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const handleTaskMove: HandleTaskMove = async (
    cell: CellElement,
    taskEl: TaskElement,
  ) => {
    const task = taskEl.getTask();
    const rowid = cell.getRowId();
    const date = cell.getColId();
    const row = findRow(rowid, rows);
    if (!row) return;
    const time = row?.start;
    const response = await updateTaskDate(task, date, time);
    if (response.success) {
      task.lastUpdate = `${date} ${time}`;
      taskEl.update();
    }
  };
  rows.forEach((row) => {
    const rowElement = createRow(row, columns, handleTaskMove);
    state.rows[row.key] = rowElement;
    table.querySelector("tbody")?.append(rowElement);
  });

  table.getRow = (rowid: string) => state.rows[rowid];
  table.distributeTask = (tasks: Task[]) => distributeTask(table, tasks, rows);
  return table;
}

function createRow(
  row: Row,
  columns: Column[],
  handleTaskMove: HandleTaskMove,
) {
  const state: RowState = {
    cells: {},
  };
  const tr = document.createElement("tr") as RowElement;
  tr.innerHTML = /* HTML */ ` <td class="time-col">
    ${row.start} - ${row.end}
  </td>`;
  columns.forEach((column) => {
    const cellElement = createCell(row, column, handleTaskMove);
    state.cells[column.key] = cellElement;
    tr.append(cellElement);
  });
  tr.getCell = (cellId: string) => state.cells[cellId];
  return tr;
}

function createCell(row: Row, column: Column, handleTaskMove: HandleTaskMove) {
  const state = {
    row: row,
    column: column,
  };
  const td = document.createElement("td") as CellElement;
  td.className = "day-cell";
  Sortable.create(td, {
    group: "schedule", // shared group name lets cards move between any cell
    animation: 150,
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    onAdd: function (evt: SortableEvent) {
      const cell = evt.target as CellElement;
      const taskCard = evt.item as TaskElement;
      handleTaskMove(cell, taskCard);
    },
  });
  td.getRowId = () => row.key;
  td.getColId = () => column.key;
  return td;
}
function distributeTask(element: GridElement, tasks: Task[], rows: Row[]) {
  tasks.forEach((task) => {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!regex.test(task.lastUpdate)) {
      return;
    }
    const [date, time] = task.lastUpdate.split(" ");
    const rowid = findRowId(time as string, rows);
    if (!rowid) return;
    const row = element.getRow(rowid);
    if (!row) return;
    const cell = row.getCell(date as string);
    if (cell) {
      cell.append(createTaskCard(task));
    }
  });
}
function isTimeBetween(time: string, start: string, end: string): boolean {
  return time >= start && time <= end;
}
function findRowId(time: string, rows: Row[]): string | undefined {
  const row = rows.find((row) => isTimeBetween(time, row.start, row.end));
  return row?.key;
}
function findRow(key: string, rows: Row[]): Row | undefined {
  const row = rows.find((row) => row.key == key);
  return row;
}
async function updateTaskDate(task: Task, date: string, time: string) {
  const lastUpdate = task.lastUpdate;
  task.lastUpdate = `${date} ${time}`;
  const response = await fetch(
    "../Tasks/task-template.php?action=updateTaskDate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folder: task.folder,
        customerId: task.id,
        date: task.date,
        lastUpdate: `${date} ${time}`,
      }),
    },
  );
  const json = response.json();
  json.then((rs) => {
    if (!rs.success) {
      alert(rs.error);
    }
  });
  return json;
}
