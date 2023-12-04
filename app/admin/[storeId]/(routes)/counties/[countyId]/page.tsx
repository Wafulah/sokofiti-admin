import prismadb from "@/lib/prismadb";

import { CountyForm } from "./components/county-form";

const CountyPage = async ({
  params,
}: {
  params: { countyId: string; storeId: string };
}) => {
  const county = await prismadb.county.findUnique({
    where: {
      id: params.countyId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CountyForm initialData={county} />
      </div>
    </div>
  );
};

export default CountyPage;
