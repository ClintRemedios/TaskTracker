import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import {
  cleanCompleted,
  createTask,
  deleteTask,
  listTasks,
  reorderTasks,
  updateTaskStatus,
} from "../api/tasks";
import { TaskStatus, type Task } from "../types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await listTasks();
    setTasks(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    listTasks()
      .then((next) => {
        if (!cancelled) {
          setTasks(next);
          setError(null);
        }
      })
      .catch((reason: Error) => {
        if (!cancelled) {
          setError(reason.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await createTask({ title, dueDate: dueDate || null });
      setTitle("");
      setDueDate("");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create task");
    }
  }

  async function handleToggle(id: string, status: TaskStatus) {
    setError(null);
    const nextStatus = status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed;
    try {
      await updateTaskStatus(id, nextStatus);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update task");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteTask(id);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete task");
    }
  }

  async function handleReorder(orderedIds: string[]) {
    setError(null);
    try {
      const next = await reorderTasks(orderedIds);
      setTasks(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not reorder tasks");
    }
  }

  async function handleClean() {
    setError(null);
    try {
      await cleanCompleted();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not clean tasks");
    }
  }

  return {
    tasks,
    title,
    dueDate,
    error,
    loading,
    setTitle,
    setDueDate,
    handleCreate,
    handleToggle,
    handleDelete,
    handleReorder,
    handleClean,
  };
}
