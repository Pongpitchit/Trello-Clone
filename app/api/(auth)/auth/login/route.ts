import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return Response.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user)
      return Response.json({ error: "Invalid credentials" }, { status: 401 });

    const isValid = await bcrypt.compare(
      password,
      user.password_hash as string
    );

    if (!isValid)
      return Response.json({ error: "Invalid credentials" }, { status: 401 });

    // สร้าง JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return Response.json({ message: "Login success", token });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
