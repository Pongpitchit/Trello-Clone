import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listId } = await params;

  try {
    const tasks = await prisma.tasks.findMany({
      where: { list_id: listId },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(tasks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listId } = await params;
  try {
    const { title, description } = await req.json();
    if (!title)
      return NextResponse.json({ error: "Title required" }, { status: 400 });

    const count = await prisma.tasks.count({ where: { list_id: listId } });

    const newTask = await prisma.tasks.create({
      data: {
        title,
        description: description || null,
        list_id: listId,
        position: count,
        completed: false,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
