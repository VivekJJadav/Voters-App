import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import { cn } from "@/lib/utils";
import { Organization } from "@prisma/client";
import { ComponentPropsWithoutRef } from "react";

type OrganizationTagProps = ComponentPropsWithoutRef<"li"> & {
  org: Organization;
  selectedClassName?: string;
};

const OrganizationTag = ({
  org,
  className,
  selectedClassName,
  ...props
}: OrganizationTagProps) => {
  const { selectedOrgId, setSelectedOrgId } = useSelectedOrganization();
  const isSelected = selectedOrgId === org.id;

  return (
    <li
      {...props}
      role="button"
      tabIndex={0}
      onClick={() => setSelectedOrgId(org.id)}
      onKeyDown={(e) => e.key === "Enter" && setSelectedOrgId(org.id)}
      className={cn(
        "cursor-pointer p-4 rounded-lg border transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500",
        "border-gray-200 bg-white text-gray-800",
        isSelected && "bg-gray-800 border-gray-900 text-white",
        className,
        isSelected && selectedClassName
      )}
      aria-current={isSelected ? "true" : undefined}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium truncate pr-2">{org.name}</h3>
      </div>
    </li>
  );
};

export default OrganizationTag;