import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  const body = await req.json();
  const { completed, title, description } = body;

  if (completed !== undefined && typeof completed !== "boolean") {
    return NextResponse.json(
      { error: "`completed` must be a boolean" },
      { status: 400 }
    );
  }

  try {
    const updatedTask = await prisma.tasks.update({
      where: { id },
      data: {
        ...(completed !== undefined && { completed }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // make sure id exists

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    const deleted = await prisma.tasks.delete({
      where: { id }, // id must not be undefined
    });
    return NextResponse.json({ message: "Task deleted", task: deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
