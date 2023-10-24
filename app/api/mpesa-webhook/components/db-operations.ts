import prismadb from "@/lib/prismadb";

import { paymentDataStore } from "@/providers/store";

// You can also subscribe to changes if needed

export async function updateOrderAndProducts(
  orderId: string,
  addressString: string,
  phone: string
) {
  try {
    // Access the data like this
    const name = paymentDataStore.name;
    const phoneNo = paymentDataStore.phoneNo;
    const productIds = paymentDataStore.productIds;
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
  }

    return true; // Successful database update
  } catch (error) {
    console.error("Error updating the database:", error);
    return false; // Database update failed
  }
}
