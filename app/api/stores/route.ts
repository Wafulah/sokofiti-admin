import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      }
    });
  
    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(req: Request) {
  try {
    // Parse query parameters for bounds (southwest and northeast)
    const { searchParams } = new URL(req.url);
    const swLat = parseFloat(searchParams.get('swLat'));
    const swLng = parseFloat(searchParams.get('swLng'));
    const neLat = parseFloat(searchParams.get('neLat'));
    const neLng = parseFloat(searchParams.get('neLng'));

    if (isNaN(swLat) || isNaN(swLng) || isNaN(neLat) || isNaN(neLng)) {
      return new NextResponse("Invalid bounds", { status: 400 });
    }

    // Fetch stores within the specified boundary
    const stores = await prismadb.store.findMany({
      where: {
        latitude: {
          gte: swLat, // Greater than or equal to southwest latitude
          lte: neLat, // Less than or equal to northeast latitude
        },
        longitude: {
          gte: swLng, // Greater than or equal to southwest longitude
          lte: neLng, // Less than or equal to northeast longitude
        },
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error('[STORES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}