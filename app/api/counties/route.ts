import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const county = await prismadb.county.create({
      data: {
        name,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(county);
  } catch (error) {
    console.log("[COUNTIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req: Request, res: Response) {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const counties = await prismadb.county.findMany();

    return NextResponse.json(counties, { headers: corsHeaders });
  } catch (error) {
    console.log("[ALL_COUNTIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
