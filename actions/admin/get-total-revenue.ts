import prismadb from "@/lib/prismadb";


import { redirect } from 'next/navigation';

export const getTotalRevenue = async (storeId: string) => {
  
  if (storeId !== process.env.NEXT_PUBLIC_ADMIN) {
    redirect('/sign-in');
  }
  
  const paidOrders = await prismadb.order.findMany({
    where: {
     
      isPaid: true
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + item.product.price.toNumber();
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};
