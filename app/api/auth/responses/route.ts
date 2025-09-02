import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  console.log("Entering GET /api/auth/responses");

  const session = await getServerSession(authOptions);
  console.log("Session:", session);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  console.log("User lookup:", user);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const responses = await prisma.response.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(responses);
}

export async function POST(req: Request) {
  console.log("Entering POST /api/auth/responses");

  const session = await getServerSession(authOptions);
  console.log("Session:", session);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();

  // Accept either a single object or an array of responses
  const payload = Array.isArray(body) ? body : [body];

  // Normalize and coerce types
  const rows = payload.map((item) => ({
    userId: user.id,
    financialYear: item.year?.toString() ?? item.financialYear?.toString() ?? "",
    electricity: Number(item.electricity ?? 0),
    renewable: Number(item.renewable ?? 0),
    fuel: Number(item.fuel ?? 0),
    emissions: Number(item.emissions ?? 0),
    employees: Number(item.employees ?? 0),
    femaleEmployees: Number(item.femaleEmployees ?? 0),
    trainingHours: Number(item.trainingHours ?? 0),
    communitySpend: Number(item.communitySpend ?? 0),
    boardPercent: Number(item.boardPercent ?? 0),
    privacyPolicy: Boolean(
      typeof item.privacyPolicy === "string"
        ? item.privacyPolicy.toLowerCase() === "yes" || item.privacyPolicy === "true"
        : item.privacyPolicy
    ),
    revenue: Number(item.revenue ?? 0),
  }));

  if (rows.length > 1) {
    const created = await prisma.$transaction(
      rows.map((r) => prisma.response.create({ data: r }))
    );
    return NextResponse.json(created, { status: 201 });
  } else {
    
    const created = await prisma.response.create({ data: rows[0] });
    return NextResponse.json(created, { status: 201 });
  }
}
