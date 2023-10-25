import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import prismadb from "@/lib/prismadb";
import { RootState } from "@/providers/store";

interface AppState {
  name: string;
  phoneNo: string;
  productIds: string[];
}

// Your custom hook for updating orders and products
export const useOrderAndProductUpdater = () => {
  const name = useSelector((state: RootState) => state.payment.name);
  const phoneNo = useSelector((state: RootState) => state.payment.phoneNo);
  const productIds = useSelector((state: RootState) => state.payment.productIds);

  const updateOrderAndProducts = useCallback(async () => {
    try {
      for (const prodId of productIds) {
        const order = await prismadb.order.update({
          where: {
            id: prodId,
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
  }, [productIds, name, phoneNo]);

  return updateOrderAndProducts;
};
