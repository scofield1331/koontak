import { createScheduleGrid } from "./table";
import "./TasksContainer.css";
const dates = getWeekDates().map((date) => ({
  key: toDateKey(date),
  label: getDayLabel(date),
}));

const timeSlots = [
  { key: "0", start: "00:00:00", end: "09:00:00", label: "Morning" },
  { key: "1", start: "09:01:00", end: "11:00:00", label: "Morning" },
  { key: "2", start: "11:01:00", end: "13:00:00", label: "Midday" },
  { key: "3", start: "13:01:00", end: "15:00:00", label: "Afternoon" },
  { key: "4", start: "15:01:00", end: "17:00:00", label: "Evening" },
  { key: "5", start: "17:01:00", end: "24:00:00", label: "night" },
];

$(document).ready(function () {
  $.ajax({
    method: "GET",
    dataType: "json",
    async: false,
    url: "../Tasks/task-template.php",
    data: {
      action: "load",
    },
  }).done((response) => {
    if (response.success) {
      const grid = createScheduleGrid(dates, timeSlots);
      document.getElementById("TasksContainer")?.append(grid);
      grid.distributeTask(response.tasks);
    } else {
      alert(response.error);
    }
  });
});

function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const dayOfWeek = referenceDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Days to subtract to get back to Monday.
  // Sunday (0) is treated as "6 days after Monday" for this purpose.
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dates: Date[] = [];
  for (let i = 0; i < 6; i++) {
    // Mon..Sat = 6 days
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }

  return dates;
}
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function getDayLabel(date: Date): string {
  const labels = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return labels[date.getDay()] as string;
}
