"use client"

import { ColumnDef } from "@tanstack/react-table"

export type OrderCol = {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  createdAt: string;
  products: { name: string; price: string }[];
};

export type Col = {
  name: string;
  price: string;
};

export type AddressCol = {
  phone: string;
  address: string;
  isPaid: boolean;
  createdAt: string;
};


export const columns: ColumnDef<Col>[] = [
  {
    accessorKey: "name",
    header: "Products",
  },
  {
    accessorKey: "price",
    header: "Price",
  },

];

export const Addresscolumns: ColumnDef<AddressCol>[] = [
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },

];
