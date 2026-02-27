import { Task } from "@/lib/store";

/**
 * Generate iCalendar format for completed tasks
 */
export function generateICalendar(tasks: Task[]): string {
  const completedTasks = tasks.filter((t) => t.endTime && t.actualMinutes > 0);

  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TimeKind//Task Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:TimeKind Tasks
X-WR-TIMEZONE:UTC
BEGIN:VTIMEZONE
TZID:UTC
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:+0000
TZOFFSETTO:+0000
TZNAME:UTC
END:STANDARD
END:VTIMEZONE
`;

  completedTasks.forEach((task) => {
    if (!task.endTime) return;

    const startTime = new Date(task.startTime);
    const endTime = new Date(task.endTime);

    const formatDateTime = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };

    const uid = `${task.id}@timekind`;
    const dtstart = formatDateTime(startTime);
    const dtend = formatDateTime(endTime);
    const dtstamp = formatDateTime(new Date());

    const description = `Energy: ${task.energyLevel}
Estimated: ${task.estimatedMinutes}m
Actual: ${task.actualMinutes}m
Accuracy: ${task.accuracyPercent}%${
      task.reflection ? `\nReflection: ${task.reflection}` : ""
    }`;

    ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeICalText(task.taskName)}
DESCRIPTION:${escapeICalText(description)}
CATEGORIES:${task.category || "Uncategorized"}
STATUS:COMPLETED
END:VEVENT
`;
  });

  ical += `END:VCALENDAR`;
  return ical;
}

/**
 * Escape special characters in iCalendar text
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/**
 * Generate CSV export for tasks
 */
export function generateCSV(tasks: Task[]): string {
  const headers = [
    "Task Name",
    "Category",
    "Energy Level",
    "Estimated (min)",
    "Actual (min)",
    "Accuracy (%)",
    "Start Time",
    "End Time",
    "Time of Day",
    "Reflection",
  ];

  const rows = tasks
    .filter((t) => t.endTime)
    .map((t) => [
      `"${(t.taskName || "").replace(/"/g, '""')}"`,
      `"${(t.category || "").replace(/"/g, '""')}"`,
      t.energyLevel,
      t.estimatedMinutes,
      t.actualMinutes,
      t.accuracyPercent,
      new Date(t.startTime).toISOString(),
      new Date(t.endTime || "").toISOString(),
      t.timeOfDayTag || "",
      `"${(t.reflection || "").replace(/"/g, '""')}"`,
    ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generate JSON export for tasks
 */
export function generateJSON(tasks: Task[]): string {
  const completedTasks = tasks.filter((t) => t.endTime);
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      taskCount: completedTasks.length,
      tasks: completedTasks,
    },
    null,
    2
  );
}

/**
 * Create downloadable file content
 */
export async function createExportFile(
  tasks: Task[],
  format: "ical" | "csv" | "json"
): Promise<{ content: string; filename: string; mimeType: string }> {
  let content: string;
  let filename: string;
  let mimeType: string;

  const timestamp = new Date().toISOString().split("T")[0];

  switch (format) {
    case "ical":
      content = generateICalendar(tasks);
      filename = `timekind-tasks-${timestamp}.ics`;
      mimeType = "text/calendar";
      break;
    case "csv":
      content = generateCSV(tasks);
      filename = `timekind-tasks-${timestamp}.csv`;
      mimeType = "text/csv";
      break;
    case "json":
      content = generateJSON(tasks);
      filename = `timekind-tasks-${timestamp}.json`;
      mimeType = "application/json";
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return { content, filename, mimeType };
}
