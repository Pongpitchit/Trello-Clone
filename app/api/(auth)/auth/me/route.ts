import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface PayloadProp {
  id: string;
  name: string;
  email: string;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as PayloadProp;

    const user = await prisma.users.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// --- PATCH for updating name and password ---
export async function PATCH(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as PayloadProp;

    const user = await prisma.users.findUnique({ where: { id: payload.id } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    // Update name
    if (name && name.trim() !== "") {
      user.name = name;
    }

    // Update password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(
        currentPassword,
        user.password_hash as string
      );
      if (!isMatch) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password_hash = hashed;
    }

    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { name: user.name, password_hash: user.password_hash },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
