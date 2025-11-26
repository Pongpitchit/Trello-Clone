"use client";

import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ArrowLeftFromLine, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Board {
  id: string;
  title: string;
  owner_id: string;
  background?: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  list_id: string;
  position: number;
  created_at: string;
  completed: boolean;
}

interface List {
  id: string;
  title: string;
  board_id: string;
  position: number;
  tasks?: Task[];
}

const colorPresets = [
  "#ffffff",
  "#f28b82",
  "#fbbc04",
  "#fff475",
  "#ccff90",
  "#a7ffeb",
  "#cbf0f8",
  "#aecbfa",
  "#d7aefb",
  "#fdcfe8",
  "#e6c9a8",
  "#e8eaed",
];

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id;

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  // Board edit dialog
  const [editBoardDialogOpen, setEditBoardDialogOpen] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [editBoardColor, setEditBoardColor] = useState("#ffffff");

  // List creation dialog
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  // Task creation dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  // Task edit dialog
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<(Task & { listId: string }) | null>(
    null
  );

  // Fetch board & lists
  useEffect(() => {
    const fetchBoardAndLists = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const [boardRes, listsRes] = await Promise.all([
          fetch(`/api/boards/${boardId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/boards/${boardId}/lists`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (boardRes.ok) {
          const data: Board = await boardRes.json();
          setBoard(data);
          setEditBoardTitle(data.title);
          setEditBoardColor(data.background || "#ffffff");
        }

        if (listsRes.ok) setLists(await listsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoardAndLists();
  }, [boardId]);

  // --- Board API ---
  const handleEditBoard = async () => {
    if (!editBoardTitle.trim()) return toast.error("Board title is required");

    try {
      const token = Cookies.get("token");
      if (!token) return;

      const formData = new FormData();
      formData.append("title", editBoardTitle);
      formData.append("background", editBoardColor);

      const res = await fetch(`/api/boards/${board?.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data: Board = await res.json();
      if (res.ok) {
        setBoard(data);
        toast.success("Board updated!");
        setEditBoardDialogOpen(false);
      } else toast.error("Failed to update board");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handleDeleteBoard = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch(`/api/boards/${board?.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Board deleted!");
        router.push(`/${board?.owner_id}`);
      } else toast.error("Failed to delete board");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // --- List API ---
  const handleCreateList = async () => {
    if (!newListTitle.trim()) return toast.error("List title is required");
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch(`/api/boards/${boardId}/lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newListTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setLists([...lists, data]);
        setNewListTitle("");
        setListDialogOpen(false);
        toast.success("List created!");
      } else toast.error("Failed to create list");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // --- Task API ---
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !currentListId) return;
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch(`/api/lists/${currentListId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLists((prev) =>
          prev.map((l) =>
            l.id === currentListId
              ? { ...l, tasks: [...(l.tasks || []), data] }
              : l
          )
        );
        setNewTaskTitle("");
        setNewTaskDescription("");
        setTaskDialogOpen(false);
        setCurrentListId(null);
        toast.success("Task created!");
      } else toast.error("Failed to create task");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handleToggleTask = async (taskId: string, listId: string) => {
    const list = lists.find((l) => l.id === listId);
    const task = list?.tasks?.find((t) => t.id === taskId);
    if (!task) return;
    const newCompleted = !task.completed;
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                tasks: l.tasks?.map((t) =>
                  t.id === taskId ? { ...t, completed: newCompleted } : t
                ),
              }
            : l
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
    }
  };

  const handleOpenEditTask = (task: Task, listId: string) => {
    setEditTask({ ...task, listId });
    setEditTaskDialogOpen(true);
  };

  const handleEditTaskSubmit = async () => {
    if (!editTask) return;
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch(`/api/tasks/${editTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTask.title,
          description: editTask.description,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLists((prev) =>
          prev.map((list) =>
            list.id === editTask.listId
              ? {
                  ...list,
                  tasks: list.tasks?.map((t) =>
                    t.id === editTask.id ? { ...t, ...data } : t
                  ),
                }
              : list
          )
        );
        toast.success("Task updated!");
        setEditTaskDialogOpen(false);
        setEditTask(null);
      } else toast.error("Failed to update task");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handleDeleteTask = async () => {
    if (!editTask) return;
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch(`/api/tasks/${editTask.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLists((prev) =>
          prev.map((list) =>
            list.id === editTask.listId
              ? {
                  ...list,
                  tasks: list.tasks?.filter((t) => t.id !== editTask.id),
                }
              : list
          )
        );
        toast.success("Task deleted!");
        setEditTaskDialogOpen(false);
        setEditTask(null);
      } else toast.error("Failed to delete task");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="p-8">Loading board...</p>
      </div>
    );
  if (!board)
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="p-8">Board not found.</p>
      </div>
    );

  return (
    <div
      className="min-h-screen flex flex-col w-full "
      style={{ backgroundColor: board.background || "#ffffff" }}
    >
      <Navbar />
      <main className="py-4 flex justify-between shadow-sm">
        <header className="flex items-center justify-between w-full gap-x-4 px-8">
          <div className="flex items-center justify-center gap-x-4">
            <Button
              className="bg-transparent "
              size="icon"
              variant="ghost"
              onClick={() => router.push(`/${board.owner_id}`)}
            >
              <ArrowLeftFromLine />
            </Button>
            <h1 className="text-3xl font-bold">{board.title}</h1>
          </div>
          <Button
            className="bg-transparent "
            size="icon"
            variant="ghost"
            onClick={() => setEditBoardDialogOpen(true)}
          >
            <Pen />
          </Button>
        </header>
      </main>

      {/* Board content */}
      <section className="p-8 overflow-x-auto">
        <div className="flex items-start gap-4 text-card-foreground">
          {lists.map((list) => (
            <div
              key={list.id}
              className="w-72 bg-card rounded-xl shadow p-4 flex flex-col gap-3"
            >
              <h2 className="text-lg font-semibold">{list.title}</h2>
              {(list.tasks || []).map((task) => (
                <div
                  key={task.id}
                  className=" p-3 rounded-md shadow-sm flex items-start gap-3 cursor-pointer hover:bg-input/10 transition bg-input/20"
                  onClick={() => handleOpenEditTask(task, list.id)}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={task.completed}
                    onClick={(e) => e.stopPropagation()} // prevent parent click
                    onCheckedChange={() => handleToggleTask(task.id, list.id)}
                    className="mt-1"
                  />

                  {/* Task info */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span
                      className={`text-md truncate ${
                        task.completed ? "line-through " : " font-semibold"
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </span>

                    {task.description && (
                      <span
                        className={`text-sm truncate ${
                          task.completed
                            ? "line-through text-slate-400"
                            : "text-slate-500"
                        }`}
                        title={task.description}
                      >
                        {task.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full justify-start text-slate-500 "
                onClick={() => {
                  setCurrentListId(list.id);
                  setTaskDialogOpen(true);
                }}
              >
                + Add Task
              </Button>
            </div>
          ))}

          {/* Add List */}
          <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Add List</DialogTitle>
                <DialogDescription>
                  Enter a title for the new list.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="List title"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateList}>Create</Button>
              </div>
            </DialogContent>

            <DialogTrigger asChild>
              <button className="w-72 min-w-72 h-fit bg-card hover:bg-card/70 rounded-xl shadow p-4 text-left text-card-foreground font-medium">
                + Add List
              </button>
            </DialogTrigger>
          </Dialog>
        </div>
      </section>

      {/* Edit Task Dialog */}
      <Dialog
        open={editTaskDialogOpen}
        onOpenChange={() => setEditTaskDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update title and description</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Task title"
              value={editTask?.title || ""}
              onChange={(e) =>
                setEditTask(
                  (prev) => prev && { ...prev, title: e.target.value }
                )
              }
            />
            <Textarea
              placeholder="Task description"
              value={editTask?.description || ""}
              onChange={(e) =>
                setEditTask(
                  (prev) => prev && { ...prev, description: e.target.value }
                )
              }
            />
            <div className="flex justify-between mt-4">
              <Button variant="destructive" onClick={handleDeleteTask}>
                Delete
              </Button>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleEditTaskSubmit}>Save</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editBoardDialogOpen} onOpenChange={setEditBoardDialogOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
            <DialogDescription>
              Update the board title or background
            </DialogDescription>
          </DialogHeader>
          <Input
            value={editBoardTitle}
            onChange={(e) => setEditBoardTitle(e.target.value)}
            placeholder="Board title"
            className="mt-2"
          />
          <div className="flex flex-col flex-wrap gap-2 mt-2">
            <label>Background Color:</label>
            <div className="grid grid-cols-10 gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8  border-2 ${
                    editBoardColor === color
                      ? "border-black/70 dark:border-white rounded-full"
                      : "border-black/10 dark:border-gary-50 rounded-full"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setEditBoardColor(color)}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="destructive" onClick={handleDeleteBoard}>
              Delete Board
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditBoard}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Enter a title and description for the new task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <Textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateTask}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
