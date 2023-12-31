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

  const { categoryId, color, size } = query;

  try {
    let products;

    if (size && color && categoryId) {
      products = await prismadb.product.findMany({
        where: {
          sizeId: size as string,
          colorId: color as string,
          categoryId: categoryId as string,
        },
        include: {
          images: true,
          size: true,
          color: true,
        },
      });
    } else if (size && color) {
      products = await prismadb.product.findMany({
        where: {
          sizeId: size as string,
          colorId: color as string,
        },
        include: {
          images: true,
          size: true,
          color: true,
        },
      });
    } else if (categoryId) {
      products = await prismadb.product.findMany({
        where: {
          categoryId: categoryId as string,
        },
        include: {
          images: true,
          size: true,
          color: true,
        },
      });
    } else {
      products = await prismadb.product.findMany({
        include: {
          images: true,
          size: true,
          color: true,
        },
      });
    }

    return NextResponse.json(products, { headers: corsHeaders });
  } catch (error) {
    console.error("[ALL_PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
