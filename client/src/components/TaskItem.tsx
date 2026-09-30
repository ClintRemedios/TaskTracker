import { useRef, type DragEvent } from "react";
import { TaskStatus, type Task } from "../types/task";

type TaskItemProps = {
  task: Task;
  isDragging: boolean;
  dropEdge: "before" | "after" | null;
  onToggle: (id: string, status: Task["status"]) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverRow: (id: string, clientY: number, row: HTMLElement) => void;
  onDropOn: () => void;
};

export function TaskItem({
  task,
  isDragging,
  dropEdge,
  onToggle,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOverRow,
  onDropOn,
}: TaskItemProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const className = [
    "task-item",
    task.status === TaskStatus.Completed ? "completed" : "",
    isDragging ? "is-dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleDragStart(event: DragEvent<HTMLButtonElement>) {
    const transfer = event.dataTransfer;
    if (transfer) {
      transfer.effectAllowed = "move";
      transfer.setData("text/plain", task.id);
      if (rowRef.current) {
        transfer.setDragImage(rowRef.current, 28, 24);
      }
    }
    onDragStart(task.id);
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    onDragOverRow(task.id, event.clientY, event.currentTarget);
  }

  return (
    <li
      ref={rowRef}
      className={className}
      onDragOver={handleDragOver}
      onDrop={(event) => {
        event.preventDefault();
        onDropOn();
      }}
    >
      {dropEdge === "before" ? <div className="drop-line drop-line-before" /> : null}
      <div className="task-card">
        <button
          type="button"
          className="drag-handle"
          draggable
          aria-label={`Reorder ${task.title}`}
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
        >
          <span className="drag-grip" aria-hidden="true" />
        </button>
        <label className="task-check">
          <input
            type="checkbox"
            checked={task.status === TaskStatus.Completed}
            onChange={() => onToggle(task.id, task.status)}
            aria-label={`Mark ${task.title} as ${task.status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed}`}
          />
          <span>{task.title}</span>
        </label>
        {task.dueDate ? (
          <time className="task-due" dateTime={task.dueDate}>
            {task.dueDate}
          </time>
        ) : (
          <span className="task-due" />
        )}
        <button
          type="button"
          className="icon-button"
          aria-label={`Delete ${task.title}`}
          onClick={() => onDelete(task.id)}
        >
          ×
        </button>
      </div>
      {dropEdge === "after" ? <div className="drop-line drop-line-after" /> : null}
    </li>
  );
}
