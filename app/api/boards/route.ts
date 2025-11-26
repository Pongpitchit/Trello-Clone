import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { id: string };

    const boards = await prisma.boards.findMany({
      where: { owner_id: payload.id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(boards);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { id: string };

    // Use Web API FormData
    const formData = await req.formData();
    const title = formData.get("title")?.toString().trim();
    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const backgroundColor = formData.get("backgroundColor")?.toString() || null;

    const newBoard = await prisma.boards.create({
      data: {
        title,
        owner_id: payload.id,
        created_at: new Date(),
        backgroundColor,
      },
    });

    return NextResponse.json(newBoard);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
