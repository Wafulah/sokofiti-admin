"use client";

import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { Addresscolumns,columns, OrderCol } from "./columns";

interface OrderClientProps {
  data: OrderCol;
}

export const OrderClient: React.FC<OrderClientProps> = ({
  data
}) => {

  const newOrderData = [{
    phone: data.phone,
    address: data.address,
    isPaid: data.isPaid,
    createdAt: data.createdAt,
  }];

  return (
    <>
      <Heading title={`Orders (${data.id})`} description="Manage orders for your store" />
      <Separator />
      
      <DataTable searchKey="product" columns={Addresscolumns} data={newOrderData} />
      <DataTable searchKey="product" columns={columns} data={data.products} />
    </>
  );
};
