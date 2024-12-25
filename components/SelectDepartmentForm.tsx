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

interface SelectDepartmentFormProps {
  placeholder?: string;
  values: { id: string; name: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

const SelectDepartmentForm = ({
  placeholder,
  values,
  value,
  onChange,
}: SelectDepartmentFormProps) => {
  const form = useForm<{ selectedDepartment: string }>({
    defaultValues: { selectedDepartment: value || "" },
  });

  const onSubmit = (data: { selectedDepartment: string }) => {
    if (onChange) {
      onChange(data.selectedDepartment);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="selectedDepartment"
          render={({ field }) => (
            <FormItem>
              <Select
                value={value}
                onValueChange={(newValue) => {
                  field.onChange(newValue);
                  form.handleSubmit((data) => {
                    onSubmit(data);
                    form.reset({ selectedDepartment: newValue });
                  })();
                }}
              >
                <FormControl>
                  <SelectTrigger className="text-black bg-white/50 border-blue-600 rounded-lg">
                    <SelectValue placeholder={placeholder || "Select an option"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {values.map((value) => (
                    <SelectItem key={value.id} value={value.id}>
                      {value.name}
                    </SelectItem>
                  ))}
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

export default SelectDepartmentForm;