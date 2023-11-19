import { redirect } from 'next/navigation';
import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { formatter } from "@/lib/utils";

import { OrderCol } from "./components/columns"
import { OrderClient } from "./components/client";

const ProductPage = async ({
  params,
}: {
  params: { orderId: string; storeId: string };
}) => {
  const order = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
      storeId: params.storeId
    },include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
  });

  if (!order) {
     redirect('/sign-in');
  }
  
  const orderDetails: OrderCol = {
    id: order?.id ?? 'N/A',
    phone: order?.phone ?? 'N/A',
    address: order?.address ?? 'N/A',
    isPaid: order?.isPaid ?? false,
    createdAt: order ? format(new Date(order.createdAt), 'MMMM do, yyyy') : 'N/A',
    products: order
      ? order.orderItems.map((orderItem) => ({
          name: orderItem.product.name,
          price: formatter.format(Number(orderItem.product.price)),
        }))
      : [],
  };


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
      <OrderClient data={orderDetails} />
      </div>
    </div>
  );
};

export default ProductPage;
