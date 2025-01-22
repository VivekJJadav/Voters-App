"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import LoadingSpinner from "./LoadingSpinner";

interface SelectorProps {
  placeholder?: string;
  values: { id: string; name: string }[];
  loading?: boolean;
}

const SelectorForm = ({ placeholder, values, loading }: SelectorProps) => {
  const { setSelectedOrgId } = useSelectedOrganization();

  const form = useForm<{ selectedOrganization: string }>({
    defaultValues: { selectedOrganization: "" },
  });

  const onSubmit = (data: { selectedOrganization: string }) => {
    setSelectedOrgId(data.selectedOrganization);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="selectedOrganization"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.handleSubmit((data) => {
                    onSubmit(data);
                    form.reset({ selectedOrganization: "" });
                  })();
                }}
              >
                <FormControl>
                  <SelectTrigger className="text-black bg-white/50 border-blue-600 rounded-lg w-56">
                    <SelectValue
                      placeholder={placeholder || "Select an organization"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : values.length === 0 ? (
                    <p className="text-sm">No result found.</p>
                  ) : (
                    values.map((value) => (
                      <SelectItem key={value.id} value={value.id}>
                        {value.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default SelectorForm;
