import Stripe from "stripe";
import { NextResponse } from "next/server";

import MpesaPay from "@/lib/mpesa_lib";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds } = await req.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const line_items = [];
  let amount = 0;

  products.forEach((product) => {
    const unit_amount = product.price.toNumber() * 100; // Calculate the unit amount based on the price
    const quantity = 1; // Set the quantity to 1
    const amount_count = unit_amount * quantity; // Calculate the total amount
    line_items.push({
      amount: amount,
    });
    amount += amount_count;
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderItems: {
        create: productIds.map((productId: string) => ({
          product: {
            connect: {
              id: productId,
            },
          },
        })),
      },
    },
  });

  try {
    // Call MpesaPay with the appropriate phone_number and amount
    const response = await MpesaPay("0710760872", amount);
    // If MpesaPay is successful, update the success URL
    const successUrl = `${process.env.FRONTEND_STORE_URL}/cart?success=1`;
    return NextResponse.json({ url: successUrl }, { headers: corsHeaders });
  } catch (error) {
    // If there's an error, update the cancel URL
    const cancelUrl = `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`;
    return NextResponse.json({ url: cancelUrl }, { headers: corsHeaders });
  }
}
