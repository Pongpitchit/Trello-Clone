// app/api/boards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getParamsId(ctx: { params: Promise<{ id: string }> }) {
  const p = await ctx.params;
  return p?.id;
}

function verifyTokenAndGetUserId(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) throw { status: 401, message: "Unauthorized" };
  const payload = jwt.verify(token, JWT_SECRET) as { id: string };
  return payload.id;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const boardId = await getParamsId(ctx);
  if (!boardId)
    return NextResponse.json(
      { error: "Board ID is required" },
      { status: 400 }
    );

  try {
    verifyTokenAndGetUserId(req);

    const board = await prisma.boards.findUnique({ where: { id: boardId } });
    if (!board)
      return NextResponse.json({ error: "Board not found" }, { status: 404 });

    return NextResponse.json(board);
  } catch (err: any) {
    console.error(err);
    const status = err?.status || 500;
    const message = err?.message || "Server error";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const boardId = await getParamsId(ctx);
  if (!boardId)
    return NextResponse.json(
      { error: "Board ID is required" },
      { status: 400 }
    );

  try {
    const userId = verifyTokenAndGetUserId(req);

    // 1) find existing board and check owner
    const existing = await prisma.boards.findUnique({ where: { id: boardId } });
    if (!existing)
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    if (existing.owner_id !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 2) support both FormData and JSON
    let title: string | undefined;
    let backgroundColor: string | null | undefined;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // formData
      const fd = await req.formData();
      const t = fd.get("title");
      if (t) title = String(t).trim();

      // accept several possible keys:
      const maybeBg =
        fd.get("backgroundColor") ?? fd.get("background") ?? fd.get("color");
      if (maybeBg !== null && maybeBg !== undefined) {
        backgroundColor = String(maybeBg).trim();
        if (backgroundColor === "") backgroundColor = null;
      }
    } else {
      // try json
      let body: any = {};
      try {
        body = await req.json();
      } catch (e) {
        // ignore
      }
      if (body.title) title = String(body.title).trim();
      if (body.backgroundColor ?? body.background ?? body.color) {
        backgroundColor = String(
          body.backgroundColor ?? body.background ?? body.color
        ).trim();
        if (backgroundColor === "") backgroundColor = null;
      }
    }

    // prepare update object (only include provided fields)
    const dataToUpdate: any = {};
    if (title !== undefined && title !== "") dataToUpdate.title = title;
    // explicit allow null to clear background: if user provided null => set to null
    if (backgroundColor !== undefined)
      dataToUpdate.backgroundColor = backgroundColor;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    const updated = await prisma.boards.update({
      where: { id: boardId },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("❌ PATCH /api/boards/[id] error:", err);
    const status = err?.status || 500;
    const message = err?.message || "Failed to update board";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const boardId = await getParamsId(ctx);
  if (!boardId)
    return NextResponse.json(
      { error: "Board ID is required" },
      { status: 400 }
    );

  try {
    const userId = verifyTokenAndGetUserId(req);

    const existing = await prisma.boards.findUnique({ where: { id: boardId } });
    if (!existing)
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    if (existing.owner_id !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.boards.delete({ where: { id: boardId } });

    return NextResponse.json({ message: "Board deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete board" },
      { status: 500 }
    );
  }
}
