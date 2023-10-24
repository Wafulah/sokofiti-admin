import prismadb from "@/lib/prismadb";

import { paymentDataStore } from "@/providers/store";

// You can also subscribe to changes if needed

export async function updateOrderAndProducts(
  orderId: string,
  addressString: string,
  phone: string
) {
  try {
    // Use useSnapshot to access the snapshot of paymentDataStore
    const snapshot = paymentDataStore;

    // Access the data from the snapshot
    const name = snapshot.name;
    const phoneNo = snapshot.phoneNo;
    const productIds = snapshot.productIds;
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
