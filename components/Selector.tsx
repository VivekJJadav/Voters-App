"use client";

import useGetOrganizations from "@/app/actions/useGetOrganizations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectorProps {
  values: string[];
  placeholder?: string;
}

const Selector = ({ values, placeholder }: SelectorProps) => {
  const { organizations, loading, error } =
    useGetOrganizations();

  return (
    <Select>
      <SelectTrigger className="text-black bg-white/50 border-blue-600 file:rounded-lg">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.name}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Selector;
