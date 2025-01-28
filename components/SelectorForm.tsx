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
import { useCallback } from "react";

interface SelectorProps {
  placeholder?: string;
  values: { id: string; name: string }[];
  loading?: boolean;
  value?: string | null;
  onChange?: (value: string) => void;
}

const SelectorForm = ({
  placeholder,
  values,
  loading,
  value,
  onChange,
}: SelectorProps) => {
  const { setSelectedOrgId } = useSelectedOrganization();

  const form = useForm<{ selectedOrganization: string }>({
    defaultValues: {
      selectedOrganization: value || "",
    },
  });

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (newValue) {
        setSelectedOrgId(newValue);
        onChange?.(newValue);
      }
    },
    [setSelectedOrgId, onChange]
  );

  const currentValue =
    value && values.some((org) => org.id === value) ? value : undefined;

  return (
    <Form {...form}>
      <form className="w-full space-y-6">
        <FormField
          control={form.control}
          name="selectedOrganization"
          render={({ field }) => (
            <FormItem>
              <Select value={currentValue} onValueChange={handleValueChange}>
                <FormControl>
                  <SelectTrigger className="text-black bg-white/50 border-blue-600 rounded-lg w-56">
                    <SelectValue
                      placeholder={placeholder || "Select an organization"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <div className="flex justify-center p-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : values.length === 0 ? (
                    <p className="text-sm p-2">No result found.</p>
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
