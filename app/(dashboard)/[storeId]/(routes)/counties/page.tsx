import { format } from "date-fns";
import { redirect } from 'next/navigation';
import prismadb from "@/lib/prismadb";

import { CountyColumn } from "./components/columns"
import { CountiesClient } from "./components/client";

const CountiesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  
  if (params.storeId !== process.env.NEXT_PUBLIC_ADMIN) {
    redirect('/sign-in');
  }
  const counties = await prismadb.county.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedCounties: CountyColumn[] = counties.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CountiesClient data={formattedCounties} />
      </div>
    </div>
  );
};

export default CountiesPage;
