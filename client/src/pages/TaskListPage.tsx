import { CleanButton } from "../components/CleanButton";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { useTasks } from "../hooks/useTasks";
import "../styles/taskList.css";

export function TaskListPage() {
  const {
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
  } = useTasks();

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Task Tracker</h1>
          <p className="lede">Keep a simple list of what you need to do.</p>
        </div>
        <CleanButton onClick={handleClean} />
      </header>
      <section className="panel">
        <TaskForm
          title={title}
          dueDate={dueDate}
          onTitleChange={setTitle}
          onDueDateChange={setDueDate}
          onSubmit={handleCreate}
        />
        {error ? <p className="error">{error}</p> : null}
        {loading ? <p className="empty">Loading…</p> : null}
        {!loading ? (
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        ) : null}
      </section>
    </main>
  );
}
