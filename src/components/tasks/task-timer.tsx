import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, StopCircle, Timer } from "lucide-react";
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

  // Initialize from task
  useEffect(() => {
    if (task?.timeSpent) {
      setElapsedSeconds(Math.floor(task.timeSpent * 60)); // Convert minutes to seconds
    }
  }, [task?.timeSpent]);

  // Simple timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const sessionElapsed = Math.floor((now - sessionStartTime) / 1000);
        const totalElapsed = Math.floor((task?.timeSpent || 0) * 60) + sessionElapsed;
        setElapsedSeconds(totalElapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, sessionStartTime, task?.timeSpent]);

  const startTimer = useCallback(async () => {
    if (!task || !currentUser) return;

    console.log("Starting timer for task:", taskId);
    
    const now = Date.now();
    setIsRunning(true);
    setSessionStartTime(now);

    // Create new session
    const newSession: TimeTrackingRecord = {
      id: generateId(),
      userId: currentUser.id,
      startTime: new Date(now).toISOString(),
      duration: 0
    };

    // Update task
    await updateTask(taskId, {
      timeStarted: new Date(now).toISOString(),
      timeTracking: [...(task.timeTracking || []), newSession]
    });
  }, [task, currentUser, taskId, updateTask]);

  const pauseTimer = useCallback(async () => {
    if (!task || !sessionStartTime) return;

    console.log("Pausing timer for task:", taskId);
    
    const now = Date.now();
    const sessionElapsed = (now - sessionStartTime) / (1000 * 60); // Convert to minutes
    const totalTime = (task.timeSpent || 0) + sessionElapsed;

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
    
    const now = Date.now();
    const sessionElapsed = (now - sessionStartTime) / (1000 * 60); // Convert to minutes
    const totalTime = (task.timeSpent || 0) + sessionElapsed;

    setIsRunning(false);
    setSessionStartTime(null);
    setElapsedSeconds(0); // Reset display

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

      // Update task with session and reset timeSpent
      await updateTask(taskId, {
        timeStarted: undefined,
        timeSpent: 0, // Reset timeSpent
        timeTracking: task.timeTracking?.map(session => 
          session.id === currentSession.id ? updatedSession : session
        ) || [updatedSession]
      });
    } else {
      // Fallback
      await updateTask(taskId, {
        timeStarted: undefined,
        timeSpent: 0 // Reset timeSpent
      });
    }
  }, [task, sessionStartTime, taskId, updateTask]);

  // Reset timer function removed - Stop now resets timer and saves to history

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
          <div className="text-xl font-mono">
            {formatDuration(elapsedSeconds / 60)} {/* Convert seconds back to minutes for formatDuration */}
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
      </div>
    </Card>
  );
}