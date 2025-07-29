import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDuration } from "@/lib/utils";
import { TimeTrackingRecord } from "@/types";
import { useAppStore } from "@/lib/store";
import { Clock } from "lucide-react";

interface TimeTrackingHistoryProps {
  records?: TimeTrackingRecord[];
}

export function TimeTrackingHistory({ records = [] }: TimeTrackingHistoryProps) {
  const { users } = useAppStore();
  
  console.log("TimeTrackingHistory - component rendered with users:", users.map(u => ({ id: u.id, name: u.name })));
  
  if (records.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Tracking History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {records.length === 0 ? (
          <p className="text-muted-foreground text-sm">No time records available.</p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {records.map((record) => {
              const user = users.find(u => u.id === record.userId);
              console.log("TimeTrackingHistory - record.userId:", record.userId);
              console.log("TimeTrackingHistory - available users:", users.map(u => ({ id: u.id, name: u.name })));
              console.log("TimeTrackingHistory - found user:", user);
              return (
                <div key={record.id} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">
                        {user?.name || `Unknown User (${record.userId})`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.startTime)} 
                        {record.endTime && ` - ${formatDate(record.endTime)}`}
                      </p>
                    </div>
                    <div className="text-sm font-mono">
                      {record.duration !== undefined ? formatDuration(record.duration) : "In progress"}
                    </div>
                  </div>
                  {record.description && (
                    <p className="text-sm mt-1 text-muted-foreground">
                      {record.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}