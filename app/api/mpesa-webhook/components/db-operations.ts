import prismadb from '@/lib/prismadb';

export async function updateOrderAndProducts(orderId: string, addressString: string, phone: string) {
  try {
    const order = await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: phone || '',
      },
      include: {
        orderItems: true,
      },
    });

    const productIds = order.orderItems.map((orderItem) => orderItem.productId);

    await prismadb.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: {
        isArchived: true,
      },
    });

    return true; // Successful database update
  } catch (error) {
    console.error('Error updating the database:', error);
    return false; // Database update failed
  }
}
