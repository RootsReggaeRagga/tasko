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
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentSession, setCurrentSession] = useState<TimeTrackingRecord | null>(null);
  
  // Initialize timer state from task
  useEffect(() => {
    if (!task) return;
    
    if (task.timeStarted) {
      // Resume active timer
      setElapsedTime(task.timeSpent || 0);
      setIsRunning(true);
      
      const userId = currentUser?.id || "demo-user";
      setCurrentSession({
        id: generateId(),
        userId: userId,
        startTime: task.timeStarted,
        duration: 0
      });
    } else if (task.timeSpent) {
      // Load previous time spent
      setElapsedTime(task.timeSpent);
    }
  }, [task, currentUser]);
  
  // Timer tick function
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    
    if (isRunning && task && currentSession) {
      const startTime = new Date(currentSession.startTime).getTime();
      const baseTime = task.timeSpent || 0;
      
      const timerFunction = () => {
        const now = Date.now();
        const elapsedMs = now - startTime;
        const elapsedMinutes = elapsedMs / (1000 * 60);
        const totalTime = baseTime + elapsedMinutes;
        
        setElapsedTime(totalTime);
        
        // Update task every 10 seconds
        if (Math.floor(elapsedMs / 1000) % 10 === 0) {
          updateTask(task.id, {
            timeSpent: totalTime
          });
        }
      };
      
      // Start interval
      intervalId = setInterval(timerFunction, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, task?.id, currentSession?.id, updateTask]);
  
  // Start timer
  const startTimer = useCallback(() => {
    if (!task) return;
    
    const now = new Date().toISOString();
    const userId = currentUser?.id || "demo-user";
    
    const newSession: TimeTrackingRecord = {
      id: generateId(),
      userId: userId,
      startTime: now,
      duration: 0
    };
    
    setCurrentSession(newSession);
    setIsRunning(true);
    
    updateTask(task.id, {
      timeStarted: now,
      timeTracking: [...(task.timeTracking || []), newSession]
    });
    
  }, [task, currentUser, updateTask]);
  
  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!task || !currentSession) return;
    
    const now = new Date().toISOString();
    const startTime = new Date(currentSession.startTime).getTime();
    const duration = Math.floor((Date.now() - startTime) / 60000);
    
    const updatedSession: TimeTrackingRecord = {
      ...currentSession,
      endTime: now,
      duration
    };
    
    setIsRunning(false);
    setCurrentSession(null);
    
    const totalTimeSpent = (task.timeSpent || 0) + duration;
    
    updateTask(task.id, {
      timeStarted: undefined,
      timeSpent: totalTimeSpent,
      timeTracking: task.timeTracking?.map(record => 
        record.id === currentSession.id ? updatedSession : record
      ) || [updatedSession]
    });
  }, [task, currentSession, updateTask]);
  
  // Stop timer and complete
  const stopTimer = useCallback(() => {
    if (!task) return;
    
    pauseTimer();
    
    // You could add additional logic here for completing the task
    // For example, asking for a summary of work done
  }, [task, pauseTimer]);

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
            {formatDuration(elapsedTime || 0)}
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
              Remaining: {formatDuration(Math.max(0, task.timeEstimate - Math.floor(elapsedTime)))}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}