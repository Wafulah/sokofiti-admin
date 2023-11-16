import prismadb from "@/lib/prismadb";

import { redirect } from "next/navigation";

export const getSalesCount = async (storeId: string) => {
  if (storeId !== process.env.NEXT_PUBLIC_ADMIN) {
    redirect("/sign-in");
  }

  const salesCount = await prismadb.order.count({
    where: {
      isPaid: true,
    },
  });

  return salesCount;
};
