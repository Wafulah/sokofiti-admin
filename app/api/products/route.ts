import { NextResponse } from "next/server";

import { parse } from "url";

import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req: Request, res: Response) {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET(req: Request, res: Response) {
  const { query } = parse(req.url, true);

  // Now you can access query parameters
  const { categoryId, color, size } = query;

  try {
    let products;

    if (size && color && categoryId) {
      // Fetch products based on size, color, and category
      products = await prismadb.product.findMany({
        where: {
          sizeId: size as string,
          colorId: color as string,
          categoryId: categoryId as string,
        },
        include: {
          images: true, // Include related images
        },
      });
    } else if (size && color) {
      // Fetch products based on size and color
      products = await prismadb.product.findMany({
        where: {
          sizeId: size as string,
          colorId: color as string,
        },
        include: {
          images: true, // Include related images
        },
      });
    } else if (categoryId) {
      // Fetch products based on category
      products = await prismadb.product.findMany({
        where: {
          categoryId: categoryId as string,
        },
        include: {
          images: true, // Include related images
        },
      });
    } else {
      // Fetch all products if no parameters are specified
      products = await prismadb.product.findMany({
        include: {
          images: true, // Include related images
        },
      });
    }

    return NextResponse.json(products, { headers: corsHeaders });
  } catch (error) {
    console.error("[ALL_PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
