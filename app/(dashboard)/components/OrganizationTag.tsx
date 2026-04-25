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
        "min-h-16 cursor-pointer rounded-lg border px-4 py-3 transition-all duration-200",
        "border-white/12 bg-white/[0.07] text-white/75 shadow-sm",
        "hover:border-white/24 hover:bg-white/[0.11] hover:text-white hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9cf7]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#211a52]",
        isSelected &&
          "border-[#8b9cf7]/60 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-[0_10px_26px_rgba(102,126,234,0.24)]",
        className,
        isSelected && selectedClassName
      )}
      aria-current={isSelected ? "true" : undefined}
    >
      <div className="flex h-full items-center justify-between">
        <h3 className="truncate pr-2 text-base font-semibold">{org.name}</h3>
      </div>
    </li>
  );
};

export default OrganizationTag;
