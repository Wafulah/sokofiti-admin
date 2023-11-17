import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, latitude, longitude, images } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const updateData = {
      name,
      ...(latitude !== null ? { latitude } : {}),
      ...(longitude !== null ? { longitude } : {}),
      images: {
        deleteMany: {},
      },
    };

    await prismadb.store.update({
      where: {
        id: params.storeId,
      },
      data: {
        name,
        latitude: latitude !== null ? { set: latitude } : {},
        longitude: longitude !== null ? { set: longitude } : {},
        images: {
          deleteMany: {},
        },
      },
    });

    const store = await prismadb.store.update({
      where: {
        id: params.storeId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
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

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: params.storeId,
      },
      include: {
        images: true,
        products: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    return NextResponse.json(store, { headers: corsHeaders });
  } catch (error) {
    console.log("[SPECIFIC_STORE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
