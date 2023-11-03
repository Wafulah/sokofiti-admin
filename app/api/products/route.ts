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
  const { size, color, category } = query;

  try {
    let products;

    // Fetch all products if no parameters are specified
    products = await prismadb.product.findMany();

    return NextResponse.json(products, { headers: corsHeaders }), query;
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
