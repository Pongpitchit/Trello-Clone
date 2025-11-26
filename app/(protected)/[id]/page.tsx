"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ToastError } from "@/lib/toast";
import { Pen } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Board {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
  backgroundColor?: string;
}

const colorPresets = [
  "#ffffff", // White
  "#f28b82", // Red
  "#fbbc04", // Orange
  "#fff475", // Yellow
  "#ccff90", // Green
  "#a7ffeb", // Teal
  "#cbf0f8", // Blue
  "#aecbfa", // Dark Blue
  "#d7aefb", // Purple
  "#fdcfe8", // Pink
  "#e6c9a8", // Brown
  "#e8eaed", // Gray
];

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);

  // CREATE BOARD STATE
  const [boardTitle, setBoardTitle] = useState("");
  const [boardColor, setBoardColor] = useState("#ffffff");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // EDIT BOARD STATE
  const [editBoard, setEditBoard] = useState<Board | null>(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [editBoardColor, setEditBoardColor] = useState("#ffffff");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const router = useRouter();

  // FETCH USER PROFILE & BOARDS
  useEffect(() => {
    const fetchProfileAndBoards = async () => {
      const token = Cookies.get("token");
      if (!token) return router.replace("/sign-in");

      try {
        const profileRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();

        if (!profileRes.ok || !profileData.user) {
          Cookies.remove("token");
          return router.replace("/sign-in");
        }

        setUser(profileData.user);

        const boardsRes = await fetch(
          `/api/boards?ownerId=${profileData.user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const boardsData = await boardsRes.json();
        // Map to ensure backgroundColor is defined
        const mappedBoards: Board[] = boardsData.map((b: any) => ({
          ...b,
          backgroundColor: b.backgroundColor || "#ffffff",
        }));
        setBoards(mappedBoards);
      } catch (err) {
        console.error(err);
        Cookies.remove("token");
        router.replace("/sign-in");
      }
    };

    fetchProfileAndBoards();
  }, [router]);

  // CREATE BOARD
  const handleCreateBoard = async () => {
    if (!boardTitle.trim()) return ToastError("Board title is required");

    try {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("title", boardTitle);
      formData.append("backgroundColor", boardColor);

      const res = await fetch("/api/boards", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const newBoard: Board & { error?: string } = await res.json();

      if (res.ok) {
        toast.success("Board created!");
        setBoards([...boards, newBoard]);
        setIsCreateDialogOpen(false);
        setBoardTitle("");
        setBoardColor("#ffffff");
        router.push(`/boards/${newBoard.id}`);
      } else {
        ToastError(newBoard.error || "Failed to create board");
      }
    } catch (err) {
      console.error(err);
      ToastError("Server error. Try again later.");
    }
  };

  // OPEN EDIT DIALOG
  const openEditDialog = (board: Board) => {
    setEditBoard(board);
    setEditBoardTitle(board.title);
    setEditBoardColor(board.backgroundColor || "#ffffff");
    setIsEditDialogOpen(true);
  };

  // EDIT BOARD
  const handleEditBoard = async () => {
    if (!editBoard || !editBoardTitle.trim())
      return ToastError("Board title is required");

    try {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("title", editBoardTitle);
      formData.append("backgroundColor", editBoardColor);

      const res = await fetch(`/api/boards/${editBoard.id}`, {
        method: "PATCH",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: Board & { error?: string } = await res.json();
      if (res.ok) {
        setBoards((prev) =>
          prev.map((b) => (b.id === editBoard.id ? { ...b, ...data } : b))
        );
        toast.success("Board updated!");
        setIsEditDialogOpen(false);
        setEditBoard(null);
      } else {
        ToastError(data.error || "Failed to update board");
      }
    } catch (err) {
      console.error(err);
      ToastError("Server error. Try again later.");
    }
  };

  // DELETE BOARD
  const handleDeleteBoard = async () => {
    if (!editBoard) return;
    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/boards/${editBoard.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setBoards((prev) => prev.filter((b) => b.id !== editBoard.id));
        toast.success("Board deleted!");
        setIsEditDialogOpen(false);
        setEditBoard(null);
      } else {
        const data = await res.json();
        ToastError(data.error || "Failed to delete board");
      }
    } catch (err) {
      console.error(err);
      ToastError("Server error. Try again later.");
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading your profile...</p>
      </div>
    );

  const boardEmpty = boards.length === 0;

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar />
      <header className="px-8 py-4 flex justify-between shadow-sm mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user.name}!
        </h1>
        {!boardEmpty && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create More Board
          </Button>
        )}
      </header>
      <main className="flex-1 px-8">
        {boardEmpty ? (
          <Card className="w-[30%] sm:w-[25%] py-6 text-center mx-auto">
            <CardHeader>
              <CardTitle>No boards yet</CardTitle>
              <CardDescription>
                Start by creating your first board!
              </CardDescription>
            </CardHeader>

            <CardContent className="flex justify-center">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create New Board
              </Button>
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {boards.map((board) => (
              <Card
                key={board.id}
                style={{
                  backgroundColor: board.backgroundColor || "#ffffff",
                }}
              >
                <CardHeader className="flex justify-between items-center">
                  <div>
                    <CardTitle>{board.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Created on{" "}
                      {new Date(board.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(board)}
                    >
                      <Pen />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push(`/boards/${board.id}`)}>
                    Open Board
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>

      {/* EDIT BOARD DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
            <DialogDescription>
              Update title and background color.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Board title"
              value={editBoardTitle}
              onChange={(e) => setEditBoardTitle(e.target.value)}
            />
            <div className="flex flex-col flex-wrap gap-2 mt-2">
              <label>Background Color:</label>
              <div className="grid grid-cols-10 gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 border-2 ${
                      editBoardColor === color
                        ? "border-black/70 dark:border-white rounded-full"
                        : "border-black/10 dark:border-gray-50 rounded-full"
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
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Board</DialogTitle>
            <DialogDescription>
              Enter a name and choose a background color.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              placeholder="Board title"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
            />

            {/* Colors */}
            <div className="flex flex-col flex-wrap gap-2 mt-2">
              <label>Background Color:</label>
              <div className="grid grid-cols-10 gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 border-2 ${
                      boardColor === color
                        ? "border-black/70 dark:border-white rounded-full"
                        : "border-black/10 dark:border-gary-50 rounded-full"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setBoardColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <Button onClick={handleCreateBoard}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
