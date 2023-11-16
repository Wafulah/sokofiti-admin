import prismadb from "@/lib/prismadb";


import { redirect } from 'next/navigation';

export const getStockCount = async (storeId: string) => {
    
  if (storeId !== process.env.NEXT_PUBLIC_ADMIN) {
    redirect('/sign-in');
  }
  
  const stockCount = await prismadb.product.count({
    where: {
     
      isArchived: false,
    }
  });

  return stockCount;
};
