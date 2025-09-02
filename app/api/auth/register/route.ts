import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }
}
