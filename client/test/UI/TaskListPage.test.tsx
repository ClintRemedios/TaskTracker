import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/App";
import { TaskListPage } from "../../src/pages/TaskListPage";
import { TaskStatus, type Task } from "../../src/types/task";

const api = vi.hoisted(() => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  updateTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
  reorderTasks: vi.fn(),
  cleanCompleted: vi.fn(),
}));

vi.mock("../../src/api/tasks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/api/tasks")>();
  return { ...actual, ...api };
});

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "1",
    userId: "default-user",
    title: "Buy milk",
    dueDate: null,
    order: 0,
    status: TaskStatus.Pending,
    deleted: false,
    ...overrides,
  };
}

describe("TaskListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listTasks.mockResolvedValue([]);
    api.createTask.mockResolvedValue(makeTask());
    api.updateTaskStatus.mockResolvedValue(makeTask({ status: TaskStatus.Completed }));
    api.deleteTask.mockResolvedValue(undefined);
    api.reorderTasks.mockResolvedValue([]);
    api.cleanCompleted.mockResolvedValue({ deletedCount: 1 });
  });

  it("creates a task from the form", async () => {
    const user = userEvent.setup();
    api.listTasks
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([makeTask({ title: "Buy milk" })]);
    render(<TaskListPage />);
    await screen.findByText("No tasks yet.");
    await user.type(screen.getByLabelText("Title"), "Buy milk");
    await user.click(screen.getByRole("button", { name: "Add task" }));
    await waitFor(() =>
      expect(api.createTask).toHaveBeenCalledWith({ title: "Buy milk", dueDate: null }),
    );
    expect(await screen.findByText("Buy milk")).toBeInTheDocument();
  });

  it("toggles a task checkbox", async () => {
    const user = userEvent.setup();
    api.listTasks.mockResolvedValue([makeTask({ id: "a", title: "Alpha" })]);
    render(<TaskListPage />);
    await screen.findByText("Alpha");
    await user.click(screen.getByRole("checkbox", { name: "Mark Alpha as completed" }));
    await waitFor(() =>
      expect(api.updateTaskStatus).toHaveBeenCalledWith("a", TaskStatus.Completed),
    );
  });

  it("deletes a task with the row button", async () => {
    const user = userEvent.setup();
    api.listTasks
      .mockResolvedValueOnce([makeTask({ id: "a", title: "Alpha" })])
      .mockResolvedValueOnce([]);
    render(<TaskListPage />);
    await screen.findByText("Alpha");
    await user.click(screen.getByRole("button", { name: "Delete Alpha" }));
    await waitFor(() => expect(api.deleteTask).toHaveBeenCalledWith("a"));
  });

  it("reorders tasks on drop", async () => {
    const first = makeTask({ id: "a", title: "Alpha", order: 0 });
    const second = makeTask({ id: "b", title: "Beta", order: 1 });
    api.listTasks.mockResolvedValue([first, second]);
    api.reorderTasks.mockResolvedValue([second, first]);
    render(<TaskListPage />);
    await screen.findByText("Alpha");
    const betaItem = screen.getByText("Beta").closest("li")!;
    fireEvent.dragStart(screen.getByRole("button", { name: "Reorder Alpha" }));
    fireEvent.dragOver(betaItem);
    expect(betaItem.querySelector(".drop-line")).toBeInTheDocument();
    fireEvent.drop(betaItem);
    await waitFor(() => expect(api.reorderTasks).toHaveBeenCalledWith(["b", "a"]));
  });

  it("cleans completed tasks", async () => {
    const user = userEvent.setup();
    api.listTasks.mockResolvedValue([makeTask({ status: TaskStatus.Completed })]);
    render(<TaskListPage />);
    await screen.findByText("Buy milk");
    await user.click(screen.getByRole("button", { name: "Clean" }));
    await waitFor(() => expect(api.cleanCompleted).toHaveBeenCalled());
  });

  it("renders the app shell", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Task Tracker" })).toBeInTheDocument();
  });

  it("sends a due date and shows it on the row", async () => {
    const user = userEvent.setup();
    api.listTasks
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([makeTask({ title: "File taxes", dueDate: "2026-09-30" })]);
    render(<TaskListPage />);
    await screen.findByText("No tasks yet.");
    await user.type(screen.getByLabelText("Title"), "File taxes");
    fireEvent.change(screen.getByLabelText("Due date"), { target: { value: "2026-09-30" } });
    await user.click(screen.getByRole("button", { name: "Add task" }));
    await waitFor(() =>
      expect(api.createTask).toHaveBeenCalledWith({ title: "File taxes", dueDate: "2026-09-30" }),
    );
    expect(await screen.findByText("2026-09-30")).toBeInTheDocument();
  });

  it("shows an error when the list fails to load", async () => {
    api.listTasks.mockRejectedValue(new Error("offline"));
    render(<TaskListPage />);
    expect(await screen.findByText("offline")).toBeInTheDocument();
  });

  it("shows create, update, and delete failures", async () => {
    const user = userEvent.setup();
    api.listTasks.mockResolvedValue([
      makeTask({ id: "a", title: "Alpha", status: TaskStatus.Completed }),
    ]);
    api.createTask.mockRejectedValueOnce(new Error("bad title")).mockRejectedValueOnce("nope");
    api.updateTaskStatus.mockRejectedValue(new Error("cannot update"));
    api.deleteTask.mockRejectedValue("nope");
    api.reorderTasks.mockRejectedValue(new Error("cannot reorder"));
    api.cleanCompleted.mockRejectedValue("nope");
    render(<TaskListPage />);
    await screen.findByText("Alpha");

    await user.type(screen.getByLabelText("Title"), "Next");
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(await screen.findByText("bad title")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(await screen.findByText("Could not create task")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Mark Alpha as pending" }));
    expect(await screen.findByText("cannot update")).toBeInTheDocument();
    expect(api.updateTaskStatus).toHaveBeenCalledWith("a", TaskStatus.Pending);

    await user.click(screen.getByRole("button", { name: "Delete Alpha" }));
    expect(await screen.findByText("Could not delete task")).toBeInTheDocument();

    const row = screen.getByText("Alpha").closest("li")!;
    fireEvent.dragStart(screen.getByRole("button", { name: "Reorder Alpha" }));
    fireEvent.drop(row);
    expect(api.reorderTasks).not.toHaveBeenCalled();
  });

  it("reports reorder and clean failures and ignores a drop that does not move the task", async () => {
    const user = userEvent.setup();
    const first = makeTask({ id: "a", title: "Alpha", order: 0 });
    const second = makeTask({ id: "b", title: "Beta", order: 1 });
    api.listTasks.mockResolvedValue([first, second]);
    api.reorderTasks.mockRejectedValue(new Error("cannot reorder"));
    api.cleanCompleted
      .mockRejectedValueOnce(new Error("cannot clean"))
      .mockRejectedValueOnce("nope");
    render(<TaskListPage />);
    const alpha = await screen.findByText("Alpha");
    const alphaItem = alpha.closest("li")!;
    const handle = screen.getByRole("button", { name: "Reorder Alpha" });
    const transfer = {
      effectAllowed: "move",
      dropEffect: "none",
      setData: vi.fn(),
      setDragImage: vi.fn(),
    };

    fireEvent.dragOver(alphaItem);
    fireEvent.dragStart(handle, { dataTransfer: transfer });
    expect(alphaItem).toHaveClass("is-dragging");
    fireEvent.dragOver(alphaItem, { dataTransfer: transfer, clientY: 0 });
    fireEvent.drop(alphaItem);
    expect(api.reorderTasks).not.toHaveBeenCalled();
    expect(transfer.setData).toHaveBeenCalledWith("text/plain", "a");
    expect(transfer.setDragImage).toHaveBeenCalled();
    expect(transfer.dropEffect).toBe("move");

    fireEvent.dragStart(handle);
    fireEvent.dragEnd(handle);
    expect(alphaItem).not.toHaveClass("is-dragging");

    await user.click(screen.getByRole("button", { name: "Clean" }));
    expect(await screen.findByText("cannot clean")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clean" }));
    expect(await screen.findByText("Could not clean tasks")).toBeInTheDocument();
  });

  it("moves a later task above an earlier one", async () => {
    const first = makeTask({ id: "a", title: "Alpha", order: 0 });
    const second = makeTask({ id: "b", title: "Beta", order: 1 });
    api.listTasks.mockResolvedValue([first, second]);
    api.reorderTasks.mockResolvedValue([second, first]);
    render(<TaskListPage />);
    await screen.findByText("Beta");
    const alphaItem = screen.getByText("Alpha").closest("li")!;
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = () =>
      ({
        top: 100,
        height: 40,
        bottom: 140,
        left: 0,
        right: 10,
        width: 10,
        x: 0,
        y: 100,
        toJSON() {
          return {};
        },
      }) as DOMRect;
    try {
      fireEvent.dragStart(screen.getByRole("button", { name: "Reorder Beta" }));
      expect(screen.getByText("Beta").closest("li")).toHaveClass("is-dragging");
      expect(alphaItem.getBoundingClientRect().top).toBe(100);
      const over = createEvent.dragOver(alphaItem);
      Object.defineProperty(over, "clientY", { value: 0 });
      fireEvent(alphaItem, over);
      expect(alphaItem.querySelector(".drop-line")).not.toBeNull();
      fireEvent.drop(alphaItem);
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original;
    }
    await waitFor(() => expect(api.reorderTasks).toHaveBeenCalledWith(["b", "a"]));
  });

  it("ignores a list result that arrives after unmount", async () => {
    let resolveList: (tasks: Task[]) => void = () => {};
    api.listTasks.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    const view = render(<TaskListPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    view.unmount();
    resolveList([]);
    await Promise.resolve();
  });
});
