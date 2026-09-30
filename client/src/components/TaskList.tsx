import { useRef, useState } from "react";
import type { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  onToggle: (id: string, status: Task["status"]) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

export function TaskList({ tasks, onToggle, onDelete, onReorder }: TaskListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dropIndexRef = useRef<number | null>(null);

  function placeDrop(next: number | null) {
    dropIndexRef.current = next;
    setDropIndex(next);
  }

  function clearDrag() {
    setDraggingId(null);
    placeDrop(null);
  }

  function handleDragOver(targetId: string, clientY: number, row: HTMLElement) {
    if (!draggingId) {
      return;
    }
    const from = tasks.findIndex((task) => task.id === draggingId);
    const index = tasks.findIndex((task) => task.id === targetId);
    if (from < 0 || index < 0) {
      return;
    }
    const rect = row.getBoundingClientRect();
    const before = clientY < rect.top + rect.height / 2;
    const next = before ? index : index + 1;
    if (next === from || next === from + 1) {
      placeDrop(null);
      return;
    }
    placeDrop(next);
  }

  function handleDrop() {
    const target = dropIndexRef.current;
    const sourceId = draggingId;
    clearDrag();
    if (sourceId === null || target === null) {
      return;
    }
    const ids = tasks.map((task) => task.id);
    const from = ids.indexOf(sourceId);
    if (from < 0) {
      return;
    }
    ids.splice(from, 1);
    const insertAt = target > from ? target - 1 : target;
    ids.splice(insertAt, 0, sourceId);
    onReorder(ids);
  }

  function dropEdgeFor(index: number): "before" | "after" | null {
    if (dropIndex === index) {
      return "before";
    }
    if (dropIndex === tasks.length && index === tasks.length - 1) {
      return "after";
    }
    return null;
  }

  if (tasks.length === 0) {
    return <p className="empty">No tasks yet.</p>;
  }

  return (
    <ol className="task-list">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          isDragging={task.id === draggingId}
          dropEdge={dropEdgeFor(index)}
          onToggle={onToggle}
          onDelete={onDelete}
          onDragStart={setDraggingId}
          onDragEnd={clearDrag}
          onDragOverRow={handleDragOver}
          onDropOn={handleDrop}
        />
      ))}
    </ol>
  );
}
