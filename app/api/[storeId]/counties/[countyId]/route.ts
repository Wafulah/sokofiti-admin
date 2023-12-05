import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { countyId: string } }
) {
  try {
    if (!params.countyId) {
      return new NextResponse("County id is required", { status: 400 });
    }

    const county = await prismadb.county.findUnique({
      where: {
        id: params.countyId
      }
    });
  
    return NextResponse.json(county);
  } catch (error) {
    console.log('[COUNTY_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { countyId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.countyId) {
      return new NextResponse("County id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const county = await prismadb.county.delete({
      where: {
        id: params.countyId,
      }
    });
  
    return NextResponse.json(county);
  } catch (error) {
    console.log('[COUNTY_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { countyId: string, storeId: string } }
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

    if (!params.countyId) {
      return new NextResponse("County id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const county = await prismadb.county.update({
      where: {
        id: params.countyId,
      },
      data: {
        name,
      }
    });
  
    return NextResponse.json(county);
  } catch (error) {
    console.log('[COUNTY_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
