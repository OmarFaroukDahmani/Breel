import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password , username} = body;

  if (!email || !password || !username) {
    return NextResponse.json(
      { message: "Email, username, and password are required" },
      { status: 400 }
    );
}


    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 } 
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username : username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        username: username,
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );

  } catch (error) {
  console.error("Signup error:", error);
  return NextResponse.json(
    { message: "Something went wrong" },
    { status: 500 }
  );
}
}
