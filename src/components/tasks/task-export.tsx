import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { Task, User } from "@/types";
import { formatDate, formatDuration } from "@/lib/utils";

interface TaskExportProps {
  task: Task;
  users: User[];
}

export function TaskExport({ task, users }: TaskExportProps) {
  const exportToCSV = () => {
    // Get assignee name
    const assignee = users.find(u => u.id === task.assigneeId);
    const assigneeName = assignee?.name || "Unassigned";

    // Get creator name
    const creator = users.find(u => u.id === task.createdById);
    const creatorName = creator?.name || "Unknown";

    // Calculate total time from timeTracking
    const totalTime = task.timeTracking?.reduce((total, record) => {
      return total + (record.duration || 0);
    }, 0) || 0;

    // Prepare CSV data
    const csvData = [
      // Task details
      ["Task Details"],
      ["Title", task.title],
      ["Description", task.description || "No description"],
      ["Status", task.status],
      ["Priority", task.priority],
      ["Assignee", assigneeName],
      ["Created By", creatorName],
      ["Created At", formatDate(task.createdAt)],
      ["Updated At", formatDate(task.updatedAt)],
      ["Due Date", task.dueDate ? formatDate(task.dueDate) : "No due date"],
      ["Total Time Spent", formatDuration(totalTime)],
      ["", ""], // Empty row for spacing

      // Time tracking history
      ["Time Tracking History"],
      ["User", "Start Time", "End Time", "Duration"],
      ...(task.timeTracking?.map(record => {
        const user = users.find(u => u.id === record.userId);
        const userName = user?.name || "Unknown User";
        return [
          userName,
          formatDate(record.startTime),
          record.endTime ? formatDate(record.endTime) : "In Progress",
          record.duration ? formatDuration(record.duration) : "0:00"
        ];
      }) || [["No time records"]])
    ];

    // Convert to CSV string
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `task-${task.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    // Get assignee and creator names
    const assignee = users.find(u => u.id === task.assigneeId);
    const creator = users.find(u => u.id === task.createdById);

    // Calculate total time
    const totalTime = task.timeTracking?.reduce((total, record) => {
      return total + (record.duration || 0);
    }, 0) || 0;

    // Prepare JSON data
    const jsonData = {
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: assignee ? {
          id: assignee.id,
          name: assignee.name,
          email: assignee.email
        } : null,
        createdBy: creator ? {
          id: creator.id,
          name: creator.name,
          email: creator.email
        } : null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        dueDate: task.dueDate,
        totalTimeSpent: totalTime,
        totalTimeSpentFormatted: formatDuration(totalTime)
      },
      timeTracking: task.timeTracking?.map(record => {
        const user = users.find(u => u.id === record.userId);
        return {
          id: record.id,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email
          } : null,
          startTime: record.startTime,
          endTime: record.endTime,
          duration: record.duration,
          durationFormatted: record.duration ? formatDuration(record.duration) : "0:00"
        };
      }) || []
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `task-${task.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Export Task Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4" />
            Export as CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={exportToJSON}
          >
            <Download className="h-4 w-4" />
            Export as JSON
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Export includes task details, time tracking history, and user information.
        </p>
      </CardContent>
    </Card>
  );
} 