"use client";

import { LuPlus as Plus } from "react-icons/lu";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiAlert } from "@/components/ui/api-alert";

import { columns, CountyColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface CountiesClientProps {
  data: CountyColumn[];
}

export const CountiesClient: React.FC<CountiesClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Counties (${data.length})`}
          description="Manage counties for your store"
        />
        <Button onClick={() => router.push(`/${params.storeId}/counties/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Counties" />
      <Separator />
      <ApiList entityName="counties" entityIdName="countyId" />
    </>
  );
};
