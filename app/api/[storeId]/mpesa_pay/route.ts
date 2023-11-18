import Stripe from "stripe";
import { NextResponse } from "next/server";
import MpesaPay from "@/lib/mpesa_lib";
import prismadb from "@/lib/prismadb";
import { updatePaymentData } from "@/providers/store";

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
  try {
    const StoreData = await req.json();
    const { name, phoneNo, productIds } = StoreData;

    // Dispatch an action to update the store
    updatePaymentData({
      name,
      phoneNo,
      productIds,
    });

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

// Initialize variables
const lineItemsByStore: Record<string, { lineItems: { productId: string; amount: number }[]; storeAmount: number }> = {};
let totalAmount = 0;

// Iterate through products to calculate the total amount and group line items by storeId
products.forEach((product) => {
  const unitAmount = product.price.toNumber();
  const quantity = 1; // Set the quantity to 1
  const amountCount = unitAmount * quantity; // Calculate the total amount

  // Group line items by storeId
  if (!lineItemsByStore[product.storeId]) {
    lineItemsByStore[product.storeId] = {
      lineItems: [],
      storeAmount: 0,
    };
  }

  lineItemsByStore[product.storeId].lineItems.push({
    productId: product.id,
    amount: amountCount,
  });

  // Update store-specific amount
  lineItemsByStore[product.storeId].storeAmount += amountCount;
  totalAmount += amountCount; // Keep track of the total amount for all stores
});

// Create orders for each store
const orderPromises = Object.entries(lineItemsByStore).map(async ([storeId, data]) => {
  const { lineItems, storeAmount } = data;

  const order = await prismadb.order.create({
    data: {
      storeId: storeId,
      isPaid: false,
      orderItems: {
        create: lineItems.map((lineItem) => ({
          product: {
            connect: {
              id: lineItem.productId,
            },
          },
        })),
      },
    },
  });

});

// Wait for all orders to be created
await Promise.all(orderPromises);


    // Call MpesaPay with the appropriate phone_number and amount
    try {
      const response = await MpesaPay(phoneNo, totalAmount);

      // If MpesaPay is successful, update the success URL
      const successUrl = `${process.env.FRONTEND_STORE_URL}/cart?success=1`;
      return NextResponse.json({ url: successUrl }, { headers: corsHeaders });
    } catch (error) {
      // Handle MpesaPay specific error, e.g., log the error, etc.
      // Provide a cancel URL for MpesaPay failure
      const cancelUrl = `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`;
      return NextResponse.json({ url: cancelUrl }, { headers: corsHeaders });
    }
  } catch (error) {
    // Handle the error and potentially return an error response
    return new NextResponse("An error occurred", { status: 500 });
  }
}
