import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boardId } = await params;

  try {
    const lists = await prisma.lists.findMany({
      where: { board_id: boardId },
      orderBy: { position: "asc" },
      include: {
        tasks: { orderBy: { position: "asc" } }, // include tasks
      },
    });

    return NextResponse.json(lists);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boardId } = await params;
  try {
    const { title } = await req.json();
    if (!title)
      return NextResponse.json({ error: "Title required" }, { status: 400 });

    const count = await prisma.lists.count({ where: { board_id: boardId } });

    const newList = await prisma.lists.create({
      data: {
        title,
        board_id: boardId,
        position: count, // add to end
      },
    });

    return NextResponse.json(newList, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
