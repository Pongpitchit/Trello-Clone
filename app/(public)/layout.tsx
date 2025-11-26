import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // ถ้ามี token → ส่ง user เข้า dashboard
  if (token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      const userId = payload.id || payload.userId;
      redirect(`/${userId}`);
    } catch {
      // token พัง → ให้ไป login ใหม่
      redirect("/sign-in");
    }
  }

  // ไม่มี token = หน้าสาธารณะ ใช้งานได้ปกติ
  return (
    <div className="w-svw h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-pink-50">
      {children}
      <Toaster />
    </div>
  );
}
