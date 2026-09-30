import type { SubmitEvent } from "react";

type TaskFormProps = {
  title: string;
  dueDate: string;
  onTitleChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
};

export function TaskForm({
  title,
  dueDate,
  onTitleChange,
  onDueDateChange,
  onSubmit,
}: TaskFormProps) {
  return (
    <form className="task-form" onSubmit={onSubmit}>
      <label>
        Title
        <input
          name="title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Add a task"
          required
        />
      </label>
      <label>
        Due date
        <input
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(event) => onDueDateChange(event.target.value)}
        />
      </label>
      <button type="submit">Add task</button>
    </form>
  );
}
