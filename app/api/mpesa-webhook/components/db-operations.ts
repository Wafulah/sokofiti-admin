import prismadb from "@/lib/prismadb";

import { useSelector } from 'react-redux';

// You can also subscribe to changes if needed

export async function updateOrderAndProducts(
  orderId: string,
  addressString: string,
  phone: string
) {
  try {
    const name = useSelector((state) => state.name);
const phoneNo = useSelector((state) => state.phoneNo);
const productIds = useSelector((state) => state.productIds);
    for (const prodId of productIds) {
      const order = await prismadb.order.update({
        where: {
          id: prodId, // Use the current orderId in the loop
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

      const productId = order.orderItems.map(
        (orderItem) => orderItem.productId
      );

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
    }

    return true; // Successful database update
  } catch (error) {
    console.error("Error updating the database:", error);
    return false; // Database update failed
  }
}
