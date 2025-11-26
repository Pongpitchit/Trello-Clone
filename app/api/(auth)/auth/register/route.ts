import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const exist = await prisma.users.findUnique({
      where: { email },
    });

    if (exist) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    if (exist) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: { name, email, password_hash: hash },
    });

    return Response.json({ message: "User created", user });
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
