import prismadb from "@/lib/prismadb";

import { NextApiRequest } from 'next';

import { getMpesaPayData } from "@/app/api/[storeId]/mpesa_pay/route";


export async function updateOrderAndProducts(
  orderId: string,
  addressString: string,
  phone: string,
  req: NextApiRequest
) {
  try {
    const { name, phoneNo, productIds } = await getMpesaPayData(req);
    const order = await prismadb.order.update({
      where: {
        id: productIds,
      },
      data: {
        isPaid: true,
        address: name,
        phone: phoneNo || "",
      },
      include: {
        orderItems: true,
      },
    });

    const productId = order.orderItems.map((orderItem) => orderItem.productId);

    await prismadb.product.updateMany({
      where: {
        id: {
          in: productId,
        },
      },
      data: {
        isArchived: true,
      },
    });

    return true; // Successful database update
  } catch (error) {
    console.error("Error updating the database:", error);
    return false; // Database update failed
  }
}
