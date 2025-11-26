"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toast, ToastError } from "@/lib/toast";
import { ThemeToggleButton } from "./theme/theme-toggle";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

type MenuOption = "editName" | "changePassword" | "changeTheme";
const randomAvatar = Math.floor(Math.random() * 10) + 1;

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menu, setMenu] = useState<MenuOption>("editName");
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setNewName(data.user.name);
        }
      })
      .catch(() => setUser(null));
  }, []);

  const validatePassword = () => {
    if (!currentPassword) {
      ToastError("Current password is required");
      return false;
    }
    if (!newPassword) {
      ToastError("New password is required");
      return false;
    }
    if (newPassword.length < 8) {
      ToastError("New password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      ToastError("New password must contain at least one uppercase letter");
      return false;
    }
    if (!/[0-9]/.test(newPassword)) {
      ToastError("New password must contain at least one number");
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      ToastError("New password must contain at least one special character");
      return false;
    }
    return true;
  };

  const handleSignOut = () => {
    Toast("Logged out successfully!");
    Cookies.remove("token");
    setUser(null);
    router.push("/");
  };

  const handleUpdateProfile = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    if (menu === "editName" && !newName.trim()) {
      return Toast("Name cannot be empty!");
    }

    if (menu === "changePassword" && (!currentPassword || !newPassword)) {
      return Toast("Please fill both current and new password fields!");
    }

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(menu === "editName" ? { name: newName } : {}),
          ...(menu === "changePassword"
            ? { currentPassword, newPassword }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) return Toast(data.error || "Update failed");

      setUser(data.user);
      Toast("Profile updated successfully!");
      setDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      Toast("Server error");
    }
  };

  return (
    <header className="w-full py-6 px-8 flex justify-between items-center">
      <h1 className="text-3xl font-bold inline-block text-transparent bg-clip-text bg-linear-to-t from-blue-900 to-blue-500">
        Trello Clone
      </h1>

      <nav className="flex items-center gap-x-4">
        {!user ? (
          <>
            <Button size="lg" variant="outline">
              <Link href={"/sign-in"}>Login</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href={"/sign-up"}>Get Started</Link>
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={`https://avatar.iran.liara.run/public/${randomAvatar}`}
                    alt={user.name}
                    className="w-8 h-8 "
                  />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Profile Menu</DialogTitle>
                  <DialogDescription>
                    Manage your profile settings
                  </DialogDescription>
                </DialogHeader>

                {/* Menubar Tabs */}
                <div className="flex justify-between bg-card rounded-[12px] p-[6px] mb-4">
                  <Button
                    className="rounded-[6px] w-[32%]"
                    variant={menu === "editName" ? "default" : "ghost"}
                    onClick={() => setMenu("editName")}
                  >
                    Edit Name
                  </Button>
                  <Button
                    className="rounded-[6px] w-[32%]"
                    variant={menu === "changePassword" ? "default" : "ghost"}
                    onClick={() => setMenu("changePassword")}
                  >
                    Change Password
                  </Button>
                  <Button
                    className="rounded-[6px] w-[32%]"
                    variant={menu === "changeTheme" ? "default" : "ghost"}
                    onClick={() => setMenu("changeTheme")}
                  >
                    Setting
                  </Button>
                </div>

                {/* Menu Content */}
                {menu === "editName" && (
                  <div className="flex flex-col gap-4">
                    <Input
                      placeholder="New Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <Button onClick={handleUpdateProfile}>Save Name</Button>
                  </div>
                )}

                {menu === "changePassword" && (
                  <div className="flex flex-col gap-4 relative">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <Button onClick={handleUpdateProfile}>
                      Update Password
                    </Button>
                  </div>
                )}

                {menu === "changeTheme" && (
                  <div className="flex flex-col gap-4 justify-center items-center">
                    <ThemeToggleButton />
                  </div>
                )}

                <DialogClose asChild>
                  <Button variant="outline" className="mt-4 w-full">
                    Close
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            <span className="font-medium">{user.name}</span>
            <Button size="icon" variant="ghost" onClick={handleSignOut}>
              <LogOut />
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
