export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// GET - List user's children
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const children = await db.child.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        avatar: true,
        stars: true,
        currentStreak: true,
        gamificationLevel: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Failed to fetch children:", error);
    return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
  }
}

const createChildSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatar: z.string().default("⭐"),
  age: z.number().optional(),
});

// POST - Create a new child
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createChildSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, avatar, age } = result.data;

    const child = await db.child.create({
      data: {
        name,
        avatar,
        age,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        stars: true,
        currentStreak: true,
      },
    });

    return NextResponse.json({ child });
  } catch (error) {
    console.error("Failed to create child:", error);
    return NextResponse.json({ error: "Failed to create child" }, { status: 500 });
  }
}
