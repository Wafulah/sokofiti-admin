"use client";

import * as React from "react";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { LuTrash2 as Trash } from "react-icons/lu";
import { Store, Image, Category, County } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";
import ImageUpload from "@/components/ui/image-upload";

const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5).nullable(),
  categories: z.array(z.object({ id: z.string() })),
  counties: z.array(z.object({ id: z.string() })),
  images: z.object({ url: z.string() }).array(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  initialData: Store & {
    images: Image[];
  };
  counties: County[];
  categories: Category[];
}

type Checked = DropdownMenuCheckboxItemProps["checked"];

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData,
  categories,
  counties,
}) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  type Position = {
    coords: {
      latitude: number;
      longitude: number;
    };
  };

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success("Store updated.");
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Store deleted.");
    } catch (error: any) {
      toast.error("Make sure you removed all products and categories first.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title="Store settings"
          description="Manage store preferences"
        />
        <Button
          disabled={loading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value.map((image) => image.url)}
                    disabled={loading}
                    onChange={(url) =>
                      field.onChange([...field.value, { url }])
                    }
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter((current) => current.url !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Store name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Location</FormLabel>
                    <FormDescription>
                      Flip Switch to Update your location
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value !== null ? !!field.value : false}
                      onCheckedChange={async (checked) => {
                        field.onChange(checked ? 1 : 0); // Update the switch state

                        if (checked) {
                          // If the switch is turned on, get the user's location
                          if (navigator.geolocation) {
                            try {
                              const position: Position =
                                await new Promise<Position>(
                                  (resolve, reject) => {
                                    navigator.geolocation.getCurrentPosition(
                                      (position) => resolve(position),
                                      (error) => reject(error)
                                    );
                                  }
                                );

                              const userLatitude: number =
                                position.coords.latitude;
                              const userLongitude: number =
                                position.coords.longitude;

                              // Update the form data with the new latitude and longitude
                              form.setValue("latitude", userLatitude);
                              form.setValue("longitude", userLongitude);
                              toast.success("Location Updated Successfully");
                            } catch (error: any) {
                              toast.error("Error obtaining geolocation:");
                              console.error(
                                "Error obtaining geolocation:",
                                error
                              );
                            }
                          } else {
                            toast.error(
                              "Geolocation is not supported by your browser."
                            );
                            console.error(
                              "Geolocation is not supported by your browser."
                            );
                          }
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="counties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County</FormLabel>
                  <FormControl>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Select</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {counties.map((county) => (
                          <DropdownMenuCheckboxItem
                            key={county.id}
                            checked={(field.value || []).some(
                              (selectedCounty) =>
                                selectedCounty.id === county.id
                            )}
                            onCheckedChange={(checked) => {
                              const updatedValue = checked
                                ? [...(field.value || []), county]
                                : (field.value || []).filter(
                                    (selectedCounty) =>
                                      selectedCounty.id !== county.id
                                  );
                              field.onChange(updatedValue);
                            }}
                          >
                            {county.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Select</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {categories.map((category) => (
                          <DropdownMenuCheckboxItem
                            key={category.id}
                            checked={(field.value || []).some(
                              (selectedCategory) =>
                                selectedCategory.id === category.id
                            )}
                            onCheckedChange={(checked) => {
                              const updatedValue = checked
                                ? [...(field.value || []), category]
                                : (field.value || []).filter(
                                    (selectedCategory) =>
                                      selectedCategory.id !== category.id
                                  );
                              field.onChange(updatedValue);
                            }}
                          >
                            {category.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="Product description"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        variant="public"
        description={`${origin}/api/${params.storeId}`}
      />
    </>
  );
};
