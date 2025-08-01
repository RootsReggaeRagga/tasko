import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Pause, StopCircle, Timer, Edit, Trash2, X, Check } from "lucide-react";
import { Task, TimeTrackingRecord } from "@/types";
import { generateId } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";

interface TaskTimerProps {
  taskId: string;
}

export function TaskTimer({ taskId }: TaskTimerProps) {
  const { tasks, updateTask, currentUser } = useAppStore();
  const task = tasks.find((t) => t.id === taskId);

  // Simple state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [editingSession, setEditingSession] = useState<TimeTrackingRecord | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState("");

  // Initialize from task
  useEffect(() => {
    // Clean up incomplete sessions (without endTime) on component mount
    if (task?.timeTracking && task.timeTracking.length > 0) {
      const incompleteSessions = task.timeTracking.filter(session => !session.endTime);
      if (incompleteSessions.length > 0) {
        console.log('Found incomplete sessions, cleaning up:', incompleteSessions);
        // Remove incomplete sessions
        const cleanTimeTracking = task.timeTracking.filter(session => session.endTime);
        updateTask(taskId, {
          timeTracking: cleanTimeTracking
        });
      }
    }
    
    // Calculate total time from timeTracking history (only completed sessions)
    const totalTimeFromHistory = task?.timeTracking?.reduce((total, record) => {
      // Only count sessions that have endTime (completed sessions)
      if (record.endTime) {
        return total + (record.duration || 0);
      }
      return total;
    }, 0) || 0;
    
    console.log('Timer init - task:', task?.id);
    console.log('Timer init - timeTracking:', task?.timeTracking);
    console.log('Timer init - timeTracking details:', task?.timeTracking?.map(session => ({
      id: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      description: session.description
    })));
    console.log('Timer init - totalTimeFromHistory (minutes):', totalTimeFromHistory);
    console.log('Timer init - setting elapsedSeconds to:', Math.floor(totalTimeFromHistory * 60));
    
    setElapsedSeconds(Math.floor(totalTimeFromHistory * 60)); // Convert minutes to seconds
  }, [task?.timeTracking, taskId, updateTask]);

  // Simple timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const sessionElapsed = Math.floor((now - sessionStartTime) / 1000);
        
        // Calculate total time from timeTracking history (only completed sessions)
        const totalTimeFromHistory = task?.timeTracking?.reduce((total, record) => {
          // Only count sessions that have endTime (completed sessions)
          if (record.endTime) {
            return total + (record.duration || 0);
          }
          return total;
        }, 0) || 0;
        
        const totalElapsed = Math.floor(totalTimeFromHistory * 60) + sessionElapsed;
        setElapsedSeconds(totalElapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, sessionStartTime, task?.timeTracking]);

  const startTimer = useCallback(async () => {
    if (!task || !currentUser) return;

    console.log("Starting timer for task:", taskId);
    console.log("Current task:", task);
    console.log("Current user:", currentUser);
    
    const now = Date.now();
    setIsRunning(true);
    setSessionStartTime(now);

    // Create new session
    const newSession: TimeTrackingRecord = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      startTime: new Date(now).toISOString(),
      duration: 0
    };

    console.log("Created new session:", newSession);
    console.log("Current task.timeTracking:", task.timeTracking);
    console.log("New timeTracking array:", [...(task.timeTracking || []), newSession]);

    // Update task
    try {
      const updateData = {
        timeStarted: new Date(now).toISOString(),
        timeTracking: [...(task.timeTracking || []), newSession]
      };
      console.log("Sending update data:", updateData);
      
      await updateTask(taskId, updateData);
      console.log("Timer started successfully");
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  }, [task, currentUser, taskId, updateTask]);

  const pauseTimer = useCallback(async () => {
    if (!task || !sessionStartTime) return;

    console.log("Pausing timer for task:", taskId);
    console.log("Session start time:", sessionStartTime);
    console.log("Current time:", Date.now());
    
    const now = Date.now();
    const sessionElapsed = (now - sessionStartTime) / (1000 * 60); // Convert to minutes
    
    // Calculate total time from timeTracking history (only completed sessions)
    const totalTimeFromHistory = task.timeTracking?.reduce((total, record) => {
      // Only count sessions that have endTime (completed sessions)
      if (record.endTime) {
        return total + (record.duration || 0);
      }
      return total;
    }, 0) || 0;
    const totalTime = totalTimeFromHistory + sessionElapsed;

    setIsRunning(false);
    setSessionStartTime(null);

    // Find and update the current session
    const currentSession = task.timeTracking?.find(session => 
      !session.endTime && session.startTime === new Date(sessionStartTime).toISOString()
    );

    if (currentSession) {
      const updatedSession: TimeTrackingRecord = {
        ...currentSession,
        endTime: new Date(now).toISOString(),
        duration: sessionElapsed
      };

      // Update task
      await updateTask(taskId, {
        timeStarted: undefined,
        timeSpent: totalTime,
        timeTracking: task.timeTracking?.map(session => 
          session.id === currentSession.id ? updatedSession : session
        ) || [updatedSession]
      });
    } else {
      // Fallback
      await updateTask(taskId, {
        timeStarted: undefined,
        timeSpent: totalTime
      });
    }
  }, [task, sessionStartTime, taskId, updateTask]);

  const stopTimer = useCallback(async () => {
    if (!task || !sessionStartTime) return;

    console.log("Stopping timer for task:", taskId);
    console.log("Session start time:", sessionStartTime);
    console.log("Current time:", Date.now());
    
    const now = Date.now();
    const sessionElapsed = (now - sessionStartTime) / (1000 * 60); // Convert to minutes
    
    // Calculate total time from timeTracking history (only completed sessions)
    const totalTimeFromHistory = task.timeTracking?.reduce((total, record) => {
      // Only count sessions that have endTime (completed sessions)
      if (record.endTime) {
        return total + (record.duration || 0);
      }
      return total;
    }, 0) || 0;
    const totalTime = totalTimeFromHistory + sessionElapsed;

    setIsRunning(false);
    setSessionStartTime(null);
    setElapsedSeconds(0); // Reset display to 00:00

    // Find and update the current session
    const currentSession = task.timeTracking?.find(session => 
      !session.endTime && session.startTime === new Date(sessionStartTime).toISOString()
    );

    if (currentSession) {
      const updatedSession: TimeTrackingRecord = {
        ...currentSession,
        endTime: new Date(now).toISOString(),
        duration: sessionElapsed
      };

      // Update task with session and accumulated timeSpent
      await updateTask(taskId, {
        timeStarted: undefined,
        timeSpent: totalTime, // Keep accumulated time
        timeTracking: task.timeTracking?.map(session => 
          session.id === currentSession.id ? updatedSession : session
        ) || [updatedSession]
      });
    } else {
      // Fallback
      await updateTask(taskId, {
        timeStarted: undefined,
        timeSpent: totalTime // Keep accumulated time
      });
    }
  }, [task, sessionStartTime, taskId, updateTask]);

  // Edit session function
  const editSession = useCallback(async (sessionId: string, description: string, duration: number) => {
    console.log("=== EDIT SESSION DEBUG ===");
    console.log("editSession called with:", { sessionId, description, duration });
    console.log("Current task:", task);
    console.log("Current timeTracking:", task?.timeTracking);
    
    if (!task) {
      console.error("No task found!");
      return;
    }

    const updatedTimeTracking = task.timeTracking?.map(session => {
      if (session.id === sessionId) {
        console.log("Updating session:", session.id, "with description:", description, "duration:", duration);
        return { ...session, description, duration };
      }
      return session;
    }) || [];

    console.log("Updated timeTracking:", updatedTimeTracking);

    // Recalculate total time spent
    const totalTimeSpent = updatedTimeTracking
      .filter(session => session.endTime)
      .reduce((total, session) => total + (session.duration || 0), 0);

    console.log("Recalculated totalTimeSpent:", totalTimeSpent);

    console.log("Calling updateTask with:", {
      timeTracking: updatedTimeTracking,
      timeSpent: Math.round(totalTimeSpent)
    });

    await updateTask(taskId, {
      timeTracking: updatedTimeTracking,
      timeSpent: Math.round(totalTimeSpent)
    });

    console.log("updateTask completed");
    
    // Add a small delay to ensure Supabase has processed the update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEditingSession(null);
    setEditDescription("");
    setEditDuration("");
    console.log("=== END EDIT SESSION DEBUG ===");
  }, [task, taskId, updateTask]);

  // Delete session function
  const deleteSession = useCallback(async (sessionId: string) => {
    console.log("=== DELETE SESSION DEBUG ===");
    console.log("deleteSession called with sessionId:", sessionId);
    console.log("Current task:", task);
    console.log("Current timeTracking:", task?.timeTracking);
    
    if (!task) {
      console.error("No task found!");
      return;
    }

    const updatedTimeTracking = task.timeTracking?.filter(session => session.id !== sessionId) || [];
    console.log("Updated timeTracking after deletion:", updatedTimeTracking);

    // Recalculate total time spent
    const totalTimeSpent = updatedTimeTracking
      .filter(session => session.endTime)
      .reduce((total, session) => total + (session.duration || 0), 0);

    console.log("Recalculated totalTimeSpent:", totalTimeSpent);

    console.log("Calling updateTask with:", {
      timeTracking: updatedTimeTracking,
      timeSpent: Math.round(totalTimeSpent)
    });

    await updateTask(taskId, {
      timeTracking: updatedTimeTracking,
      timeSpent: Math.round(totalTimeSpent)
    });

    console.log("updateTask completed");
    
    // Add a small delay to ensure Supabase has processed the update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("=== END DELETE SESSION DEBUG ===");
  }, [task, taskId, updateTask]);

  // Reset time tracking (for testing)
  const resetTimeTracking = useCallback(async () => {
    console.log('Resetting time tracking for task:', taskId);
    await updateTask(taskId, {
      timeTracking: [],
      timeSpent: 0
    });
  }, [taskId, updateTask]);

  // Open edit dialog
  const openEditDialog = useCallback((session: TimeTrackingRecord) => {
    setEditingSession(session);
    setEditDescription(session.description || "");
    // Format duration to 2 decimal places for better readability
    setEditDuration(session.duration ? session.duration.toFixed(2) : "");
  }, []);

  if (!task) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span className="font-medium">Time Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-mono">
              {formatDuration(elapsedSeconds)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetTimeTracking}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        </div>

                    <div className="flex gap-2 justify-between">
              {!isRunning ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={startTimer}
                >
                  <Play className="h-4 w-4" />
                  Start Timer
                </Button>
              ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={pauseTimer}
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={stopTimer}
              >
                <StopCircle className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>

        {task.timeEstimate && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Estimated: {formatDuration(task.timeEstimate)}</span>
            <span>
              Remaining: {formatDuration(Math.max(0, task.timeEstimate - (elapsedSeconds / 60)))}
            </span>
          </div>
        )}

        {/* Time Tracking History */}
        {task.timeTracking && task.timeTracking.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Session History</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {task.timeTracking
                .filter(session => session.endTime) // Only show completed sessions
                .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()) // Sort by newest first
                .map((session) => (
                  <div key={session.id} className="flex justify-between items-center text-xs bg-muted/50 p-2 rounded group">
                    <div className="flex-1">
                      <div className="font-medium">
                        {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-muted-foreground">
                        Duration: {formatDuration(session.duration || 0)} ({session.duration?.toFixed(2) || '0.00'} min)
                      </div>
                      {session.description && (
                        <div className="text-muted-foreground text-xs mt-1">{session.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => openEditDialog(session)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => deleteSession(session.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Edit Session Dialog */}
        <Dialog open={!!editingSession} onOpenChange={() => setEditingSession(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What did you work on?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingSession(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingSession) {
                      const duration = parseFloat(editDuration) || 0;
                      editSession(editingSession.id, editDescription, duration);
                    }
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}