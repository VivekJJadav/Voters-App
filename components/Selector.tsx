"use client";

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
  return (
    <Select>
      <SelectTrigger className="text-black bg-white/50 border-blue-600 file:rounded-lg">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {values.map((value, index) => (
          <SelectItem key={index} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Selector;
