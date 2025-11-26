import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/sign-in");
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    const _userId = payload.id || payload.userId;
  } catch {
    redirect("/sign-in");
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-pink-50 dark:from-blue-500 dark:via-white dark:to-pink-500">
      {children}
      <Toaster />
    </div>
  );
}
