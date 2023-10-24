import { useSelector, useDispatch } from 'react-redux';

// Your custom hook for updating orders and products
export const useOrderAndProductUpdater = () => {
  const name = useSelector((state) => state.name);
  const phoneNo = useSelector((state) => state.phoneNo);
  const productIds = useSelector((state) => state.productIds);
  const dispatch = useDispatch();

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
            phone: phoneNo || '',
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

      // Dispatch an action to update the Redux store
      dispatch({
        type: 'UPDATE_PAYMENT_DATA',
        payload: {
          name,
          phoneNo,
          productIds,
        },
      });

      return true; // Successful database update
    } catch (error) {
      console.error('Error updating the database:', error);
      return false; // Database update failed
    }
  }, [productIds, name, phoneNo, dispatch]);

  return updateOrderAndProducts;
};
